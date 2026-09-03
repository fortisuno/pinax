import * as React from "react"
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react"

import { AddOtherCriteriaDialog } from "@/components/criteria/add-other-criteria-dialog"
import {
  Criteria,
  CriteriaMenu,
  CriteriaMenuItem,
} from "@/components/criteria/criteria"
import {
  CriteriaGroup,
  CriteriaGroupAction,
  CriteriaGroupContent,
  CriteriaGroupHeader,
  CriteriaGroupLabel,
} from "@/components/criteria/criteria-group"
import { UpdateCriteriaDialog } from "@/components/criteria/update-criteria-dialog"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
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
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  criteriaPercentageSchema,
  criteriaQuantitySchema,
  type CriteriaType,
} from "@/lib/evaluation"
import { useEvaluationStore } from "@/stores/evaluation-store"

type EditingTarget =
  | { kind: "other"; index: number }
  | { kind: "assignmentsQuantity" }
  | { kind: "assignmentsPercentage" }
  | null

type DeletingTarget = { index: number; label: string } | null

const OTHER_CRITERIA_TITLE = "Editar criterio"
const OTHER_CRITERIA_DESCRIPTION =
  "Actualiza el nombre y la ponderación de este criterio."
const ASSIGNMENTS_QUANTITY_TITLE = "Editar cantidad de tareas"
const ASSIGNMENTS_QUANTITY_DESCRIPTION =
  "Modifica la cantidad de tareas consideradas en la evaluación."
const ASSIGNMENTS_PERCENTAGE_TITLE = "Editar ponderación de tareas"
const ASSIGNMENTS_PERCENTAGE_DESCRIPTION =
  "Modifica la ponderación que representan las tareas en la evaluación."
const DELETE_OTHER_CRITERIA_TITLE = "Borrar criterio"
const DELETE_OTHER_CRITERIA_DESCRIPTION =
  "¿Estás seguro de que quieres borrar este criterio? Esta acción no se puede deshacer."

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const assignmentsQuantityCriteria = useEvaluationStore(
    (state) => state.assignmentsQuantityCriteria
  )
  const assignmentsPercentageCriteria = useEvaluationStore(
    (state) => state.assignmentsPercentageCriteria
  )
  const otherCriteria = useEvaluationStore((state) => state.otherCriteria)
  const removeOtherCriteria = useEvaluationStore(
    (state) => state.removeOtherCriteria
  )
  const setAssignmentsQuantityCriteria = useEvaluationStore(
    (state) => state.setAssignmentsQuantityCriteria
  )
  const setAssignmentsPercentageCriteria = useEvaluationStore(
    (state) => state.setAssignmentsPercentageCriteria
  )
  const updateOtherCriteria = useEvaluationStore(
    (state) => state.updateOtherCriteria
  )

  const [addCriteriaDialogOpen, setAddCriteriaDialogOpen] =
    React.useState(false)
  const [editingTarget, setEditingTarget] = React.useState<EditingTarget>(null)
  const [deletingTarget, setDeletingTarget] =
    React.useState<DeletingTarget>(null)

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

  const totalPercentage = React.useMemo(() => {
    const otherCriteriaTotal = otherCriteria.reduce(
      (sum, criteria) => sum + criteria.value,
      0
    )
    return assignmentsPercentageCriteria.value + otherCriteriaTotal
  }, [assignmentsPercentageCriteria.value, otherCriteria])

  const editingDialog = renderEditingDialog({
    editingTarget,
    otherCriteria,
    assignmentsQuantityCriteria,
    assignmentsPercentageCriteria,
    updateOtherCriteria,
    setAssignmentsQuantityCriteria,
    setAssignmentsPercentageCriteria,
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
            <CriteriaGroupLabel>Tareas</CriteriaGroupLabel>
          </CriteriaGroupHeader>
          <CriteriaGroupContent>
            <Criteria
              label={assignmentsQuantityCriteria.label}
              value={assignmentsQuantityCriteria.value}
            >
              <CriteriaMenu>
                <CriteriaMenuItem
                  onClick={() =>
                    setEditingTarget({ kind: "assignmentsQuantity" })
                  }
                >
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
            <CriteriaGroupAction
              aria-label="Agregar otro criterio"
              onClick={() => setAddCriteriaDialogOpen(true)}
            >
              <PlusIcon />
            </CriteriaGroupAction>
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
      <SidebarFooter>
        <PonderacionAlert totalPercentage={totalPercentage} />
      </SidebarFooter>
      <AddOtherCriteriaDialog
        open={addCriteriaDialogOpen}
        onOpenChange={setAddCriteriaDialogOpen}
      />
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
    </Sidebar>
  )
}

