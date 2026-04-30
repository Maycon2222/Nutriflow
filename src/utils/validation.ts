import {
  ActivityLevel,
  EnergyFormula,
  MacroMethod,
  PatientObjective,
  PatientStatus,
  RecipeType,
  Sex,
  SkinfoldProtocol,
  SleepQuality,
  StressLevel,
} from "@prisma/client";
import { z } from "zod";

export const authSchema = z.object({
  name: z.string().min(3, "Nome obrigatorio").optional(),
  email: z.string().email("E-mail invalido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

export const loginSchema = authSchema.pick({ email: true, password: true });

export const registerSchema = z.object({
  name: z.string().min(3, "Nome obrigatorio"),
  email: z.string().email("E-mail invalido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

export const patientSchema = z.object({
  fullName: z.string().min(3, "Nome obrigatorio"),
  birthDate: z.string().min(1, "Data de nascimento obrigatoria"),
  sex: z.nativeEnum(Sex),
  phone: z.string().min(8, "Telefone obrigatorio"),
  email: z.string().email("E-mail invalido").optional().or(z.literal("")),
  profession: z.string().optional(),
  objective: z.nativeEnum(PatientObjective),
  heightCm: z.coerce.number().positive("Altura invalida"),
  currentWeight: z.coerce.number().positive("Peso invalido"),
  desiredWeight: z.coerce.number().positive("Peso desejado invalido").optional(),
  generalNotes: z.string().optional(),
  tags: z.string().optional(),
  objectiveTags: z.string().optional(),
  status: z.nativeEnum(PatientStatus),
});

export const anamneseSchema = z.object({
  mainComplaint: z.string().optional(),
  nutritionGoal: z.string().optional(),
  diseaseHistory: z.string().optional(),
  medications: z.string().optional(),
  foodAllergies: z.string().optional(),
  foodIntolerances: z.string().optional(),
  familyHistory: z.string().optional(),
  eatingRoutine: z.string().optional(),
  mealsPerDay: z.coerce.number().min(0).optional(),
  waterIntakeLiters: z.coerce.number().min(0).optional(),
  alcoholConsumption: z.string().optional(),
  smoking: z.string().optional(),
  sleepQuality: z.nativeEnum(SleepQuality).optional(),
  stressLevel: z.nativeEnum(StressLevel).optional(),
  physicalActivity: z.string().optional(),
  physicalActivityFrequency: z.string().optional(),
  trainingType: z.string().optional(),
  foodPreferences: z.string().optional(),
  dislikedFoods: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  bowelFunction: z.string().optional(),
  generalObservations: z.string().optional(),
});

export const energyCalculationSchema = z
  .object({
    age: z.coerce.number().min(1),
    sex: z.nativeEnum(Sex),
    weightKg: z.coerce.number().positive(),
    heightCm: z.coerce.number().positive(),
    activityLevel: z.nativeEnum(ActivityLevel),
    objective: z.nativeEnum(PatientObjective),
    formula: z.nativeEnum(EnergyFormula),
    macroMethod: z.nativeEnum(MacroMethod),
    carbsInput: z.coerce.number().positive(),
    proteinInput: z.coerce.number().positive(),
    fatInput: z.coerce.number().positive(),
  })
  .superRefine((input, ctx) => {
    if (input.macroMethod === MacroMethod.PERCENTAGE) {
      const total = input.carbsInput + input.proteinInput + input.fatInput;
      if (Math.abs(total - 100) > 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "No modo percentual, carbo/proteina/gordura devem somar 100%.",
          path: ["carbsInput"],
        });
      }
    }
  });

export const consultationSchema = z.object({
  appointmentDate: z.string().min(1, "Data obrigatoria"),
  dayWeight: z.coerce.number().positive().optional(),
  bodyMeasurements: z
    .array(
      z.object({
        type: z.string().min(1),
        value: z.coerce.number().positive("Valor da medida invalido"),
        unit: z.enum(["cm", "mm", "%"]),
      }),
    )
    .optional(),
  observations: z.string().optional(),
  patientEvolution: z.string().optional(),
  nutritionPlan: z.string().optional(),
  nextReturnDate: z.string().optional(),
});

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Paciente obrigatorio"),
  scheduledAt: z.string().min(1, "Data e horario obrigatorios"),
  notes: z.string().max(400).optional(),
});

export const anthropometricSchema = z.object({
  assessmentDate: z.string().min(1, "Data da avaliacao obrigatoria"),
  protocol: z.nativeEnum(SkinfoldProtocol),
  bodyWeightKg: z.coerce.number().positive("Peso invalido"),
  age: z.coerce.number().min(1, "Idade invalida"),
  sex: z.nativeEnum(Sex),
  folds: z.record(z.string(), z.coerce.number().min(0)).refine((input) => Object.keys(input).length > 0, {
    message: "Preencha ao menos uma dobra cutanea.",
  }),
  notes: z.string().max(1000).optional(),
});

export const recipeSchema = z.object({
  title: z.string().min(3, "Titulo obrigatorio"),
  type: z.nativeEnum(RecipeType),
  servings: z.coerce.number().int().min(1, "Porcoes invalidas"),
  kcal: z.coerce.number().min(0, "Kcal invalida"),
  carbs: z.coerce.number().min(0, "Carboidratos invalidos"),
  proteins: z.coerce.number().min(0, "Proteinas invalidas"),
  fats: z.coerce.number().min(0, "Gorduras invalidas"),
  ingredients: z.string().min(5, "Descreva os ingredientes"),
  preparation: z.string().min(5, "Descreva o modo de preparo"),
  notes: z.string().max(1000).optional(),
});
