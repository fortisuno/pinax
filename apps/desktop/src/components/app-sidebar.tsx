import * as React from "react"
import {
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  TrashIcon,
} from "lucide-react"

import { AddOtherCriteriaDialog } from "@/components/criteria/add-other-criteria-dialog"
import {
  Criteria,
  CriteriaMenu,
  CriteriaMenuItem,
  UnitCriteriaItem,
} from "@/components/criteria/criteria"
import {
  CriteriaGroup,
  CriteriaGroupAction,
  CriteriaGroupContent,
  CriteriaGroupHeader,
  CriteriaGroupLabel,
} from "@/components/criteria/criteria-group"
import { ManageAssignmentsDialog } from "@/components/criteria/manage-assignments-dialog"
import { UpdateCriteriaDialog } from "@/components/criteria/update-criteria-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  criteriaPercentageSchema,
  type CriteriaType,
} from "@/lib/evaluation"
import { useEvaluationStore } from "@/stores/evaluation-store"

type EditingTarget =
  | { kind: "other"; index: number }
  | { kind: "assignmentsPercentage" }
  | { kind: "unit"; index: number }
  | null

type DeletingTarget = { index: number; label: string } | null

const OTHER_CRITERIA_TITLE = "Editar criterio"
const OTHER_CRITERIA_DESCRIPTION =
  "Actualiza el nombre y la ponderación de este criterio."
const ASSIGNMENTS_PERCENTAGE_TITLE = "Editar ponderación de tareas"
const ASSIGNMENTS_PERCENTAGE_DESCRIPTION =
  "Modifica la ponderación que representan las tareas en la evaluación."
const UNIT_CRITERIA_TITLE = "Editar unidad"
const UNIT_CRITERIA_DESCRIPTION =
  "Actualiza el nombre de esta unidad de aprendizaje."
const DELETE_OTHER_CRITERIA_TITLE = "Borrar criterio"
const DELETE_OTHER_CRITERIA_DESCRIPTION =
  "¿Estás seguro de que quieres borrar este criterio? Esta acción no se puede deshacer."
