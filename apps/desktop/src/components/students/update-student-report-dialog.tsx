import { useSelector, useForm } from "@tanstack/react-form"

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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  GRADE_OPTIONS,
  GROUP_OPTIONS,
  studentReportSchema,
} from "@/lib/students"
import { useStudentsStore } from "@/stores/students-store"

function buildYearOptions(): string[] {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 11 }, (_, index) =>
    String(currentYear - 5 + index)
  )
}

interface UpdateStudentReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateStudentReportDialog({
  open,
  onOpenChange,
}: UpdateStudentReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar grupo</DialogTitle>
          <DialogDescription>
            Actualiza ciclo, grado, grupo y periodo.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <UpdateStudentReportForm onSubmitted={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function UpdateStudentReportForm({ onSubmitted }: { onSubmitted: () => void }) {
  const report = useStudentsStore((state) => state.report)
  const updateReportMetadata = useStudentsStore(
    (state) => state.updateReportMetadata
  )
  const yearOptions = buildYearOptions()

  const form = useForm({
    defaultValues: {
      startYear: report.startYear,
      endYear: report.endYear,
      grade: report.grade,
      group: report.group,
      period: report.period,
    },
    validators: {
      onChange: studentReportSchema,
    },
    onSubmit: ({ value }) => {
      const parsed = studentReportSchema.parse(value)
      updateReportMetadata({ ...parsed })
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
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="startYear">
            {(field) => {
              const invalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={invalid || undefined}>
                  <FieldLabel htmlFor={field.name}>Ciclo inicio</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (typeof value === "string") field.handleChange(value)
                    }}
                  >
                    <SelectTrigger
                      id={field.name}
                      className="w-full"
                      aria-invalid={invalid || undefined}
                    >
                      <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )
            }}
          </form.Field>
          <form.Field name="endYear">
            {(field) => {
              const invalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={invalid || undefined}>
                  <FieldLabel htmlFor={field.name}>Ciclo fin</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (typeof value === "string") field.handleChange(value)
                    }}
                  >
                    <SelectTrigger
                      id={field.name}
                      className="w-full"
                      aria-invalid={invalid || undefined}
                    >
                      <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )
            }}
          </form.Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="grade">
            {(field) => {
              const invalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={invalid || undefined}>
                  <FieldLabel htmlFor={field.name}>Grado</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (typeof value === "string") field.handleChange(value)
                    }}
                  >
                    <SelectTrigger
                      id={field.name}
                      className="w-full"
                      aria-invalid={invalid || undefined}
                    >
                      <SelectValue placeholder="Grado" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_OPTIONS.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )
            }}
          </form.Field>
          <form.Field name="group">
            {(field) => {
              const invalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={invalid || undefined}>
                  <FieldLabel htmlFor={field.name}>Grupo</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (typeof value === "string") field.handleChange(value)
                    }}
                  >
                    <SelectTrigger
                      id={field.name}
                      className="w-full"
                      aria-invalid={invalid || undefined}
                    >
                      <SelectValue placeholder="Grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {GROUP_OPTIONS.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )
            }}
          </form.Field>
        </div>
        <form.Field name="period">
          {(field) => {
            const invalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={invalid || undefined}>
                <FieldLabel htmlFor={field.name}>Periodo</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Ej. Primer Trimestre"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={invalid || undefined}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )
          }}
        </form.Field>
      </FieldGroup>
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancelar
        </DialogClose>
        <Button type="submit" disabled={!canSubmit}>
          Guardar
        </Button>
      </DialogFooter>
    </form>
  )
}