function renderEditingDialog({
  editingTarget,
  otherCriteria,
  assignmentsQuantityCriteria,
  assignmentsPercentageCriteria,
  updateOtherCriteria,
  setAssignmentsQuantityCriteria,
  setAssignmentsPercentageCriteria,
  closeEditing,
}: {
  editingTarget: EditingTarget
  otherCriteria: CriteriaType[]
  assignmentsQuantityCriteria: CriteriaType
  assignmentsPercentageCriteria: CriteriaType
  updateOtherCriteria: (index: number, criteria: CriteriaType) => void
  setAssignmentsQuantityCriteria: (criteria: CriteriaType) => void
  setAssignmentsPercentageCriteria: (criteria: CriteriaType) => void
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
    case "assignmentsQuantity":
      return (
        <UpdateCriteriaDialog
          open
          onOpenChange={closeEditing}
          title={ASSIGNMENTS_QUANTITY_TITLE}
          description={ASSIGNMENTS_QUANTITY_DESCRIPTION}
          criteria={assignmentsQuantityCriteria}
          valueSchema={criteriaQuantitySchema}
          valueLabel="Cantidad"
          showLabel={false}
          onUpdate={setAssignmentsQuantityCriteria}
        />
      )
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
    default:
      return null
  }
}

type PonderacionStatus = "ok" | "warning" | "destructive"

const PONDERACION_STATUS_CLASSNAMES: Record<PonderacionStatus, string> = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-900 *:data-[slot=alert-description]:text-emerald-900/80 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100 dark:*:data-[slot=alert-description]:text-emerald-100/80",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 *:data-[slot=alert-description]:text-amber-900/80 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 dark:*:data-[slot=alert-description]:text-amber-100/80",
  destructive: "",
}

function getPonderacionStatus(total: number): PonderacionStatus {
  if (total > 100) return "destructive"
  if (total < 100) return "warning"
  return "ok"
}

function PonderacionAlert({ totalPercentage }: { totalPercentage: number }) {
  const status = getPonderacionStatus(totalPercentage)
  const difference = Math.abs(100 - totalPercentage)
  const totalLabel = `${totalPercentage}%`

  if (status === "ok") {
    return (
      <Alert className={PONDERACION_STATUS_CLASSNAMES.ok}>
        <CheckCircle2Icon />
        <AlertTitle>Ponderación completa ({totalLabel})</AlertTitle>
        <AlertDescription>
          La suma de las ponderaciones alcanza exactamente el 100%. La
          configuración está lista para usarse.
        </AlertDescription>
      </Alert>
    )
  }

  if (status === "warning") {
    return (
      <Alert className={PONDERACION_STATUS_CLASSNAMES.warning}>
        <AlertTriangleIcon />
        <AlertTitle>Ponderación incompleta ({totalLabel})</AlertTitle>
        <AlertDescription>
          La suma actual es de {totalLabel}. Aún falta asignar {difference}%
          para alcanzar el 100% requerido.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>Ponderación excedida ({totalLabel})</AlertTitle>
      <AlertDescription>
        La suma actual es de {totalLabel}. Excede el 100% en {difference}%.
        Ajusta los valores para que la ponderación total no supere el 100%.
      </AlertDescription>
    </Alert>
  )
}