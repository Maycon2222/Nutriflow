import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/app/api/_helpers";
import { prisma } from "@/database/prisma";
import { requireCurrentUser } from "@/services/session-service";
import { formatDateTime } from "@/utils/date";

const statusLabel = {
  SCHEDULED: "Agendada",
  CANCELED: "Cancelada",
  COMPLETED: "Concluida",
} as const;

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await params;

    const appointment = await prisma.appointment.findFirst({
      where: { id, userId: user.id },
      include: {
        patient: {
          select: { fullName: true, phone: true, email: true },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Agendamento nao encontrado." }, { status: 404 });
    }

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const width = page.getWidth();
    const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    page.drawRectangle({
      x: 40,
      y: 760,
      width: width - 80,
      height: 52,
      color: rgb(0.04, 0.58, 0.48),
    });

    page.drawText("Comprovante de Agendamento", {
      x: 52,
      y: 787,
      size: 17,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText(`NutriAcademy - ${formatDateTime(new Date())}`, {
      x: 52,
      y: 772,
      size: 10,
      font: fontRegular,
      color: rgb(1, 1, 1),
    });

    let y = 725;

    const rows: Array<[string, string]> = [
      ["Profissional", user.name],
      ["Paciente", appointment.patient.fullName],
      ["Telefone", appointment.patient.phone],
      ["E-mail", appointment.patient.email ?? "Nao informado"],
      ["Data da consulta", formatDateTime(appointment.scheduledAt)],
      ["Status", statusLabel[appointment.status]],
      ["Observacoes", appointment.notes ?? "Sem observacoes"],
    ];

    for (const [label, value] of rows) {
      page.drawText(`${label}:`, {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      page.drawText(value, {
        x: 170,
        y,
        size: 11,
        font: fontRegular,
        color: rgb(0.2, 0.2, 0.2),
        maxWidth: width - 220,
        lineHeight: 13,
      });
      y -= 24;
    }

    page.drawText("Documento gerado automaticamente pela plataforma.", {
      x: 50,
      y: 80,
      size: 9,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });

    const bytes = await pdf.save();
    const normalized = Uint8Array.from(Array.from(bytes));
    const body = normalized.buffer;
    const fileName = `agendamento-${appointment.patient.fullName.replace(/\s+/g, "-").toLowerCase()}.pdf`;

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
