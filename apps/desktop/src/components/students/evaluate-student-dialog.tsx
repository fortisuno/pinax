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
  computeEvaluation,
  gradeSchema,
  type StudentType,
} from "@/lib/students"
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
          <DialogTitle>Calificar a {student?.name}</DialogTitle>
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
  const assignmentsQuantityCriteria = useEvaluationStore(
    (state) => state.assignmentsQuantityCriteria
  )
  const assignmentsPercentageCriteria = useEvaluationStore(
    (state) => state.assignmentsPercentageCriteria
  )
  const otherCriteria = useEvaluationStore((state) => state.otherCriteria)
  const saveEvaluation = useStudentsStore((state) => state.saveEvaluation)

  const assignmentsCount = assignmentsQuantityCriteria.value
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
      const evaluation = computeEvaluation({
        assignmentGrades,
        criteriaGrades,
        assignmentsPercentage: assignmentsPercentageCriteria.value,
        otherCriteria,
      })
      saveEvaluation(student.id, {
        assignmentGrades,
        criteriaGrades,
        evaluation,
      })
      onSubmitted()
    },
  })

  const canSubmit = useSelector(form.store, (state) => state.canSubmit)

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
    >
      <div className="no-scrollbar flex max-h-[60vh] flex-col gap-6 overflow-y-auto pr-1">
        <FieldSet>
          <FieldLegend>Tareas ({assignmentsCount})</FieldLegend>
          <div className="grid grid-cols-1 gap-3">
            {assignmentIndices.map((index, i) => (
              <React.Fragment key={index}>
                <form.Field
                  name={`assignments[${index}]`}
                  validators={{ onChange: gradeSchema }}
                >
                  {(field) => (
                    <GradeField field={field} label={`Tarea ${index + 1}`} />
                  )}
                </form.Field>
                {i < assignmentIndices.length - 1 ? <Separator /> : null}
              </React.Fragment>
            ))}
          </div>
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

function GradeField({ field, label }: { field: AnyFieldApi; label: string }) {
  const invalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <Field data-invalid={invalid || undefined} orientation="horizontal">
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
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
        className="w-25"
      />
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )
}
