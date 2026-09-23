import { createContext, useContext, useRef, type ReactNode } from "react"
import { createStore, useStore } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import {
  buildDisplayName,
  createStudent,
  getDefaultStudentReport,
  studentReportSchema,
  type StudentEvaluation,
  type StudentNameInput,
  type StudentReport,
  type StudentType,
} from "@/lib/students"
import { toTitleCase } from "@/lib/utils"

interface StudentsState {
  students: StudentType[]
  report: StudentReport
}

interface StudentsActions {
  addStudent: (input: StudentNameInput) => void
  updateStudent: (id: string, input: StudentNameInput) => void
  removeStudent: (id: string) => void
  updateReportMetadata: (report: StudentReport) => void
  saveEvaluation: (
    id: string,
    payload: {
      assignmentGrades: number[]
      criteriaGrades: Record<string, number>
      unitGrades: Record<string, number>
      evaluation: StudentEvaluation
    }
  ) => void
  replaceStudentEvaluation: (
    id: string,
    payload: {
      assignmentGrades: number[]
      unitGrades?: Record<string, number>
      evaluation: StudentEvaluation
    }
  ) => void
  clearEvaluations: () => void
  clearStudents: () => void
}

export type StudentsStore = StudentsState & StudentsActions

function resolvePersistedReport(value: unknown): StudentReport {
  const parsed = studentReportSchema.safeParse(value)
  if (parsed.success) return parsed.data
  return getDefaultStudentReport()
}

const createStudentsStore = () =>
  createStore<StudentsStore>()(
    persist(
      (set) => ({
        students: [],
        report: getDefaultStudentReport(),
        addStudent: (input) =>
          set((state) => ({
            students: [...state.students, createStudent(input)],
          })),
        updateStudent: (id, input) =>
          set((state) => ({
            students: state.students.map((student) => {
              if (student.id !== id) return student
              const paternalSurname = toTitleCase(input.paternalSurname.trim())
              const maternalSurname = toTitleCase(input.maternalSurname.trim())
              const firstNames = toTitleCase(input.firstNames.trim())
              const displayName = buildDisplayName({
                paternalSurname,
                maternalSurname,
                firstNames,
              })
              return {
                ...student,
                paternalSurname,
                maternalSurname,
                firstNames,
                displayName,
              }
            }),
          })),
        removeStudent: (id) =>
          set((state) => ({
            students: state.students.filter((student) => student.id !== id),
          })),
        saveEvaluation: (
          id,
          { assignmentGrades, criteriaGrades, unitGrades, evaluation }
        ) =>
          set((state) => ({
            students: state.students.map((student) =>
              student.id === id
                ? {
                    ...student,
                    status: "evaluated",
                    assignmentGrades,
                    criteriaGrades,
                    unitGrades,
                    evaluation,
                  }
                : student
            ),
          })),
        replaceStudentEvaluation: (id, { assignmentGrades, unitGrades, evaluation }) =>
          set((state) => ({
            students: state.students.map((student) =>
              student.id === id
                ? {
                    ...student,
                    assignmentGrades,
                    unitGrades: unitGrades ?? student.unitGrades ?? {},
                    evaluation,
                  }
                : student
            ),
          })),
        clearEvaluations: () =>
          set((state) => ({
            students: state.students.map((student) => ({
              ...student,
              status: "not-evaluated",
              assignmentGrades: [],
              criteriaGrades: {},
              unitGrades: {},
              evaluation: null,
            })),
          })),
        clearStudents: () => set({ students: [] }),
        updateReportMetadata: (report) =>
          set(() => ({
            report: { ...report },
          })),
      }),
      {
        name: "pinax-students",
        storage: createJSONStorage(() => localStorage),
        version: 3,
        migrate: (persistedState) => {
          const state = persistedState as Record<string, unknown> | undefined
          if (!state) return state as never
          const students = state["students"]
          if (!Array.isArray(students)) {
            return {
              ...state,
              students: [],
              report: resolvePersistedReport(state["report"]),
            } as never
          }
          return {
            ...state,
            report: resolvePersistedReport(state["report"]),
            students: students.map((student) => {
              const item = student as Record<string, unknown>
              let next: Record<string, unknown> = { ...item }
              if (
                !("unitGrades" in next) ||
                typeof next["unitGrades"] !== "object" ||
                next["unitGrades"] === null
              ) {
                next = { ...next, unitGrades: {} }
              }
              const hasParts =
                typeof next["paternalSurname"] === "string" &&
                typeof next["maternalSurname"] === "string" &&
                typeof next["firstNames"] === "string" &&
                typeof next["displayName"] === "string"
              if (hasParts) {
                const paternalSurname = toTitleCase(
                  String(next["paternalSurname"]).trim()
                )
                const maternalSurname = toTitleCase(
                  String(next["maternalSurname"]).trim()
                )
                const firstNames = toTitleCase(
                  String(next["firstNames"]).trim()
                )
                const displayName = buildDisplayName({
                  paternalSurname,
                  maternalSurname,
                  firstNames,
                })
                next = {
                  ...next,
                  paternalSurname,
                  maternalSurname,
                  firstNames,
                  displayName,
                }
              } else {
                const legacyName =
                  typeof next["name"] === "string" ? String(next["name"]) : ""
                const tokens = legacyName
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean)
                let paternalSurname = ""
                let maternalSurname = ""
                let firstNames = ""
                if (tokens.length >= 3) {
                  paternalSurname = tokens[0] ?? ""
                  maternalSurname = tokens[1] ?? ""
                  firstNames = tokens.slice(2).join(" ")
                } else if (tokens.length === 2) {
                  paternalSurname = tokens[0] ?? ""
                  maternalSurname = ""
                  firstNames = tokens[1] ?? ""
                } else if (tokens.length === 1) {
                  paternalSurname = tokens[0] ?? ""
                }
                paternalSurname = paternalSurname
                  ? toTitleCase(paternalSurname)
                  : ""
                maternalSurname = maternalSurname
                  ? toTitleCase(maternalSurname)
                  : ""
                firstNames = firstNames ? toTitleCase(firstNames) : ""
                const displayName = buildDisplayName({
                  paternalSurname,
                  maternalSurname,
                  firstNames,
                })
                next = {
                  ...next,
                  paternalSurname,
                  maternalSurname,
                  firstNames,
                  displayName,
                }
              }
              delete next["name"]
              return next
            }),
          } as never
        },
        partialize: (state) => ({
          students: state.students,
          report: state.report,
        }),
      }
    )
  )

type StudentsStoreApi = ReturnType<typeof createStudentsStore>

export type { StudentsStoreApi }

export const StudentsStoreContext = createContext<StudentsStoreApi | null>(null)

export function StudentsProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<StudentsStoreApi | undefined>(undefined)
  if (!storeRef.current) {
    storeRef.current = createStudentsStore()
  }
  return (
    <StudentsStoreContext.Provider value={storeRef.current}>
      {children}
    </StudentsStoreContext.Provider>
  )
}

export function useStudentsStore<Selection>(
  selector: (state: StudentsStore) => Selection
): Selection {
  const store = useContext(StudentsStoreContext)
  if (!store) {
    throw new Error("useStudentsStore debe usarse dentro de <StudentsProvider>")
  }
  return useStore(store, selector)
}
