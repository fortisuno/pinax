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
import { studentNameSchema } from "@/lib/students"
import { toTitleCase } from "@/lib/utils"
import { useStudentsStore } from "@/stores/students-store"

const addStudentSchema = z.object({
  name: studentNameSchema,
})

interface AddStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddStudentDialog({
  open,
  onOpenChange,
}: AddStudentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar alumno</DialogTitle>
          <DialogDescription>
            Registra un nuevo alumno para ser evaluado.
          </DialogDescription>
        </DialogHeader>
        {open ? <AddStudentForm onSubmitted={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function AddStudentForm({ onSubmitted }: { onSubmitted: () => void }) {
  const addStudent = useStudentsStore((state) => state.addStudent)

  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onChange: addStudentSchema,
    },
    onSubmit: ({ value }) => {
      const student = addStudentSchema.parse(value)
      addStudent(toTitleCase(student.name))
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
                  placeholder="Ej. López García Juan"
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
          Agregar
        </Button>
      </DialogFooter>
    </form>
  )
}
