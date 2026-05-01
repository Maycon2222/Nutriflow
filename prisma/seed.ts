import {
  PrismaClient,
  Sex,
  PatientObjective,
  PatientStatus,
  ActivityLevel,
  AppointmentStatus,
  EnergyFormula,
  MacroMethod,
  RecipeType,
  SkinfoldProtocol,
  UserRole,
} from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@local.test";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "change-me";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Dra. Nutricionista",
      email: adminEmail,
      passwordHash: hashSync(adminPassword, 10),
      role: UserRole.ADMIN,
      emailVerifiedAt: new Date(),
    },
  });

  const existing = await prisma.patient.count({ where: { userId: admin.id } });
  if (existing > 0) return;

  const patient = await prisma.patient.create({
    data: {
      userId: admin.id,
      fullName: "Mariana Oliveira",
      birthDate: new Date("1993-06-18"),
      sex: Sex.FEMALE,
      phone: "(11) 99999-1111",
      email: "mariana@email.com",
      profession: "Designer",
      objective: PatientObjective.WEIGHT_LOSS,
      objectiveTags: "emagrecimento,saude-metabolica",
      heightCm: 165,
      currentWeight: 78.5,
      desiredWeight: 70,
      generalNotes: "Relata dificuldade em manter rotina de refeicoes.",
      tags: "endometriose,home-office",
      status: PatientStatus.ACTIVE,
    },
  });

  await prisma.anamnesis.create({
    data: {
      patientId: patient.id,
      version: 1,
      mainComplaint: "Cansaco durante o dia e compulsao noturna.",
      nutritionGoal: "Emagrecimento com manutencao de massa magra.",
      diseaseHistory: "Resistencia insulinica.",
      medications: "Metformina.",
      foodAllergies: "Nenhuma.",
      foodIntolerances: "Lactose leve.",
      familyHistory: "Diabetes tipo 2.",
      eatingRoutine: "Pula cafe da manha com frequencia.",
      mealsPerDay: 3,
      waterIntakeLiters: 1.3,
      alcoholConsumption: "Social nos finais de semana.",
      smoking: "Nao.",
      physicalActivity: "Caminhada e musculacao.",
      physicalActivityFrequency: "4x por semana.",
      trainingType: "Musculacao leve/moderada.",
      foodPreferences: "Frutas e preparacoes praticas.",
      dislikedFoods: "Figado e couve-flor.",
      dietaryRestrictions: "Baixa lactose.",
      bowelFunction: "Constipacao eventual.",
      generalObservations: "Dorme tarde por uso de telas.",
    },
  });

  await prisma.energyCalculation.create({
    data: {
      patientId: patient.id,
      age: 32,
      sex: Sex.FEMALE,
      weightKg: 78.5,
      heightCm: 165,
      activityLevel: ActivityLevel.MODERATE,
      objective: PatientObjective.WEIGHT_LOSS,
      formula: EnergyFormula.MIFFLIN_ST_JEOR,
      macroMethod: MacroMethod.PERCENTAGE,
      carbInput: 40,
      proteinInput: 30,
      fatInput: 30,
      carbsGrams: 181.57,
      proteinGrams: 136.18,
      fatGrams: 60.52,
      carbsKcal: 726.27,
      proteinKcal: 544.7,
      fatKcal: 544.7,
      basalMetabolism: 1464.25,
      activityFactor: 1.55,
      totalEnergySpend: 2269.59,
      suggestedKcal: 1815.67,
      explanation:
        "TMB pelo metodo Mifflin-St Jeor, fator moderado e deficit calorico de 20%.",
    },
  });

  await prisma.consultation.create({
    data: {
      patientId: patient.id,
      appointmentDate: new Date(),
      dayWeight: 78.5,
      bodyMeasurements: JSON.stringify([
        { type: "WAIST", value: 89, unit: "cm" },
        { type: "HIP", value: 105, unit: "cm" },
      ]),
      observations: "Boa adesao inicial.",
      patientEvolution: "Reduziu consumo de ultraprocessados.",
      nutritionPlan: "Ajuste proteico e hidratacao.",
      nextReturnDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
    },
  });

  await prisma.anthropometricAssessment.create({
    data: {
      userId: admin.id,
      patientId: patient.id,
      assessmentDate: new Date(),
      protocol: SkinfoldProtocol.POLLOCK_7,
      foldsJson: JSON.stringify({
        chest: 16,
        midaxillary: 18,
        triceps: 20,
        subscapular: 18,
        abdomen: 28,
        suprailiac: 21,
        thigh: 30,
      }),
      sumOfFolds: 151,
      bodyDensity: 1.029,
      bodyFatPercent: 31.0,
      leanMassKg: 54.2,
      bodyWeightKg: 78.5,
      notes: "Avaliacao inicial de composicao corporal.",
    },
  });

  await prisma.appointment.create({
    data: {
      userId: admin.id,
      patientId: patient.id,
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      status: AppointmentStatus.SCHEDULED,
      notes: "Retorno para ajuste do plano alimentar.",
    },
  });

  await prisma.recipe.createMany({
    data: [
      {
        userId: admin.id,
        title: "Bowl de frango com arroz integral",
        type: RecipeType.LUNCH,
        servings: 1,
        kcal: 520,
        carbs: 58,
        proteins: 38,
        fats: 14,
        ingredients: "120g frango grelhado, 100g arroz integral, legumes refogados, azeite.",
        preparation: "Grelhar o frango, cozinhar o arroz e montar com legumes salteados.",
        notes: "Opcao pratica para almoco de rotina.",
      },
      {
        userId: admin.id,
        title: "Iogurte com frutas e aveia",
        type: RecipeType.MORNING_SNACK,
        servings: 1,
        kcal: 280,
        carbs: 36,
        proteins: 14,
        fats: 8,
        ingredients: "170g iogurte natural, 1 banana pequena, 20g aveia, canela.",
        preparation: "Misturar todos os ingredientes em um bowl e servir gelado.",
        notes: "Lanche rapido para meio da manha.",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
