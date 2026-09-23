import * as React from "react"
import {
  DownloadIcon,
  EditIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RotateCcwIcon,
  TrashIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AddStudentDialog } from "@/components/students/add-student-dialog"
import { UpdateStudentReportDialog } from "@/components/students/update-student-report-dialog"
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
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { exportAndSaveGroupReport } from "@/lib/pdf-export"
import { useEvaluationStore } from "@/stores/evaluation-store"
import { useStudentsStore } from "@/stores/students-store"
import { Item, ItemContent, ItemTitle, ItemDescription } from "../ui/item"
import { Separator } from "../ui/separator"

type DeleteAction = "grades" | "table" | null

const DELETE_GRADES_TITLE = "Reiniciar calificaciones"
const DELETE_GRADES_DESCRIPTION =
  "¿Estás seguro de que quieres reiniciar todas las calificaciones? Los alumnos regresarán al estado \"No evaluado\". Esta acción no se puede deshacer."
const DELETE_TABLE_TITLE = "Limpiar tabla"
const DELETE_TABLE_DESCRIPTION =
  "¿Estás seguro de que quieres limpiar la tabla? Se eliminarán todos los alumnos registrados. Esta acción no se puede deshacer."

function GroupMetadata() {
  const report = useStudentsStore((state) => state.report)
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-2 lg:gap-x-4">
      <Item variant="default" className="w-auto min-w-0">
        <ItemContent className="flex flex-row gap-3">
          <ItemTitle>Ciclo Escolar</ItemTitle>
          <ItemDescription className="whitespace-nowrap">{`${report.startYear}-${report.endYear}`}</ItemDescription>
        </ItemContent>
      </Item>
      <Separator
        orientation="vertical"
        className="mx-2 h-4 data-vertical:self-auto"
      />
      <Item variant="default" className="w-auto min-w-0">
        <ItemContent className="flex flex-row gap-3">
          <ItemTitle>Grado</ItemTitle>
          <ItemDescription className="whitespace-nowrap">
            {report.grade}
          </ItemDescription>
        </ItemContent>
      </Item>
      <Separator
        orientation="vertical"
        className="mx-2 h-4 data-vertical:self-auto"
      />
      <Item variant="default" className="w-auto min-w-0">
        <ItemContent className="flex flex-row gap-3">
          <ItemTitle>Grupo</ItemTitle>
          <ItemDescription className="whitespace-nowrap">
            {report.group}
          </ItemDescription>
        </ItemContent>
      </Item>
      <Separator
        orientation="vertical"
        className="mx-2 h-4 data-vertical:self-auto"
      />
      <Item variant="default" className="w-auto min-w-0">
        <ItemContent className="flex flex-row gap-3">
          <ItemTitle>Periodo</ItemTitle>
          <ItemDescription className="whitespace-nowrap">
            {report.period}
          </ItemDescription>
        </ItemContent>
      </Item>
    </div>
  )
}

export function StudentsToolbar() {
  const clearEvaluations = useStudentsStore(
    (state) => state.clearEvaluations
  )
  const clearStudents = useStudentsStore((state) => state.clearStudents)
  const students = useStudentsStore((state) => state.students)
  const otherCriteria = useEvaluationStore((state) => state.otherCriteria)
  const unitCriteria = useEvaluationStore((state) => state.unitCriteria)
  const assignments = useEvaluationStore((state) => state.assignments)
  const assignmentsPercentageCriteria = useEvaluationStore(
    (state) => state.assignmentsPercentageCriteria
  )

  const [addStudentDialogOpen, setAddStudentDialogOpen] =
    React.useState(false)
  const [editReportOpen, setEditReportOpen] = React.useState(false)
  const [deleteAction, setDeleteAction] = React.useState<DeleteAction>(null)
  const [isExporting, setIsExporting] = React.useState(false)
  const report = useStudentsStore((state) => state.report)

  const allStudentsEvaluated = React.useMemo(
    () =>
      students.length > 0 && students.every((s) => s.status === "evaluated"),
    [students]
  )

  const confirmDelete = React.useCallback(() => {
    if (deleteAction === "grades") {
      clearEvaluations()
    } else if (deleteAction === "table") {
      clearStudents()
    }
    setDeleteAction(null)
  }, [deleteAction, clearEvaluations, clearStudents])

  const handleExportGroup = React.useCallback(async () => {
    if (students.length === 0) {
      toast.error("No hay alumnos para exportar")
      return
    }
    if (!allStudentsEvaluated) {
      toast.error("Todos los alumnos deben estar evaluados")
      return
    }
    setIsExporting(true)
    try {
      const result = await exportAndSaveGroupReport(students, {
        otherCriteria,
        unitCriteria,
        assignments,
        assignmentsPercentage: assignmentsPercentageCriteria.value,
        report,
      })
      if (result.saved) {
        toast.success("Reporte grupal exportado")
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo exportar el reporte"
      )
    } finally {
      setIsExporting(false)
    }
  }, [
    students,
    allStudentsEvaluated,
    otherCriteria,
    unitCriteria,
    assignments,
    assignmentsPercentageCriteria,
    report,
  ])

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
      <GroupMetadata />
      <ButtonGroup>
        <Button variant="outline" size="lg" onClick={() => setAddStudentDialogOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          Agregar alumno
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button size="lg" variant="outline" />}
          >
            <MoreHorizontalIcon />
            <span className="sr-only">Abrir menú</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-auto min-w-fit">
            <DropdownMenuItem
              onClick={handleExportGroup}
              disabled={isExporting || !allStudentsEvaluated}
            >
              <DownloadIcon />
              <span>Exportar reporte</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditReportOpen(true)}>
              <EditIcon />
              <span>Editar grupo</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteAction("grades")}
            >
              <RotateCcwIcon />
              <span>Reiniciar evaluación</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteAction("table")}
            >
              <TrashIcon />
              <span>Limpiar tabla</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      <AddStudentDialog
        open={addStudentDialogOpen}
        onOpenChange={setAddStudentDialogOpen}
      />
      <UpdateStudentReportDialog
        open={editReportOpen}
        onOpenChange={setEditReportOpen}
      />
      <AlertDialog
        open={deleteAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteAction(null)
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteAction === "table"
                ? DELETE_TABLE_TITLE
                : DELETE_GRADES_TITLE}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteAction === "table"
                ? DELETE_TABLE_DESCRIPTION
                : DELETE_GRADES_DESCRIPTION}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              {deleteAction === "table" ? "Limpiar" : "Reiniciar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
