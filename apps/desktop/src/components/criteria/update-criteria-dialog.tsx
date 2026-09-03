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
import {
  criteriaLabelSchema,
  criteriaPercentageSchema,
  criteriaQuantitySchema,
  type CriteriaType,
} from "@/lib/evaluation"

export type CriteriaValueSchema =
  | typeof criteriaQuantitySchema
  | typeof criteriaPercentageSchema

interface UpdateCriteriaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  criteria: CriteriaType
  valueSchema: CriteriaValueSchema
  valueLabel: string
  showLabel?: boolean
  onUpdate: (updated: CriteriaType) => void
}

export function UpdateCriteriaDialog({
  open,
  onOpenChange,
  title,
  description,
  criteria,
  valueSchema,
  valueLabel,
  showLabel = true,
  onUpdate,
}: UpdateCriteriaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {open ? (
          <UpdateCriteriaForm
            key={`${criteria.label}-${criteria.value}`}
            criteria={criteria}
            valueSchema={valueSchema}
            valueLabel={valueLabel}
            showLabel={showLabel}
            onUpdate={onUpdate}
            onSubmitted={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function UpdateCriteriaForm({
  criteria,
  valueSchema,
  valueLabel,
  showLabel,
  onUpdate,
  onSubmitted,
}: {
  criteria: CriteriaType
  valueSchema: CriteriaValueSchema
  valueLabel: string
  showLabel: boolean
  onUpdate: (updated: CriteriaType) => void
  onSubmitted: () => void
}) {
  const form = useForm({
    defaultValues: {
      label: criteria.label,
      value: String(criteria.value),
    },
    onSubmit: ({ value }) => {
      const parsedValue = valueSchema.parse(value.value)
      const updated: CriteriaType = showLabel
        ? { label: value.label, value: parsedValue }
        : { label: criteria.label, value: parsedValue }
      onUpdate(updated)
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
        {showLabel ? (
          <form.Field
            name="label"
            validators={{ onChange: criteriaLabelSchema }}
          >
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
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    onBlur={field.handleBlur}
                    aria-invalid={invalid || undefined}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )
            }}
          </form.Field>
        ) : null}
        <form.Field name="value" validators={{ onChange: valueSchema }}>
          {(field) => {
            const invalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            const isQuantity = valueSchema === criteriaQuantitySchema
            const fieldProps = {
              id: field.name,
              name: field.name,
              type: "number" as const,
              min: isQuantity ? 1 : 0,
              max: isQuantity ? 150 : 100,
              step: isQuantity ? 1 : ("any" as const),
              value: field.state.value,
              onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                field.handleChange(event.target.value),
              onBlur: field.handleBlur,
              "aria-invalid": invalid || undefined,
            }
            return (
              <Field data-invalid={invalid || undefined}>
                <FieldLabel htmlFor={field.name}>{valueLabel}</FieldLabel>
                {isQuantity ? (
                  <Input {...fieldProps} />
                ) : (
                  <InputGroup>
                    <InputGroupInput {...fieldProps} />
                    <InputGroupAddon align="inline-end">
                      <span aria-hidden="true">%</span>
                    </InputGroupAddon>
                  </InputGroup>
                )}
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