import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type PlanPdfData = {
  patientName: string;
  objective: string;
  objectiveTags: string[];
  latestCalculation?: {
    formula: string;
    suggestedKcal: number;
    carbsGrams: number;
    proteinGrams: number;
    fatGrams: number;
    explanation: string;
  } | null;
  latestConsultationNotes?: string | null;
  latestAnamneseNotes?: string | null;
};

function formatPtDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export async function generatePlanPdf(data: PlanPdfData) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const width = page.getWidth();

  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;

  page.drawRectangle({
    x: 40,
    y: 765,
    width: width - 80,
    height: 50,
    color: rgb(0.06, 0.58, 0.53),
  });

  page.drawText("Plano Alimentar - NutriAcademy", {
    x: 52,
    y: 785,
    size: 17,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`Gerado em ${formatPtDate(new Date())}`, {
    x: 52,
    y: 772,
    size: 10,
    font: fontRegular,
    color: rgb(1, 1, 1),
  });

  y = 735;
  page.drawText(`Paciente: ${data.patientName}`, { x: 50, y, size: 12, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  y -= 18;
  page.drawText(`Objetivo principal: ${data.objective}`, { x: 50, y, size: 11, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
  y -= 16;
  page.drawText(`Tags de objetivo: ${data.objectiveTags.length ? data.objectiveTags.join(", ") : "Sem tags"}`, {
    x: 50,
    y,
    size: 11,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });

  y -= 30;
  page.drawText("Resumo energetico", { x: 50, y, size: 13, font: fontBold, color: rgb(0.06, 0.58, 0.53) });
  y -= 18;

  if (data.latestCalculation) {
    page.drawText(`Formula: ${data.latestCalculation.formula}`, { x: 50, y, size: 11, font: fontRegular });
    y -= 15;
    page.drawText(`Calorias sugeridas: ${data.latestCalculation.suggestedKcal.toFixed(0)} kcal`, { x: 50, y, size: 11, font: fontRegular });
    y -= 15;
    page.drawText(
      `Macros (g): CHO ${data.latestCalculation.carbsGrams.toFixed(1)} | PTN ${data.latestCalculation.proteinGrams.toFixed(1)} | FAT ${data.latestCalculation.fatGrams.toFixed(1)}`,
      { x: 50, y, size: 11, font: fontRegular },
    );
    y -= 15;
    page.drawText(`Observacao tecnica: ${data.latestCalculation.explanation}`, {
      x: 50,
      y,
      size: 10,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
      maxWidth: width - 100,
      lineHeight: 12,
    });
    y -= 35;
  } else {
    page.drawText("Sem calculo energetico registrado.", { x: 50, y, size: 11, font: fontRegular });
    y -= 24;
  }

  page.drawText("Observacoes clinicas", { x: 50, y, size: 13, font: fontBold, color: rgb(0.06, 0.58, 0.53) });
  y -= 18;

  page.drawText(`Consulta: ${data.latestConsultationNotes || "Sem observacoes"}`, {
    x: 50,
    y,
    size: 10,
    font: fontRegular,
    maxWidth: width - 100,
    lineHeight: 12,
  });
  y -= 38;

  page.drawText(`Anamnese: ${data.latestAnamneseNotes || "Sem observacoes"}`, {
    x: 50,
    y,
    size: 10,
    font: fontRegular,
    maxWidth: width - 100,
    lineHeight: 12,
  });

  return doc.save();
}

