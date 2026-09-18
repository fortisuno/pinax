import * as React from "react"
import {
  createColumnHelper,
  FlexRender,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import {
  BadgeCheckIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClipboardCheckIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  LoaderIcon,
  PencilIcon,
  TrashIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { toast } from "sonner"

import { EvaluateStudentDialog } from "@/components/students/evaluate-student-dialog"
import { StudentsToolbar } from "@/components/students/students-toolbar"
import { UpdateStudentDialog } from "@/components/students/update-student-dialog"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  formatScore,
  getInitials,
  type StudentStatus,
  type StudentType,
} from "@/lib/students"
import {
  UNIT_BASE_WEIGHT,
  UNIT_EXAM_WEIGHT,
  unitGradeKey,
  type CriteriaType,
} from "@/lib/evaluation"
import { exportAndSaveStudentReport } from "@/lib/pdf-export"
import { useEvaluationStore } from "@/stores/evaluation-store"
import { useStudentsStore } from "@/stores/students-store"

const TASKS_DELIVERED_LABEL = "Tareas Entregadas"
const TASKS_LABEL = "Tareas"
const TASKS_WEIGHTED_LABEL = "Tareas Ponderadas"
const BASE_GRADE_LABEL = "Calificación Base"
const BASE_WEIGHTED_LABEL = "Base Ponderada"
const EXAM_LABEL = "Examen"
const EXAM_WEIGHTED_LABEL = "Examen Ponderado"
const UNIT_FINAL_LABEL = "Final"
const DELETE_STUDENT_TITLE = "Borrar alumno"

const COMPACT_CELL_CLASS = "px-2 text-center whitespace-nowrap"
const CRITERIA_CELL_CLASS = `${COMPACT_CELL_CLASS} w-14`
const STATUS_CELL_CLASS = `${COMPACT_CELL_CLASS} w-32`
const STATUS_ICON_CELL_CLASS = `${COMPACT_CELL_CLASS} w-12`
const ACTIONS_CELL_CLASS = `${COMPACT_CELL_CLASS} w-12`

const features = tableFeatures({})

const columnHelper = createColumnHelper<typeof features, StudentType>()

function CriteriaHeader({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger className="cursor-help underline decoration-dotted underline-offset-4 outline-none">
        {getInitials(label)}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function ScoreValue({ value }: { value: number | undefined }) {
  if (value === undefined) {
    return <span className="text-muted-foreground">—</span>
  }
  return <span>{formatScore(value)}</span>
}

function StatusIcon({ final }: { final: number | undefined }) {
  if (final === undefined) {
    return null
  }
  let icon: React.ReactNode
  let tooltip: string
  if (final < 6) {
    icon = (
      <CircleXIcon
        aria-label="Calificación reprobatoria"
        className="size-5 text-destructive"
      />
    )
    tooltip = "Calificación reprobatoria"
  } else if (final < 8) {
    icon = (
      <TriangleAlertIcon
        aria-label="Calificación suficiente"
        className="size-5 text-yellow-500 dark:text-yellow-400"
      />
    )
    tooltip = "Calificación suficiente"
  } else {
    icon = (
      <BadgeCheckIcon
        aria-label="Calificación destacada"
        className="size-5 text-green-500 dark:text-green-400"
      />
    )
    tooltip = "Calificación destacada"
  }
  return (
    <Tooltip>
      <TooltipTrigger className="inline-flex cursor-default outline-none">
        {icon}
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

function StatusBadge({ status }: { status: StudentStatus }) {
  if (status === "evaluated") {
    return (
      <Badge variant="outline" className="px-1.5 text-muted-foreground">
        <CircleCheckIcon className="fill-green-500 dark:fill-green-400" />
        Evaluado
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="px-1.5 text-muted-foreground">
      <LoaderIcon />
      No evaluado
    </Badge>
  )
}

function RowActions({
  student,
  onEdit,
  onEvaluate,
  onExport,
  onDelete,
}: {
  student: StudentType
  onEdit: (student: StudentType) => void
  onEvaluate: (student: StudentType) => void
  onExport: (student: StudentType) => void
  onDelete: (student: StudentType) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-open:bg-muted"
            size="icon"
          />
        }
      >
        <EllipsisVerticalIcon />
        <span className="sr-only">Abrir menú</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-fit">
        <DropdownMenuItem onClick={() => onEvaluate(student)}>
          <ClipboardCheckIcon />
          <span>Calificar</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onExport(student)}
          disabled={student.status !== "evaluated"}
        >
          <DownloadIcon />
          <span>Exportar</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(student)}>
          <PencilIcon />
          <span>Editar</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(student)}>
          <TrashIcon />
          <span>Borrar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function BaseColumns({ otherCriteria }: { otherCriteria: CriteriaType[] }) {
  const criteriaColumns = otherCriteria.flatMap((criterion) => {
    const rawColumn = columnHelper.display({
      id: `criteria-${criterion.label}`,
      header: () => <CriteriaHeader label={criterion.label} />,
      cell: ({ row }) => (
        <ScoreValue
          value={row.original.evaluation?.criteria[criterion.label]}
        />
      ),
      meta: { className: CRITERIA_CELL_CLASS },
    })
    const weightedLabel = `${criterion.label} Ponderado`
    const weightedColumn = columnHelper.display({
      id: `criteria-${criterion.label}-ponderado`,
      header: () => <CriteriaHeader label={weightedLabel} />,
      cell: ({ row }) => (
        <ScoreValue
          value={row.original.evaluation?.weightedCriteria[criterion.label]}
        />
      ),
      meta: { className: CRITERIA_CELL_CLASS },
    })
    return [rawColumn, weightedColumn]
  })

  return [
    columnHelper.accessor("name", {
      header: "Nombre",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    }),
    columnHelper.display({
      id: "tasks-delivered",
      header: () => <CriteriaHeader label={TASKS_DELIVERED_LABEL} />,
      cell: ({ row }) => (
        <ScoreValue value={row.original.evaluation?.tasksDelivered} />
      ),
      meta: { className: CRITERIA_CELL_CLASS },
    }),
    columnHelper.display({
      id: "tasks",
      header: () => <CriteriaHeader label={TASKS_LABEL} />,
      cell: ({ row }) => (
        <ScoreValue value={row.original.evaluation?.tasksAverage} />
      ),
      meta: { className: CRITERIA_CELL_CLASS },
    }),
    columnHelper.display({
      id: "tasks-weighted",
      header: () => <CriteriaHeader label={TASKS_WEIGHTED_LABEL} />,
      cell: ({ row }) => (
        <ScoreValue value={row.original.evaluation?.tasks} />
      ),
      meta: { className: CRITERIA_CELL_CLASS },
    }),
    ...criteriaColumns,
    columnHelper.display({
      id: "base",
      header: () => <CriteriaHeader label={BASE_GRADE_LABEL} />,
      cell: ({ row }) => (
        <span className="font-medium">
          <ScoreValue
            value={
              row.original.evaluation?.base ?? row.original.evaluation?.final
            }
          />
        </span>
      ),
      meta: { className: CRITERIA_CELL_CLASS },
    }),
    columnHelper.display({
      id: "base-weighted",
      header: () => (
        <CriteriaHeader label={`${BASE_WEIGHTED_LABEL} (${UNIT_BASE_WEIGHT}%)`} />
      ),
      cell: ({ row }) => (
        <ScoreValue value={row.original.evaluation?.baseWeighted} />
      ),
      meta: { className: CRITERIA_CELL_CLASS },
    }),
  ]
}

function UnitGroupColumns({ unitCriteria }: { unitCriteria: CriteriaType[] }) {
  return unitCriteria.map((unit, index) => {
    const key = unitGradeKey(index)
    return columnHelper.group({
      id: `unit-${index}`,
      header: () => <span className="font-medium">{unit.label}</span>,
      columns: [
        columnHelper.display({
          id: `unit-${index}-exam`,
          header: () => <CriteriaHeader label={`${EXAM_LABEL} ${unit.label}`} />,
          cell: ({ row }) => (
            <ScoreValue value={row.original.evaluation?.units?.[key]?.exam} />
          ),
          meta: { className: CRITERIA_CELL_CLASS },
        }),
        columnHelper.display({
          id: `unit-${index}-exam-weighted`,
          header: () => (
            <CriteriaHeader
              label={`${EXAM_WEIGHTED_LABEL} ${unit.label} (${UNIT_EXAM_WEIGHT}%)`}
            />
          ),
          cell: ({ row }) => (
            <ScoreValue
              value={row.original.evaluation?.units?.[key]?.examWeighted}
            />
          ),
          meta: { className: CRITERIA_CELL_CLASS },
        }),
        columnHelper.display({
          id: `unit-${index}-final`,
          header: () => (
            <CriteriaHeader label={`${UNIT_FINAL_LABEL} ${unit.label}`} />
          ),
          cell: ({ row }) => (
            <span className="font-medium">
              <ScoreValue
                value={row.original.evaluation?.units?.[key]?.final}
              />
            </span>
          ),
          meta: { className: CRITERIA_CELL_CLASS },
        }),
      ],
    })
  })
}

export function DataTable() {
  const students = useStudentsStore((state) => state.students)
  const removeStudent = useStudentsStore((state) => state.removeStudent)
  const otherCriteria = useEvaluationStore((state) => state.otherCriteria)
  const unitCriteria = useEvaluationStore((state) => state.unitCriteria)
  const assignments = useEvaluationStore((state) => state.assignments)
  const assignmentsPercentageCriteria = useEvaluationStore(
    (state) => state.assignmentsPercentageCriteria
  )

  const [editingStudent, setEditingStudent] = React.useState<StudentType | null>(
    null
  )
  const [evaluatingStudent, setEvaluatingStudent] =
    React.useState<StudentType | null>(null)
  const [deletingStudent, setDeletingStudent] =
    React.useState<StudentType | null>(null)

  const sortedStudents = React.useMemo(
    () => [...students].sort((a, b) => a.name.localeCompare(b.name, "es")),
    [students]
  )

  const handleEdit = React.useCallback(
    (student: StudentType) => setEditingStudent(student),
    []
  )
  const handleEvaluate = React.useCallback(
    (student: StudentType) => setEvaluatingStudent(student),
    []
  )
  const handleDeleteRequest = React.useCallback(
    (student: StudentType) => setDeletingStudent(student),
    []
  )
  const handleExport = React.useCallback(
    async (student: StudentType) => {
      if (student.status !== "evaluated") {
        toast.error("El alumno debe estar evaluado para exportar")
        return
      }
      try {
        const result = await exportAndSaveStudentReport(student, {
          otherCriteria,
          unitCriteria,
          assignments,
          assignmentsPercentage: assignmentsPercentageCriteria.value,
        })
        if (result.saved) {
          toast.success(`Reporte de ${student.name} exportado`)
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo exportar el reporte"
        )
      }
    },
    [
      otherCriteria,
      unitCriteria,
      assignments,
      assignmentsPercentageCriteria,
    ]
  )

  const confirmDeleteStudent = React.useCallback(() => {
    if (deletingStudent) {
      removeStudent(deletingStudent.id)
    }
    setDeletingStudent(null)
  }, [deletingStudent, removeStudent])

  const columns = React.useMemo(() => {
    return columnHelper.columns([
      ...BaseColumns({ otherCriteria }),
      ...UnitGroupColumns({ unitCriteria }),
      columnHelper.display({
        id: "evaluation-icon",
        header: () => <span className="sr-only">Estado de calificación</span>,
        cell: ({ row }) => (
          <div className="flex h-full items-center justify-center">
            <StatusIcon
              final={
                row.original.evaluation?.base ?? row.original.evaluation?.final
              }
            />
          </div>
        ),
        meta: { className: STATUS_ICON_CELL_CLASS },
      }),
      columnHelper.display({
        id: "status",
        header: "Estado",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        meta: { className: STATUS_CELL_CLASS },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => (
          <RowActions
            student={row.original}
            onEdit={handleEdit}
            onEvaluate={handleEvaluate}
            onExport={handleExport}
            onDelete={handleDeleteRequest}
          />
        ),
        meta: { className: ACTIONS_CELL_CLASS },
      }),
    ])
  }, [
    otherCriteria,
    unitCriteria,
    handleEdit,
    handleEvaluate,
    handleExport,
    handleDeleteRequest,
  ])

  const table = useTable({
    features,
    data: sortedStudents,
    columns,
    getRowId: (row) => row.id,
  })

  return (
    <div className="flex w-full flex-col justify-start gap-6">
      <div className="px-4 lg:px-6">
        <StudentsToolbar />
      </div>
      <div className="px-4 lg:px-6">
        <div className="overflow-hidden overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={header.column.columnDef.meta?.className}
                    >
                      {header.isPlaceholder ? null : (
                        <FlexRender header={header} />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getAllCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cell.column.columnDef.meta?.className}
                      >
                        <FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No hay alumnos registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <UpdateStudentDialog
        student={editingStudent}
        onOpenChange={(open) => {
          if (!open) {
            setEditingStudent(null)
          }
        }}
      />
      <EvaluateStudentDialog
        student={evaluatingStudent}
        onOpenChange={(open) => {
          if (!open) {
            setEvaluatingStudent(null)
          }
        }}
      />
      <AlertDialog
        open={deletingStudent !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingStudent(null)
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{DELETE_STUDENT_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingStudent
                ? `¿Estás seguro de que quieres borrar a ${deletingStudent.name}? Esta acción no se puede deshacer.`
                : DELETE_STUDENT_TITLE}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDeleteStudent}
            >
              Borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}