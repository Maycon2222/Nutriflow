import { prisma } from "@/database/prisma";

export async function listUpcomingReturns(userId: string) {
  return prisma.consultation.findMany({
    where: {
      patient: { userId },
      nextReturnDate: { not: null },
    },
    include: {
      patient: {
        select: { id: true, fullName: true },
      },
    },
    orderBy: { nextReturnDate: "asc" },
    take: 20,
  });
}
