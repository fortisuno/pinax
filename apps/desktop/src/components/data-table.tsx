import * as React from "react"
import {
  createColumnHelper,
  FlexRender,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import {
  CircleCheckIcon,
  ClipboardCheckIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  LoaderIcon,
  PencilIcon,
  TrashIcon,
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
  TableFooter,
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
import { cn } from "@/lib/utils"
import {
  UNIT_BASE_WEIGHT,
  UNIT_EXAM_WEIGHT,
  unitGradeKey,
  type CriteriaType,
} from "@/lib/evaluation"
import { exportAndSaveStudentReport } from "@/lib/pdf-export"
import { useEvaluationStore } from "@/stores/evaluation-store"
import { useStudentsStore } from "@/stores/students-store"

const BASE_GRADE_ABBREVIATION = "CB"
const BASE_GRADE_LABEL = "Calificación Base"
const BASE_WEIGHTED_ABBREVIATION = "CBP"
const EXAM_ABBREVIATION = "E"
const EXAM_LABEL = "Examen"
const EXAM_WEIGHTED_ABBREVIATION = "EP"
const UNIT_FINAL_ABBREVIATION = "CF"
const UNIT_FINAL_LABEL = "Calificación Final"
const UNIT_FINAL_ROUNDED_ABBREVIATION = "CFR"
const UNIT_FINAL_ROUNDED_LABEL = "Calificación Final Redondeada"
const DELETE_STUDENT_TITLE = "Borrar alumno"

const COMPACT_CELL_CLASS = "px-2 text-center whitespace-nowrap"
const CRITERIA_CELL_CLASS = `${COMPACT_CELL_CLASS} w-14`
const STATUS_CELL_CLASS = `${COMPACT_CELL_CLASS} w-32`
const ACTIONS_CELL_CLASS = `${COMPACT_CELL_CLASS} w-12`
const HIGHLIGHT_CELL_CLASS = "bg-accent/50"

const features = tableFeatures({})

const columnHelper = createColumnHelper<typeof features, StudentType>()

function CriteriaHeader({
  abbreviation,
  tooltip,
}: {
  abbreviation: string
  tooltip: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger className="cursor-help underline decoration-dotted underline-offset-4 outline-none">
        {abbreviation}
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

function ScoreValue({
  value,
  showIndicator = false,
}: {
  value: number | undefined
  showIndicator?: boolean
}) {
  if (value === undefined) {
    return <span className="text-muted-foreground">—</span>
  }
  let indicatorClassName: string | undefined
  if (value < 6) {
    indicatorClassName = "bg-destructive"
  } else if (value < 8) {
    indicatorClassName = "bg-yellow-500 dark:bg-yellow-400"
  } else {
    indicatorClassName = "bg-green-500 dark:bg-green-400"
  }
  return (
    <span className="inline-flex">
      <span>{formatScore(value)}</span>
      {showIndicator ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-0 right-0 size-2 [clip-path:polygon(0%_0%,100%_0%,100%_100%)]",
            indicatorClassName
          )}
        />
      ) : null}
    </span>
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

function BaseColumns() {
  return [
    columnHelper.accessor("displayName", {
      header: "Nombre",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.displayName}</span>
      ),
    }),
    columnHelper.display({
      id: "base",
      header: () => (
        <CriteriaHeader
          abbreviation={BASE_GRADE_ABBREVIATION}
          tooltip={BASE_GRADE_LABEL}
        />
      ),
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
        <CriteriaHeader
          abbreviation={BASE_WEIGHTED_ABBREVIATION}
          tooltip={`Calificación Base Ponderada (${UNIT_BASE_WEIGHT}%)`}
        />
      ),
      cell: ({ row }) => (
        <ScoreValue value={row.original.evaluation?.baseWeighted} />
      ),
      meta: { className: cn(CRITERIA_CELL_CLASS, HIGHLIGHT_CELL_CLASS) },
    }),
  ]
}