const RESET_CRITERIA_TITLE = "Restablecer criterios"
const RESET_CRITERIA_DESCRIPTION =
  "Se restablecerá la ponderación de tareas a su valor por defecto y se borrarán los Otros criterios. Esta acción no se puede deshacer."

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const assignments = useEvaluationStore((state) => state.assignments)
  const assignmentsQuantityCriteria = useEvaluationStore(
    (state) => state.assignmentsQuantityCriteria
  )
  const assignmentsPercentageCriteria = useEvaluationStore(
    (state) => state.assignmentsPercentageCriteria
  )
  const otherCriteria = useEvaluationStore((state) => state.otherCriteria)
  const unitCriteria = useEvaluationStore((state) => state.unitCriteria)
  const removeOtherCriteria = useEvaluationStore(
    (state) => state.removeOtherCriteria
  )
  const resetEvaluationCriteria = useEvaluationStore(
    (state) => state.resetEvaluationCriteria
  )
  const setAssignmentsPercentageCriteria = useEvaluationStore(
    (state) => state.setAssignmentsPercentageCriteria
  )
  const updateOtherCriteria = useEvaluationStore(
    (state) => state.updateOtherCriteria
  )
  const updateUnitCriteria = useEvaluationStore(
    (state) => state.updateUnitCriteria
  )

  const [addCriteriaDialogOpen, setAddCriteriaDialogOpen] =
    React.useState(false)
  const [manageOpen, setManageOpen] = React.useState(false)
  const [editingTarget, setEditingTarget] = React.useState<EditingTarget>(null)
  const [deletingTarget, setDeletingTarget] =
    React.useState<DeletingTarget>(null)
  const [resetCriteriaDialogOpen, setResetCriteriaDialogOpen] =
    React.useState(false)

  const closeEditing = React.useCallback((open: boolean) => {
    if (!open) {
      setEditingTarget(null)
    }
  }, [])

  const closeDeleting = React.useCallback((open: boolean) => {
    if (!open) {
      setDeletingTarget(null)
    }
  }, [])

  const confirmDelete = React.useCallback(() => {
    if (deletingTarget === null) return
    removeOtherCriteria(deletingTarget.index)
    setDeletingTarget(null)
  }, [deletingTarget, removeOtherCriteria])

  const confirmResetCriteria = React.useCallback(() => {
    resetEvaluationCriteria()
    setResetCriteriaDialogOpen(false)
  }, [resetEvaluationCriteria])

  const editingDialog = renderEditingDialog({
    editingTarget,
    otherCriteria,
    assignmentsPercentageCriteria,
    unitCriteria,
    updateOtherCriteria,
    setAssignmentsPercentageCriteria,
    updateUnitCriteria,
    closeEditing,
  })

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2 py-3 text-base font-semibold">
              <span className="text-base font-semibold">
                Criterios de Evaluación
              </span>
            {/* <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!">
              <ChartColumnIcon className="size-5!" />
            </SidebarMenuButton> */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <CriteriaGroup>
          <CriteriaGroupHeader>
            <CriteriaGroupLabel>Unidades de aprendizaje</CriteriaGroupLabel>
          </CriteriaGroupHeader>
          <CriteriaGroupContent>
            {unitCriteria.map((criteria, index) => (
              <UnitCriteriaItem key={"uc_" + index} label={criteria.label}>
                <CriteriaMenu>
                  <CriteriaMenuItem
                    onClick={() => setEditingTarget({ kind: "unit", index })}
                  >
                    <PencilIcon />
                    <span>Editar</span>
                  </CriteriaMenuItem>
                </CriteriaMenu>
              </UnitCriteriaItem>
            ))}
          </CriteriaGroupContent>
        </CriteriaGroup>
        <CriteriaGroup>
          <CriteriaGroupHeader>
            <CriteriaGroupLabel>Tareas</CriteriaGroupLabel>
          </CriteriaGroupHeader>
          <CriteriaGroupContent>
            <Criteria
              label={assignmentsQuantityCriteria.label}
              value={assignments.length}
            >
              <CriteriaMenu>
                <CriteriaMenuItem onClick={() => setManageOpen(true)}>
                  <PencilIcon />
                  <span>Editar</span>
                </CriteriaMenuItem>
              </CriteriaMenu>
            </Criteria>
            <Criteria
              label={assignmentsPercentageCriteria.label}
              value={assignmentsPercentageCriteria.value}
              suffix="%"
            >
              <CriteriaMenu>
                <CriteriaMenuItem
                  onClick={() =>
                    setEditingTarget({ kind: "assignmentsPercentage" })
                  }
                >
                  <PencilIcon />
                  <span>Editar</span>
                </CriteriaMenuItem>
              </CriteriaMenu>
            </Criteria>
          </CriteriaGroupContent>
        </CriteriaGroup>
        <CriteriaGroup>
          <CriteriaGroupHeader>
            <CriteriaGroupLabel>Otros Criterios</CriteriaGroupLabel>
            <div className="flex items-center gap-1">
              <CriteriaGroupAction
                aria-label="Restablecer criterios"
                onClick={() => setResetCriteriaDialogOpen(true)}
              >
                <RotateCcwIcon />
              </CriteriaGroupAction>
              <Separator orientation="vertical" className="h-4 w-px self-center" />
              <CriteriaGroupAction
                aria-label="Agregar otro criterio"
                onClick={() => setAddCriteriaDialogOpen(true)}
              >
                <PlusIcon />
              </CriteriaGroupAction>
            </div>
          </CriteriaGroupHeader>
          <CriteriaGroupContent>
            {otherCriteria.map((criteria, index) => (
              <Criteria
                key={"oc_" + index}
                label={criteria.label}
                value={criteria.value}
                suffix="%"
              >
                <CriteriaMenu>
                  <CriteriaMenuItem
                    onClick={() => setEditingTarget({ kind: "other", index })}
                  >
                    <PencilIcon />
                    <span>Editar</span>
                  </CriteriaMenuItem>
                  <CriteriaMenuItem
                    variant="destructive"
                    onClick={() =>
                      setDeletingTarget({ index, label: criteria.label })
                    }
                  >
                    <TrashIcon />
                    <span>Borrar</span>
                  </CriteriaMenuItem>
                </CriteriaMenu>
              </Criteria>
            ))}
          </CriteriaGroupContent>
        </CriteriaGroup>
      </SidebarContent>
      <AddOtherCriteriaDialog
        open={addCriteriaDialogOpen}
        onOpenChange={setAddCriteriaDialogOpen}
      />
      <ManageAssignmentsDialog open={manageOpen} onOpenChange={setManageOpen} />
      {editingDialog}
      <AlertDialog
        open={deletingTarget !== null}
        onOpenChange={closeDeleting}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{DELETE_OTHER_CRITERIA_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingTarget
                ? `¿Estás seguro de que quieres borrar el criterio "${deletingTarget.label}"? Esta acción no se puede deshacer.`
                : DELETE_OTHER_CRITERIA_DESCRIPTION}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={resetCriteriaDialogOpen}
        onOpenChange={setResetCriteriaDialogOpen}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{RESET_CRITERIA_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {RESET_CRITERIA_DESCRIPTION}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmResetCriteria}
            >
              Restablecer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  )
}

