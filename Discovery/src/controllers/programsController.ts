import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export async function getProgramById(
  req: Request,
  res: Response
): Promise<void> {
  const idParam = req.params["id"];

  if (!idParam) {
    res.status(400).json({ message: "Missing path parameter 'id'" });
    return;
  }

  const id = BigInt(idParam);

  const program = await prisma.program.findUnique({ where: { id } });

  if (!program) {
    res.status(404).json({ message: "Program not found" });
    return;
  }

  res.json(program);
  return;
}
