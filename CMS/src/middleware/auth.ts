import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../configuration/config";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers["authorization"];
  if (!header || typeof header !== "string" || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // console.log({ header });
  const token = header.slice(7);
  // console.log({ token });
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.user = {
      id:
        typeof decoded.sub === "string"
          ? parseInt(decoded.sub, 10)
          : decoded.sub,
      roles: Array.isArray(decoded.roles) ? decoded.roles : [],
      sid: decoded.sid,
    } as any;
    // console.log({ decoded });
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const roles = (req.user as any)!.roles || [];
    console.log({ roles, role });
    if (!roles.includes(role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  };
}
