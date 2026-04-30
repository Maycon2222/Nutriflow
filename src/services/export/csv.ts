import { prisma } from "@/database/prisma";

export async function buildPatientsCsv(userId: string) {
  const patients = await prisma.patient.findMany({
    where: { userId },
    orderBy: { fullName: "asc" },
  });

  const header = "nome,telefone,email,objetivo,status,peso_atual,altura,atualizado_em";
  const rows = patients.map((patient) =>
    [
      patient.fullName,
      patient.phone,
      patient.email ?? "",
      patient.objective,
      patient.status,
      String(patient.currentWeight),
      String(patient.heightCm),
      patient.updatedAt.toISOString(),
    ]
      .map((value) => `"${value.replace(/"/g, '""')}"`)
      .join(","),
  );

  return [header, ...rows].join("\n");
}
