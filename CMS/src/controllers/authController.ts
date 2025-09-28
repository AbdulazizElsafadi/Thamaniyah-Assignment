import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import config from "../configuration/config";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

function signAccessToken(payload: object): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

function signRefreshToken(payload: object): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
}

export async function login(req: Request, res: Response) {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parseResult.error.flatten() });
  }
  const { email, password } = parseResult.data;
  console.log({ email, password });
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: true },
  });
  console.log({ user });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  console.log({ "user password:": user.passwordHash, password });
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const sessionId = uuidv4();

  const accessToken = signAccessToken({
    sub: user.id,
    roles: user.roles.map((r) => r.role),
    sid: sessionId,
  });
  const refreshToken = signRefreshToken({ sub: user.id, sid: sessionId });

  const refreshExpiresAt = dayjs()
    .add(config.jwt.refreshExpiresIn, "second")
    .toDate();

  const refreshHash = await bcrypt.hash(refreshToken, 12);

  await prisma.usersSessions.create({
    data: {
      id: sessionId,
      userId: user.id,
      refreshHash: refreshHash,
      expiresAt: refreshExpiresAt,
    },
  });

  return res.status(200).json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((r) => r.role),
    },
  });
}

export async function refreshToken(req: Request, res: Response) {
  const token =
    (req.body && req.body.refreshToken) ||
    req.headers["x-refresh-token"] ||
    null;
  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Missing refresh token" });
  }
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    const sessionId: string = decoded.sid;
    const userId: number = decoded.sub;

    const session = await prisma.usersSessions.findUnique({
      where: { id: sessionId },
    });
    if (
      !session ||
      session.userId !== userId ||
      session.revokedAt ||
      session.expiresAt < new Date()
    ) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const matches = await bcrypt.compare(token, session.refreshHash);
    if (!matches) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Rotate token: revoke old session, create new
    const newSessionId = uuidv4();
    await prisma.usersSessions.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const newAccess = signAccessToken({
      sub: user.id,
      roles: user.roles.map((r) => r.role),
      sid: newSessionId,
    });
    const newRefresh = signRefreshToken({ sub: user.id, sid: newSessionId });
    const refreshExpiresAt = dayjs()
      .add(config.jwt.refreshExpiresIn, "second")
      .toDate();
    const newHash = await bcrypt.hash(newRefresh, 12);

    await prisma.usersSessions.create({
      data: {
        id: newSessionId,
        userId: user.id,
        refreshHash: newHash,
        expiresAt: refreshExpiresAt,
      },
    });

    return res
      .status(200)
      .json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
}

export async function logout(req: Request, res: Response) {
  const authHeader = req.headers["authorization"];
  const bearer =
    authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const refresh =
    (req.body && req.body.refreshToken) ||
    req.headers["x-refresh-token"] ||
    null;

  // Best effort: revoke by session id in either token
  let sessionId: string | null = null;
  try {
    if (bearer) {
      const decoded = jwt.decode(bearer) as any;
      sessionId = decoded?.sid || null;
    }
    if (!sessionId && typeof refresh === "string") {
      const decoded = jwt.decode(refresh) as any;
      sessionId = decoded?.sid || null;
    }
  } catch {}

  if (!sessionId) {
    return res.status(200).json({ success: true });
  }

  await prisma.usersSessions.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return res.status(200).json({ success: true });
}
