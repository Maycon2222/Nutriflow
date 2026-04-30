import { PatientObjective } from "@prisma/client";
import { prisma } from "@/database/prisma";

type PatientListFilters = {
  userId: string;
  search?: string;
  objective?: PatientObjective | "ALL";
  sort?: "name" | "createdAt" | "updatedAt";
};

export async function listPatients({
  userId,
  search = "",
  objective = "ALL",
  sort = "updatedAt",
}: PatientListFilters) {
  const normalizedSearch = search.trim();
  const objectiveCandidates: PatientObjective[] = [];

  const objectiveTokens: Array<[PatientObjective, string[]]> = [
    [PatientObjective.WEIGHT_LOSS, ["emagrecimento", "emagrecer", "perda", "weight loss"]],
    [PatientObjective.HYPERTROPHY, ["hipertrofia", "massa", "ganho"]],
    [PatientObjective.MAINTENANCE, ["manutencao", "manter"]],
    [PatientObjective.HEALTH, ["saude", "health"]],
    [PatientObjective.PERFORMANCE, ["performance", "desempenho"]],
    [PatientObjective.OTHER, ["outro"]],
  ];

  const lower = normalizedSearch.toLowerCase();
  objectiveTokens.forEach(([enumValue, tokens]) => {
    if (tokens.some((token) => lower.includes(token))) {
      objectiveCandidates.push(enumValue);
    }
  });

  return prisma.patient.findMany({
    where: {
      userId,
      ...(objective !== "ALL" ? { objective } : {}),
      ...(normalizedSearch
        ? {
            OR: [
              { fullName: { contains: normalizedSearch } },
              { phone: { contains: normalizedSearch } },
              { objectiveTags: { contains: normalizedSearch } },
              { tags: { contains: normalizedSearch } },
              ...(objectiveCandidates.length ? [{ objective: { in: objectiveCandidates } }] : []),
            ],
          }
        : {}),
    },
    orderBy:
      sort === "name"
        ? { fullName: "asc" }
        : sort === "createdAt"
          ? { createdAt: "desc" }
          : { updatedAt: "desc" },
  });
}

export async function getPatientById(userId: string, patientId: string) {
  return prisma.patient.findFirst({
    where: { id: patientId, userId },
    include: {
      anamneses: { orderBy: { createdAt: "desc" } },
      calculations: { orderBy: { createdAt: "desc" } },
      consultations: { orderBy: { appointmentDate: "desc" } },
      appointments: { orderBy: { scheduledAt: "desc" }, take: 5 },
      assessments: { orderBy: { assessmentDate: "asc" } },
    },
  });
}
