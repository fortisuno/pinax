import { z } from "zod"

import {
  UNIT_BASE_WEIGHT,
  UNIT_EXAM_WEIGHT,
  unitGradeKey,
  type CriteriaType,
} from "@/lib/evaluation"

export type StudentStatus = "not-evaluated" | "evaluated"

export interface UnitResult {
  exam: number
  examWeighted: number
  final: number
}

export interface StudentEvaluation {
  tasksDelivered: number
  tasksAverage: number
  tasks: number
  criteria: Record<string, number>
  weightedCriteria: Record<string, number>
  base: number
  baseWeighted: number
  units: Record<string, UnitResult>
  final: number
}

export interface StudentType {
  id: string
  name: string
  status: StudentStatus
  assignmentGrades: number[]
  criteriaGrades: Record<string, number>
  unitGrades: Record<string, number>
  evaluation: StudentEvaluation | null
}

export const studentNameSchema = z
  .string()
  .trim()
  .min(1, "El nombre es obligatorio")
  .max(60, "Máximo 60 caracteres")

const gradeInputSchema = z
  .string()
  .transform((raw) => (raw.trim() === "" ? Number.NaN : Number(raw)))

export const gradeSchema = gradeInputSchema.pipe(
  z
    .number({ error: "Ingresa un número válido" })
    .min(0, "Debe ser al menos 0")
    .max(10, "Máximo 10")
)

export function createStudent(name: string): StudentType {
  return {
    id: crypto.randomUUID(),
    name,
    status: "not-evaluated",
    assignmentGrades: [],
    criteriaGrades: {},
    unitGrades: {},
    evaluation: null,
  }
}

export function getInitials(label: string): string {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
}

export function formatScore(value: number): string {
  return Number(value.toFixed(2)).toString()
}

export function countTasksDelivered(assignmentGrades: number[]): number {
  return assignmentGrades.filter((grade) => grade !== 0).length
}

export function resolveUnitExam(
  unitGrades: Record<string, number> | undefined,
  index: number,
  label: string
): number {
  const grades = unitGrades ?? {}
  const byIndex = grades[unitGradeKey(index)]
  if (byIndex !== undefined) return byIndex
  const byLabel = grades[label]
  if (byLabel !== undefined) return byLabel
  return 0
}

export function computeEvaluation({
  assignmentGrades,
  criteriaGrades,
  unitGrades = {},
  assignmentsPercentage,
  otherCriteria,
  unitCriteria = [],
}: {
  assignmentGrades: number[]
  criteriaGrades: Record<string, number>
  unitGrades?: Record<string, number>
  assignmentsPercentage: number
  otherCriteria: CriteriaType[]
  unitCriteria?: CriteriaType[]
}): StudentEvaluation {
  const totalAssignments = assignmentGrades.length
  const assignmentsSum = assignmentGrades.reduce(
    (sum, grade) => sum + grade,
    0
  )
  const tasksAverage =
    totalAssignments > 0 ? assignmentsSum / totalAssignments : 0
  const tasks = tasksAverage * (assignmentsPercentage / 100)

  const criteria: Record<string, number> = {}
  const weightedCriteria: Record<string, number> = {}
  let base = tasks
  for (const criterion of otherCriteria) {
    const grade = criteriaGrades[criterion.label] ?? 0
    criteria[criterion.label] = grade
    const weighted = grade * (criterion.value / 100)
    weightedCriteria[criterion.label] = weighted
    base += weighted
  }

  // Base ponderada al 70%. Clave estable para unitGrades: índice ("0".."3")
  // con fallback a label vigente, así un renombrado de "Unidad N" no pierde notas.
  const baseWeighted = base * (UNIT_BASE_WEIGHT / 100)

  const units: Record<string, UnitResult> = {}
  unitCriteria.forEach((unit, index) => {
    const key = unitGradeKey(index)
    const exam = resolveUnitExam(unitGrades, index, unit.label)
    const examWeighted = exam * (UNIT_EXAM_WEIGHT / 100)
    const final = baseWeighted + examWeighted
    units[key] = { exam, examWeighted, final }
  })

  return {
    tasksDelivered: countTasksDelivered(assignmentGrades),
    tasksAverage,
    tasks,
    criteria,
    weightedCriteria,
    base,
    baseWeighted,
    units,
    // final legacy = base para compatibilidad (StatusIcon, promedio, statusLabel).
    final: base,
  }
}