import { createContext, useContext, useRef, type ReactNode } from "react"
import { createStore, useStore } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import {
  DEFAULT_ASSIGNMENTS_PERCENTAGE_CRITERIA,
  DEFAULT_ASSIGNMENTS_QUANTITY_CRITERIA,
  DEFAULT_OTHER_CRITERIA,
  type CriteriaType,
} from "@/lib/evaluation"

interface EvaluationState {
  assignmentsQuantityCriteria: CriteriaType
  assignmentsPercentageCriteria: CriteriaType
  otherCriteria: CriteriaType[]
}

interface EvaluationActions {
  setAssignmentsQuantityCriteria: (criteria: CriteriaType) => void
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
        assignmentsQuantityCriteria: DEFAULT_ASSIGNMENTS_QUANTITY_CRITERIA,
        assignmentsPercentageCriteria: DEFAULT_ASSIGNMENTS_PERCENTAGE_CRITERIA,
        otherCriteria: DEFAULT_OTHER_CRITERIA,
        setAssignmentsQuantityCriteria: (criteria) =>
          set({ assignmentsQuantityCriteria: criteria }),
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
        partialize: (state) => ({
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