function UnitGroupColumns({ unitCriteria }: { unitCriteria: CriteriaType[] }) {
  return unitCriteria.map((unit, index) => {
    const key = unitGradeKey(index)
    return columnHelper.group({
      id: `unit-${index}`,
      header: () => (
        <CriteriaHeader
          abbreviation={getInitials(unit.label)}
          tooltip={unit.label}
        />
      ),
      columns: [
        columnHelper.display({
          id: `unit-${index}-exam`,
          header: () => (
            <CriteriaHeader
              abbreviation={EXAM_ABBREVIATION}
              tooltip={EXAM_LABEL}
            />
          ),
          cell: ({ row }) => (
            <ScoreValue value={row.original.evaluation?.units?.[key]?.exam} />
          ),
          meta: { className: CRITERIA_CELL_CLASS },
        }),
        columnHelper.display({
          id: `unit-${index}-exam-weighted`,
          header: () => (
            <CriteriaHeader
              abbreviation={EXAM_WEIGHTED_ABBREVIATION}
              tooltip={`Examen Ponderado (${UNIT_EXAM_WEIGHT}%)`}
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
            <CriteriaHeader
              abbreviation={UNIT_FINAL_ABBREVIATION}
              tooltip={UNIT_FINAL_LABEL}
            />
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
        columnHelper.display({
          id: `unit-${index}-final-rounded`,
          header: () => (
            <CriteriaHeader
              abbreviation={UNIT_FINAL_ROUNDED_ABBREVIATION}
              tooltip={UNIT_FINAL_ROUNDED_LABEL}
            />
          ),
          cell: ({ row }) => {
            const final = row.original.evaluation?.units?.[key]?.final
            return (
              <span className="font-medium">
                <ScoreValue
                  value={final === undefined ? undefined : Math.round(final)}
                  showIndicator
                />
              </span>
            )
          },
          meta: {
            className: cn(CRITERIA_CELL_CLASS, HIGHLIGHT_CELL_CLASS, "relative"),
          },
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
    () => [...students].sort((a, b) => a.displayName.localeCompare(b.displayName, "es")),
    [students]
  )

  const unitAverages = React.useMemo(() => {
    const evaluated = sortedStudents.filter(
      (student) => student.status === "evaluated" && student.evaluation
    )
    if (evaluated.length === 0) return null
    return unitCriteria.map((_, index) => {
      const key = unitGradeKey(index)
      const finals = evaluated
        .map((student) => student.evaluation?.units?.[key]?.final)
        .filter((value): value is number => value !== undefined)
      if (finals.length === 0) return { cfr: undefined }
      const rounded = finals.map((value) => Math.round(value))
      const cfr =
        rounded.reduce((sum, value) => sum + value, 0) / rounded.length
      return { cfr }
    })
  }, [sortedStudents, unitCriteria])

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
          toast.success(`Reporte de ${student.displayName} exportado`)
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
      ...BaseColumns(),
      ...UnitGroupColumns({ unitCriteria }),
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
                      className={cn(
                        header.column.columnDef.meta?.className,
                        header.colSpan > 1 && "text-center"
                      )}
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
                    colSpan={table.getAllLeafColumns().length}
                    className="h-24 text-center"
                  >
                    No hay alumnos registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>
                  <span className="font-medium">Promedio Grupal</span>
                </TableCell>
                <TableCell className={CRITERIA_CELL_CLASS} />
                <TableCell
                  className={cn(CRITERIA_CELL_CLASS, HIGHLIGHT_CELL_CLASS)}
                />
                {unitCriteria.map((_, index) => (
                  <React.Fragment key={`average-${index}`}>
                    <TableCell className={CRITERIA_CELL_CLASS} />
                    <TableCell className={CRITERIA_CELL_CLASS} />
                    <TableCell className={CRITERIA_CELL_CLASS} />
                    <TableCell
                      className={cn(
                        CRITERIA_CELL_CLASS,
                        HIGHLIGHT_CELL_CLASS,
                        "relative"
                      )}
                    >
                      <span className="font-medium">
                        <ScoreValue
                          value={unitAverages?.[index]?.cfr}
                          showIndicator
                        />
                      </span>
                    </TableCell>
                  </React.Fragment>
                ))}
                <TableCell className={STATUS_CELL_CLASS} />
                <TableCell className={ACTIONS_CELL_CLASS} />
              </TableRow>
            </TableFooter>
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
                ? `¿Estás seguro de que quieres borrar a ${deletingStudent.displayName}? Esta acción no se puede deshacer.`
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