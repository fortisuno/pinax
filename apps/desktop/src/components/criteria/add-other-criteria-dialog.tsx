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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { otherCriteriaSchema } from "@/lib/evaluation"
import { toTitleCase } from "@/lib/utils"
import { useEvaluationStore } from "@/stores/evaluation-store"

interface AddOtherCriteriaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddOtherCriteriaDialog({
  open,
  onOpenChange,
}: AddOtherCriteriaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar criterio</DialogTitle>
          <DialogDescription>
            Define un nuevo criterio de evaluación y su ponderación.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <AddOtherCriteriaForm onSubmitted={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function AddOtherCriteriaForm({ onSubmitted }: { onSubmitted: () => void }) {
  const addOtherCriteria = useEvaluationStore(
    (state) => state.addOtherCriteria
  )

  const form = useForm({
    defaultValues: {
      label: "",
      value: "",
    },
    validators: {
      onChange: otherCriteriaSchema,
    },
    onSubmit: ({ value }) => {
      const criteria = otherCriteriaSchema.parse(value)
      addOtherCriteria({ ...criteria, label: toTitleCase(criteria.label) })
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
        <form.Field name="label">
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
                  placeholder="Ej. Examen final"
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
        <form.Field name="value">
          {(field) => {
            const invalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={invalid || undefined}>
                <FieldLabel htmlFor={field.name}>
                  Ponderación (%)
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    onBlur={field.handleBlur}
                    aria-invalid={invalid || undefined}
                  />
                  <InputGroupAddon align="inline-end">
                    <span aria-hidden="true">%</span>
                  </InputGroupAddon>
                </InputGroup>
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
