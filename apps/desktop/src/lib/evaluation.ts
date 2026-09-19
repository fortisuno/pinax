import { z } from "zod"

export interface CriteriaType {
  label: string
  value: number
}

export interface Assignment {
  description: string
}

export const assignmentDescriptionSchema = z
  .string()
  .trim()
  .min(1, "La descripción es obligatoria")
  .max(60, "Máximo 60 caracteres")

export const criteriaLabelSchema = z
  .string()
  .trim()
  .min(1, "El nombre es obligatorio")
  .max(60, "Máximo 60 caracteres")

const numericInputSchema = z
  .string()
  .transform((raw) => (raw.trim() === "" ? Number.NaN : Number(raw)))

export const criteriaQuantitySchema = numericInputSchema.pipe(
  z
    .number({ error: "Ingresa un número válido" })
    .int("Debe ser un número entero")
    .min(1, "Debe ser al menos 1")
    .max(500, "Máximo 500")
)

export const criteriaPercentageSchema = numericInputSchema.pipe(
  z
    .number({ error: "Ingresa un número válido" })
    .min(0, "Debe ser al menos 0")
    .max(100, "Máximo 100")
)

export const updateAssignmentsCriteriaSchema = z.object({
  quantity: criteriaQuantitySchema,
  percentage: criteriaPercentageSchema,
})

export const otherCriteriaSchema = z.object({
  label: criteriaLabelSchema,
  value: criteriaPercentageSchema,
})

export type UpdateAssignmentsCriteriaValues = z.infer<
  typeof updateAssignmentsCriteriaSchema
>
export type OtherCriteriaValues = z.infer<typeof otherCriteriaSchema>

export const DEFAULT_ASSIGNMENTS: Assignment[] = []

export const DEFAULT_ASSIGNMENTS_QUANTITY_CRITERIA: CriteriaType = {
  label: "Cantidad de tareas",
  value: 0,
}

export const DEFAULT_ASSIGNMENTS_PERCENTAGE_CRITERIA: CriteriaType = {
  label: "Ponderación de tareas",
  value: 100,
}

export const DEFAULT_OTHER_CRITERIA: CriteriaType[] = []

export const UNIT_BASE_WEIGHT = 70
export const UNIT_EXAM_WEIGHT = 30
export const UNIT_FINAL_VALUE = 30

export const DEFAULT_UNIT_CRITERIA: CriteriaType[] = [
  { label: "Lenguajes", value: UNIT_FINAL_VALUE },
  { label: "Saberes", value: UNIT_FINAL_VALUE },
  { label: "Delo Humano", value: UNIT_FINAL_VALUE },
  { label: "Ética", value: UNIT_FINAL_VALUE },
]

export function unitGradeKey(index: number): string {
  return String(index)
}
