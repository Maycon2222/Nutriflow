import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/prisma";
import { requireCurrentUser } from "@/services/session-service";
import { patientSchema } from "@/utils/validation";
import { apiError } from "@/app/api/_helpers";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const patients = await prisma.patient.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(patients);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireCurrentUser();
    const body = await request.json();
    const parsed = patientSchema.parse(body);

    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        ...parsed,
        birthDate: new Date(parsed.birthDate),
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
