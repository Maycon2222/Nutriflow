import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/app/api/_helpers";
import { prisma } from "@/database/prisma";
import { requireCurrentUser } from "@/services/session-service";
import { generatePlanPdf } from "@/services/export/pdf";
import { objectiveLabel, energyFormulaLabel } from "@/utils/labels";
import { parseCsvTags } from "@/utils/tags";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await params;

    const patient = await prisma.patient.findFirst({
      where: { id, userId: user.id },
      include: {
        calculations: { orderBy: { createdAt: "desc" }, take: 1 },
        consultations: { orderBy: { appointmentDate: "desc" }, take: 1 },
        anamneses: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Paciente nao encontrado." }, { status: 404 });
    }

    const latestCalc = patient.calculations[0];
    const pdfBytes = await generatePlanPdf({
      patientName: patient.fullName,
      objective: objectiveLabel[patient.objective],
      objectiveTags: parseCsvTags(patient.objectiveTags),
      latestCalculation: latestCalc
        ? {
            formula: energyFormulaLabel[latestCalc.formula],
            suggestedKcal: latestCalc.suggestedKcal,
            carbsGrams: latestCalc.carbsGrams,
            proteinGrams: latestCalc.proteinGrams,
            fatGrams: latestCalc.fatGrams,
            explanation: latestCalc.explanation,
          }
        : null,
      latestConsultationNotes: patient.consultations[0]?.nutritionPlan ?? patient.consultations[0]?.observations,
      latestAnamneseNotes: patient.anamneses[0]?.generalObservations,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=\"plano-${patient.fullName.replace(/\s+/g, "-").toLowerCase()}.pdf\"`,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
