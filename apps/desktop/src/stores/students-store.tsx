import { createContext, useContext, useRef, type ReactNode } from "react"
import { createStore, useStore } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import {
  createStudent,
  type StudentEvaluation,
  type StudentType,
} from "@/lib/students"

interface StudentsState {
  students: StudentType[]
}

interface StudentsActions {
  addStudent: (name: string) => void
  updateStudent: (id: string, name: string) => void
  removeStudent: (id: string) => void
  saveEvaluation: (
    id: string,
    payload: {
      assignmentGrades: number[]
      criteriaGrades: Record<string, number>
      evaluation: StudentEvaluation
    }
  ) => void
  replaceStudentEvaluation: (
    id: string,
    payload: { assignmentGrades: number[]; evaluation: StudentEvaluation }
  ) => void
  clearEvaluations: () => void
  clearStudents: () => void
}

export type StudentsStore = StudentsState & StudentsActions

const createStudentsStore = () =>
  createStore<StudentsStore>()(
    persist(
      (set) => ({
        students: [],
        addStudent: (name) =>
          set((state) => ({
            students: [...state.students, createStudent(name)],
          })),
        updateStudent: (id, name) =>
          set((state) => ({
            students: state.students.map((student) =>
              student.id === id ? { ...student, name } : student
            ),
          })),
        removeStudent: (id) =>
          set((state) => ({
            students: state.students.filter((student) => student.id !== id),
          })),
        saveEvaluation: (id, { assignmentGrades, criteriaGrades, evaluation }) =>
          set((state) => ({
            students: state.students.map((student) =>
              student.id === id
                ? {
                    ...student,
                    status: "evaluated",
                    assignmentGrades,
                    criteriaGrades,
                    evaluation,
                  }
                : student
            ),
          })),
        replaceStudentEvaluation: (id, { assignmentGrades, evaluation }) =>
          set((state) => ({
            students: state.students.map((student) =>
              student.id === id
                ? { ...student, assignmentGrades, evaluation }
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
              evaluation: null,
            })),
          })),
        clearStudents: () => set({ students: [] }),
      }),
      {
        name: "pinax-students",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          students: state.students,
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
