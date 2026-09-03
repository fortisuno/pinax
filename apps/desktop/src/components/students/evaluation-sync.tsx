import * as React from "react"

import { computeEvaluation } from "@/lib/students"
import {
  EvaluationStoreContext,
  type EvaluationStoreApi,
} from "@/stores/evaluation-store"
import { StudentsStoreContext, type StudentsStoreApi } from "@/stores/students-store"

export function EvaluationSync() {
  const evaluationStore = React.useContext(EvaluationStoreContext)
  const studentsStore = React.useContext(StudentsStoreContext)

  React.useEffect(() => {
    if (!evaluationStore || !studentsStore) return
    return subscribeToEvaluationChanges(evaluationStore, studentsStore)
  }, [evaluationStore, studentsStore])

  return null
}

function subscribeToEvaluationChanges(
  evaluationStore: EvaluationStoreApi,
  studentsStore: StudentsStoreApi
) {
  const reconcile = () => {
    const { assignmentsQuantity, assignmentsPercentage, otherCriteria } =
      readEvaluationSnapshot(evaluationStore)
    const { students, replaceStudentEvaluation } = studentsStore.getState()

    for (const student of students) {
      if (student.status !== "evaluated" || !student.evaluation) continue

      const assignmentGrades = resizeAssignmentGrades(
        student.assignmentGrades,
        assignmentsQuantity
      )

      const nextEvaluation = computeEvaluation({
        assignmentGrades,
        criteriaGrades: student.criteriaGrades,
        assignmentsPercentage,
        otherCriteria,
      })

      const previous = student.evaluation
      if (
        assignmentGrades.length === student.assignmentGrades.length &&
        previous.tasksAverage === nextEvaluation.tasksAverage &&
        previous.tasks === nextEvaluation.tasks &&
        previous.final === nextEvaluation.final &&
        previous.tasksDelivered === nextEvaluation.tasksDelivered &&
        areRecordsEqual(previous.criteria, nextEvaluation.criteria) &&
        areRecordsEqual(
          previous.weightedCriteria,
          nextEvaluation.weightedCriteria
        )
      ) {
        continue
      }

      replaceStudentEvaluation(student.id, {
        assignmentGrades,
        evaluation: nextEvaluation,
      })
    }
  }

  reconcile()
  return evaluationStore.subscribe(reconcile)
}

function readEvaluationSnapshot(api: EvaluationStoreApi) {
  const {
    assignmentsQuantityCriteria,
    assignmentsPercentageCriteria,
    otherCriteria,
  } = api.getState()
  return {
    assignmentsQuantity: assignmentsQuantityCriteria.value,
    assignmentsPercentage: assignmentsPercentageCriteria.value,
    otherCriteria,
  }
}

function resizeAssignmentGrades(
  current: number[],
  quantity: number
): number[] {
  if (current.length === quantity) return current
  if (current.length < quantity) {
    return [...current, ...Array(quantity - current.length).fill(0)]
  }
  return current.slice(0, quantity)
}

function areRecordsEqual(
  a: Record<string, number>,
  b: Record<string, number>
): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    if ((a[key] ?? 0) !== (b[key] ?? 0)) return false
  }
  return true
}