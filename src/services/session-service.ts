import { prisma } from "@/database/prisma";
import { getCurrentUser } from "@/utils/auth";

export async function requireCurrentUser() {
  const session = await getCurrentUser();
  if (!session?.userId) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, emailVerifiedAt: true },
  });

  if (!user) throw new Error("UNAUTHORIZED");

  return user;
}
