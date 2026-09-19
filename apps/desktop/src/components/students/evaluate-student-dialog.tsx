import * as React from "react"
import { useSelector, useForm, type AnyFieldApi } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  computeEvaluation,
  gradeSchema,
  resolveUnitExam,
  type StudentType,
} from "@/lib/students"
import { unitGradeKey } from "@/lib/evaluation"
import { useEvaluationStore } from "@/stores/evaluation-store"
import { useStudentsStore } from "@/stores/students-store"

interface EvaluateStudentDialogProps {
  student: StudentType | null
  onOpenChange: (open: boolean) => void
}

export function EvaluateStudentDialog({
  student,
  onOpenChange,
}: EvaluateStudentDialogProps) {
  return (
    <Dialog open={student !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Calificar a {student?.displayName}</DialogTitle>
          <DialogDescription>
            Asigna la calificación obtenida en cada tarea y en cada criterio,
            antes de ponderar.
          </DialogDescription>
        </DialogHeader>
        {student ? (
          <EvaluateStudentForm
            key={student.id}
            student={student}
            onSubmitted={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function EvaluateStudentForm({
  student,
  onSubmitted,
}: {
  student: StudentType
  onSubmitted: () => void
}) {
  const assignments = useEvaluationStore((state) => state.assignments)
  const assignmentsPercentageCriteria = useEvaluationStore(
    (state) => state.assignmentsPercentageCriteria
  )
  const otherCriteria = useEvaluationStore((state) => state.otherCriteria)
  const unitCriteria = useEvaluationStore((state) => state.unitCriteria)
  const saveEvaluation = useStudentsStore((state) => state.saveEvaluation)

  const assignmentsCount = assignments.length
  const assignmentIndices = Array.from(
    { length: assignmentsCount },
    (_, index) => index
  )

  const form = useForm({
    defaultValues: {
      assignments: assignmentIndices.map((index) =>
        student.assignmentGrades[index] !== undefined
          ? String(student.assignmentGrades[index])
          : "0"
      ),
      criteria: otherCriteria.map((criterion) =>
        student.criteriaGrades[criterion.label] !== undefined
          ? String(student.criteriaGrades[criterion.label])
          : "0"
      ),
      units: unitCriteria.map((unit, index) =>
        String(resolveUnitExam(student.unitGrades, index, unit.label))
      ),
    },
    onSubmit: ({ value }) => {
      const assignmentGrades = value.assignments.map((grade) =>
        gradeSchema.parse(grade)
      )
      const criteriaGrades: Record<string, number> = {}
      otherCriteria.forEach((criterion, index) => {
        criteriaGrades[criterion.label] = gradeSchema.parse(
          value.criteria[index] ?? "0"
        )
      })
      const unitGrades: Record<string, number> = {}
      unitCriteria.forEach((_, index) => {
        unitGrades[unitGradeKey(index)] = gradeSchema.parse(
          value.units[index] ?? "0"
        )
      })
      const evaluation = computeEvaluation({
        assignmentGrades,
        criteriaGrades,
        unitGrades,
        assignmentsPercentage: assignmentsPercentageCriteria.value,
        otherCriteria,
        unitCriteria,
      })
      saveEvaluation(student.id, {
        assignmentGrades,
        criteriaGrades,
        unitGrades,
        evaluation,
      })
      onSubmitted()
    },
  })

  const canSubmit = useSelector(form.store, (state) => state.canSubmit)

  const formRef = React.useRef<HTMLFormElement | null>(null)

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const input = formRef.current?.querySelector("input")
      if (!(input instanceof HTMLInputElement)) return
      input.focus({ preventScroll: true })
      try {
        input.select()
      } catch {
        // type="number" sin select(): aplica fallback abajo
      }
      try {
        input.setSelectionRange(0, input.value.length)
      } catch {
        // type="number" sin selección programática: solo foco
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <form
      ref={formRef}
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
    >
      <div className="no-scrollbar flex max-h-[60vh] flex-col gap-6 overflow-y-auto p-1 pb-2">
        <FieldSet>
          <FieldLegend>Tareas ({assignmentsCount})</FieldLegend>
          {assignmentsCount === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sin tareas definidas. Agrégalas desde Criterios.
            </p>
          ) : (
            <TooltipProvider>
              <div className="grid grid-cols-1 gap-3">
                {assignmentIndices.map((index, i) => (
                  <React.Fragment key={index}>
                    <form.Field
                      name={`assignments[${index}]`}
                      validators={{ onChange: gradeSchema }}
                    >
                      {(field) => (
                        <GradeField
                          field={field}
                          label={
                            <Tooltip>
                              <TooltipTrigger
                                type="button"
                                tabIndex={-1}
                                className="cursor-help underline decoration-dotted underline-offset-4 outline-none"
                              >
                                Tarea {index + 1}
                              </TooltipTrigger>
                              <TooltipContent>
                                {assignments[index]?.description ??
                                  `Tarea ${index + 1}`}
                              </TooltipContent>
                            </Tooltip>
                          }
                        />
                      )}
                    </form.Field>
                    {i < assignmentIndices.length - 1 ? <Separator /> : null}
                  </React.Fragment>
                ))}
              </div>
            </TooltipProvider>
          )}
        </FieldSet>
        {otherCriteria.length > 0 ? (
          <FieldSet>
            <FieldLegend>Otros criterios</FieldLegend>
            <div className="grid grid-cols-1 gap-3">
              {otherCriteria.map((criterion, index, array) => (
                <React.Fragment key={criterion.label}>
                  <form.Field
                    name={`criteria[${index}]`}
                    validators={{ onChange: gradeSchema }}
                  >
                    {(field) => (
                      <GradeField field={field} label={criterion.label} />
                    )}
                  </form.Field>
                  {index < array.length - 1 ? <Separator /> : null}
                </React.Fragment>
              ))}
            </div>
          </FieldSet>
        ) : null}
        <FieldSet>
          <FieldLegend>Unidades de aprendizaje</FieldLegend>
          <div className="grid grid-cols-1 gap-3">
            {unitCriteria.map((unit, index, array) => (
              <React.Fragment key={unitGradeKey(index)}>
                <form.Field
                  name={`units[${index}]`}
                  validators={{ onChange: gradeSchema }}
                >
                  {(field) => (
                    <GradeField
                      field={field}
                      label={`Examen ${unit.label}`}
                    />
                  )}
                </form.Field>
                {index < array.length - 1 ? <Separator /> : null}
              </React.Fragment>
            ))}
          </div>
        </FieldSet>
      </div>
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancelar
        </DialogClose>
        <Button type="submit" disabled={!canSubmit}>
          Guardar calificaciones
        </Button>
      </DialogFooter>
    </form>
  )
}

function GradeField({
  field,
  label,
}: {
  field: AnyFieldApi
  label: React.ReactNode
}) {
  const invalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <Field data-invalid={invalid || undefined} orientation="horizontal">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        <FieldError errors={field.state.meta.errors} />
      </div>
      <Input
        id={field.name}
        name={field.name}
        type="number"
        min={0}
        max={10}
        step="any"
        value={field.state.value as string}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={invalid || undefined}
        className="w-25 shrink-0"
      />
    </Field>
  )
}
