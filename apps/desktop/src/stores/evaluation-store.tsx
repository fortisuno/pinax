import { createContext, useContext, useRef, type ReactNode } from "react"
import { createStore, useStore } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import {
  DEFAULT_ASSIGNMENTS,
  DEFAULT_ASSIGNMENTS_PERCENTAGE_CRITERIA,
  DEFAULT_ASSIGNMENTS_QUANTITY_CRITERIA,
  DEFAULT_OTHER_CRITERIA,
  type Assignment,
  type CriteriaType,
} from "@/lib/evaluation"

interface EvaluationState {
  assignments: Assignment[]
  assignmentsQuantityCriteria: CriteriaType
  assignmentsPercentageCriteria: CriteriaType
  otherCriteria: CriteriaType[]
}

interface EvaluationActions {
  addAssignment: (assignment: Assignment) => void
  updateAssignment: (index: number, assignment: Assignment) => void
  removeAssignment: (index: number) => void
  setAssignmentsPercentageCriteria: (criteria: CriteriaType) => void
  addOtherCriteria: (criteria: CriteriaType) => void
  updateOtherCriteria: (index: number, criteria: CriteriaType) => void
  removeOtherCriteria: (index: number) => void
}

export type EvaluationStore = EvaluationState & EvaluationActions

const createEvaluationStore = () =>
  createStore<EvaluationStore>()(
    persist(
      (set) => ({
        assignments: DEFAULT_ASSIGNMENTS,
        assignmentsQuantityCriteria: DEFAULT_ASSIGNMENTS_QUANTITY_CRITERIA,
        assignmentsPercentageCriteria: DEFAULT_ASSIGNMENTS_PERCENTAGE_CRITERIA,
        otherCriteria: DEFAULT_OTHER_CRITERIA,
        addAssignment: (assignment) =>
          set((state) => ({
            assignments: [...state.assignments, assignment],
            assignmentsQuantityCriteria: {
              ...state.assignmentsQuantityCriteria,
              value: state.assignments.length + 1,
            },
          })),
        updateAssignment: (index, assignment) =>
          set((state) => ({
            assignments: state.assignments.map((item, itemIndex) =>
              itemIndex === index ? assignment : item
            ),
          })),
        removeAssignment: (index) =>
          set((state) => {
            const assignments = state.assignments.filter(
              (_, itemIndex) => itemIndex !== index
            )
            return {
              assignments,
              assignmentsQuantityCriteria: {
                ...state.assignmentsQuantityCriteria,
                value: assignments.length,
              },
            }
          }),
        setAssignmentsPercentageCriteria: (criteria) =>
          set({ assignmentsPercentageCriteria: criteria }),
        addOtherCriteria: (criteria) =>
          set((state) => ({
            otherCriteria: [...state.otherCriteria, criteria],
          })),
        updateOtherCriteria: (index, criteria) =>
          set((state) => ({
            otherCriteria: state.otherCriteria.map((item, itemIndex) =>
              itemIndex === index ? criteria : item
            ),
          })),
        removeOtherCriteria: (index) =>
          set((state) => ({
            otherCriteria: state.otherCriteria.filter(
              (_, itemIndex) => itemIndex !== index
            ),
          })),
      }),
      {
        name: "pinax-evaluation",
        storage: createJSONStorage(() => localStorage),
        version: 2,
        migrate: (persistedState, version) => {
          const state = persistedState as Record<string, unknown> | undefined
          if (!state) return state as never
          if (
            version === 0 ||
            !("assignments" in state) ||
            !Array.isArray(state["assignments"])
          ) {
            const quantityCriteria = state["assignmentsQuantityCriteria"] as
              | CriteriaType
              | undefined
            return {
              ...state,
              assignments: [],
              assignmentsQuantityCriteria: quantityCriteria
                ? { ...quantityCriteria, value: 0 }
                : { ...DEFAULT_ASSIGNMENTS_QUANTITY_CRITERIA, value: 0 },
            } as never
          }
          return state as never
        },
        partialize: (state) => ({
          assignments: state.assignments,
          assignmentsQuantityCriteria: state.assignmentsQuantityCriteria,
          assignmentsPercentageCriteria: state.assignmentsPercentageCriteria,
          otherCriteria: state.otherCriteria,
        }),
      }
    )
  )

type EvaluationStoreApi = ReturnType<typeof createEvaluationStore>

export type { EvaluationStoreApi }

export const EvaluationStoreContext = createContext<EvaluationStoreApi | null>(
  null
)

export function EvaluationProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<EvaluationStoreApi | undefined>(undefined)
  if (!storeRef.current) {
    storeRef.current = createEvaluationStore()
  }
  return (
    <EvaluationStoreContext.Provider value={storeRef.current}>
      {children}
    </EvaluationStoreContext.Provider>
  )
}

export function useEvaluationStore<Selection>(
  selector: (state: EvaluationStore) => Selection
): Selection {
  const store = useContext(EvaluationStoreContext)
  if (!store) {
    throw new Error(
      "useEvaluationStore debe usarse dentro de <EvaluationProvider>"
    )
  }
  return useStore(store, selector)
}
