import { useSelector, useForm } from "@tanstack/react-form"
import { z } from "zod"

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
import { studentNameSchema, type StudentType } from "@/lib/students"
import { useStudentsStore } from "@/stores/students-store"

const updateStudentSchema = z.object({
  name: studentNameSchema,
})

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
          <DialogDescription>Actualiza el nombre del alumno.</DialogDescription>
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
      name: student.name,
    },
    validators: {
      onChange: updateStudentSchema,
    },
    onSubmit: ({ value }) => {
      const parsed = updateStudentSchema.parse(value)
      updateStudent(student.id, parsed.name)
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
        <form.Field name="name">
          {(field) => {
            const invalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={invalid || undefined}>
                <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
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
