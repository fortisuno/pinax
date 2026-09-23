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
import { studentNamePartsSchema } from "@/lib/students"
import { toTitleCase } from "@/lib/utils"
import { useStudentsStore } from "@/stores/students-store"

const addStudentSchema = studentNamePartsSchema

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
      paternalSurname: "",
      maternalSurname: "",
      firstNames: "",
    },
    validators: {
      onChange: addStudentSchema,
    },
    onSubmit: ({ value }) => {
      const parsed = addStudentSchema.parse(value)
      addStudent({
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
          Agregar
        </Button>
      </DialogFooter>
    </form>
  )
}
