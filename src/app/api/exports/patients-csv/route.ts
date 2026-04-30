import { NextResponse } from "next/server";
import { buildPatientsCsv } from "@/services/export/csv";
import { requireCurrentUser } from "@/services/session-service";
import { apiError } from "@/app/api/_helpers";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const csv = await buildPatientsCsv(user.id);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="pacientes.csv"',
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
