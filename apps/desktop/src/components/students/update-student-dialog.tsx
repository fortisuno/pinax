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
import { studentNamePartsSchema, type StudentType } from "@/lib/students"
import { toTitleCase } from "@/lib/utils"
import { useStudentsStore } from "@/stores/students-store"

const updateStudentSchema = studentNamePartsSchema

interface UpdateStudentDialogProps {
  student: StudentType | null
  onOpenChange: (open: boolean) => void
}

export function UpdateStudentDialog({
  student,
  onOpenChange,
}: UpdateStudentDialogProps) {
  return (
    <Dialog open={student !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar alumno</DialogTitle>
          <DialogDescription>Actualiza los datos del alumno.</DialogDescription>
        </DialogHeader>
        {student ? (
          <UpdateStudentForm
            key={student.id}
            student={student}
            onSubmitted={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function UpdateStudentForm({
  student,
  onSubmitted,
}: {
  student: StudentType
  onSubmitted: () => void
}) {
  const updateStudent = useStudentsStore((state) => state.updateStudent)

  const form = useForm({
    defaultValues: {
      paternalSurname: student.paternalSurname,
      maternalSurname: student.maternalSurname,
      firstNames: student.firstNames,
    },
    validators: {
      onChange: updateStudentSchema,
    },
    onSubmit: ({ value }) => {
      const parsed = updateStudentSchema.parse(value)
      updateStudent(student.id, {
        paternalSurname: toTitleCase(parsed.paternalSurname),
        maternalSurname: toTitleCase(parsed.maternalSurname),
        firstNames: toTitleCase(parsed.firstNames),
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
      <FieldGroup>
        <form.Field name="paternalSurname">
          {(field) => {
            const invalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={invalid || undefined}>
                <FieldLabel htmlFor={field.name}>Apellido Paterno</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Ej. López"
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
        <form.Field name="maternalSurname">
          {(field) => {
            const invalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={invalid || undefined}>
                <FieldLabel htmlFor={field.name}>Apellido Materno</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Ej. García"
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
        <form.Field name="firstNames">
          {(field) => {
            const invalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={invalid || undefined}>
                <FieldLabel htmlFor={field.name}>Nombres</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Ej. Juan Carlos"
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
