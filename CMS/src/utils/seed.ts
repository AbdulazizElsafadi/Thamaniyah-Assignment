import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function seedInitialUser(): Promise<void> {
  const email = "test@gmail.com";
  const existing = await prisma.user.findUnique({
    where: { email },
    include: { roles: true },
  });

  // If user exists but doesn't have admin role, add it
  if (existing) {
    const hasAdminRole = existing.roles.some(
      (role) => role.role === UserRole.admin
    );
    if (!hasAdminRole) {
      await prisma.usersRoles.create({
        data: {
          userId: existing.id,
          role: UserRole.admin,
        },
      });
    }
    return;
  }

  const passwordHash = await bcrypt.hash("Ss@123456", 12);
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email,
      passwordHash,
    },
  });

  // Add admin role to the created user
  await prisma.usersRoles.create({
    data: {
      userId: user.id,
      role: UserRole.admin,
    },
  });
}