function renderEditingDialog({
  editingTarget,
  otherCriteria,
  assignmentsPercentageCriteria,
  unitCriteria,
  updateOtherCriteria,
  setAssignmentsPercentageCriteria,
  updateUnitCriteria,
  closeEditing,
}: {
  editingTarget: EditingTarget
  otherCriteria: CriteriaType[]
  assignmentsPercentageCriteria: CriteriaType
  unitCriteria: CriteriaType[]
  updateOtherCriteria: (index: number, criteria: CriteriaType) => void
  setAssignmentsPercentageCriteria: (criteria: CriteriaType) => void
  updateUnitCriteria: (index: number, criteria: CriteriaType) => void
  closeEditing: (open: boolean) => void
}) {
  switch (editingTarget?.kind) {
    case "other": {
      const index = editingTarget.index
      const target = otherCriteria[index]
      if (!target) return null
      return (
        <UpdateCriteriaDialog
          open
          onOpenChange={closeEditing}
          title={OTHER_CRITERIA_TITLE}
          description={OTHER_CRITERIA_DESCRIPTION}
          criteria={target}
          valueSchema={criteriaPercentageSchema}
          valueLabel="Ponderación (%)"
          showLabel
          onUpdate={(updated) => updateOtherCriteria(index, updated)}
        />
      )
    }
    case "assignmentsPercentage":
      return (
        <UpdateCriteriaDialog
          open
          onOpenChange={closeEditing}
          title={ASSIGNMENTS_PERCENTAGE_TITLE}
          description={ASSIGNMENTS_PERCENTAGE_DESCRIPTION}
          criteria={assignmentsPercentageCriteria}
          valueSchema={criteriaPercentageSchema}
          valueLabel="Ponderación (%)"
          showLabel={false}
          onUpdate={setAssignmentsPercentageCriteria}
        />
      )
    case "unit": {
      const index = editingTarget.index
      const target = unitCriteria[index]
      if (!target) return null
      return (
        <UpdateCriteriaDialog
          open
          onOpenChange={closeEditing}
          title={UNIT_CRITERIA_TITLE}
          description={UNIT_CRITERIA_DESCRIPTION}
          criteria={target}
          showLabel
          showValue={false}
          onUpdate={(updated) => updateUnitCriteria(index, updated)}
        />
      )
    }
    default:
      return null
  }
}