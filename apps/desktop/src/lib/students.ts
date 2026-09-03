import { z } from "zod"

import type { CriteriaType } from "@/lib/evaluation"

export type StudentStatus = "not-evaluated" | "evaluated"

export interface StudentEvaluation {
  tasksDelivered: number
  tasksAverage: number
  tasks: number
  criteria: Record<string, number>
  weightedCriteria: Record<string, number>
  final: number
}

export interface StudentType {
  id: string
  name: string
  status: StudentStatus
  assignmentGrades: number[]
  criteriaGrades: Record<string, number>
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

export function computeEvaluation({
  assignmentGrades,
  criteriaGrades,
  assignmentsPercentage,
  otherCriteria,
}: {
  assignmentGrades: number[]
  criteriaGrades: Record<string, number>
  assignmentsPercentage: number
  otherCriteria: CriteriaType[]
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
  let final = tasks
  for (const criterion of otherCriteria) {
    const grade = criteriaGrades[criterion.label] ?? 0
    criteria[criterion.label] = grade
    const weighted = grade * (criterion.value / 100)
    weightedCriteria[criterion.label] = weighted
    final += weighted
  }

  return {
    tasksDelivered: countTasksDelivered(assignmentGrades),
    tasksAverage,
    tasks,
    criteria,
    weightedCriteria,
    final,
  }
}