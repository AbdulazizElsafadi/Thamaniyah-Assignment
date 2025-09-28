import { Request, Response } from "express";
import { PrismaClient, UserRole } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function listUsers(_req: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, roles: true },
  });
  res.json(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      roles: u.roles.map((r) => r.role),
    }))
  );
}

export async function getUser(req: Request, res: Response) {
  const idParam = req.params?.["id"];
  if (!idParam)
    return res.status(400).json({ error: "Missing path parameter 'id'" });
  const id = Number.parseInt(String(idParam), 10);
  if (Number.isNaN(id))
    return res.status(400).json({ error: "Invalid 'id' format" });
  const user = await prisma.user.findUnique({
    where: { id },
    include: { roles: true },
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles.map((r) => r.role),
  });
}

export async function getMyself(req: Request, res: Response) {
  console.log("getMyself");
  const id = req.user!.id;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { roles: true },
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles.map((r) => r.role),
  });
}

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
  roles: z.array(z.nativeEnum(UserRole)).optional(),
});

export async function createUser(req: Request, res: Response) {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parsed.error.flatten() });
  }
  const { name, email, password, roles } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });
  if (roles && roles.length) {
    await prisma.usersRoles.createMany({
      data: roles.map((r) => ({ userId: user.id, role: r })),
    });
  }
  const withRoles = await prisma.user.findUnique({
    where: { id: user.id },
    include: { roles: true },
  });
  return res.status(201).json({
    id: withRoles!.id,
    name: withRoles!.name,
    email: withRoles!.email,
    roles: withRoles!.roles.map((r) => r.role),
  });
}

const setRolesSchema = z.object({
  roles: z.array(z.nativeEnum(UserRole)).min(1),
});

export async function setUserRoles(req: Request, res: Response) {
  const idParam = req.params?.["id"];
  if (!idParam)
    return res.status(400).json({ error: "Missing path parameter 'id'" });
  const id = Number.parseInt(String(idParam), 10);
  if (Number.isNaN(id))
    return res.status(400).json({ error: "Invalid 'id' format" });
  const parsed = setRolesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parsed.error.flatten() });
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: "User not found" });

  await prisma.usersRoles.deleteMany({ where: { userId: id } });
  await prisma.usersRoles.createMany({
    data: parsed.data.roles.map((r) => ({ userId: id, role: r })),
  });
  const withRoles = await prisma.user.findUnique({
    where: { id },
    include: { roles: true },
  });
  return res.json({
    id: withRoles!.id,
    roles: withRoles!.roles.map((r) => r.role),
  });
}
