import * as React from "react"
import {
  DownloadIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RotateCcwIcon,
  TrashIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AddStudentDialog } from "@/components/students/add-student-dialog"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatScore } from "@/lib/students"
import { exportAndSaveGroupReport } from "@/lib/pdf-export"
import { useEvaluationStore } from "@/stores/evaluation-store"
import { useStudentsStore } from "@/stores/students-store"

type DeleteAction = "grades" | "table" | null

const DELETE_GRADES_TITLE = "Reiniciar calificaciones"
const DELETE_GRADES_DESCRIPTION =
  "¿Estás seguro de que quieres reiniciar todas las calificaciones? Los alumnos regresarán al estado \"No evaluado\". Esta acción no se puede deshacer."
const DELETE_TABLE_TITLE = "Limpiar tabla"
const DELETE_TABLE_DESCRIPTION =
  "¿Estás seguro de que quieres limpiar la tabla? Se eliminarán todos los alumnos registrados. Esta acción no se puede deshacer."

function GroupAverageBadge() {
  const students = useStudentsStore((state) => state.students)

  const average = React.useMemo(() => {
    if (students.length === 0) return null
    if (!students.every((student) => student.status === "evaluated")) return null
    const sum = students.reduce(
      (acc, student) => acc + (student.evaluation?.final ?? 0),
      0
    )
    return sum / students.length
  }, [students])

  if (average === null) {
    return (
      <Badge variant="secondary" className="h-10 px-4 text-sm">
        Promedio grupal:<span className="ml-2">—</span>
      </Badge>
    )
  }

  const colorClass =
    average < 6
      ? "bg-destructive/10 text-destructive dark:bg-destructive/20"
      : average < 8
        ? "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
        : "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400"

  return (
    <Badge className={cn("h-10 px-4 text-sm", colorClass)}>
      Promedio grupal:<span className="ml-2">{formatScore(average)}</span>
    </Badge>
  )
}

export function StudentsToolbar() {
  const clearEvaluations = useStudentsStore(
    (state) => state.clearEvaluations
  )
  const clearStudents = useStudentsStore((state) => state.clearStudents)
  const students = useStudentsStore((state) => state.students)
  const otherCriteria = useEvaluationStore((state) => state.otherCriteria)
  const assignmentsQuantityCriteria = useEvaluationStore(
    (state) => state.assignmentsQuantityCriteria
  )
  const assignmentsPercentageCriteria = useEvaluationStore(
    (state) => state.assignmentsPercentageCriteria
  )

  const [addStudentDialogOpen, setAddStudentDialogOpen] =
    React.useState(false)
  const [deleteAction, setDeleteAction] = React.useState<DeleteAction>(null)
  const [isExporting, setIsExporting] = React.useState(false)

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
        assignmentsQuantity: assignmentsQuantityCriteria.value,
        assignmentsPercentage: assignmentsPercentageCriteria.value,
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
    assignmentsQuantityCriteria,
    assignmentsPercentageCriteria,
  ])

  return (
    <div className="flex items-center justify-between gap-2">
      <GroupAverageBadge />
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
              <span>Exportar</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteAction("grades")}
            >
              <RotateCcwIcon />
              <span>Reiniciar</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteAction("table")}
            >
              <TrashIcon />
              <span>Limpiar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      <AddStudentDialog
        open={addStudentDialogOpen}
        onOpenChange={setAddStudentDialogOpen}
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
