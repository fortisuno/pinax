import * as React from "react"
import { PlusIcon, TrashIcon } from "lucide-react"

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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { assignmentDescriptionSchema } from "@/lib/evaluation"
import { useEvaluationStore } from "@/stores/evaluation-store"

interface ManageAssignmentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PLACEHOLDER_EXAMPLES = [
  "Ej. Ensayo sobre la Revolución",
  "Ej. Mapa conceptual",
  "Ej. Exposición en equipo",
]

export function ManageAssignmentsDialog({
  open,
  onOpenChange,
}: ManageAssignmentsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gestionar tareas</DialogTitle>
          <DialogDescription>
            Define la lista de tareas consideradas en la evaluación.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <ManageAssignmentsForm onSubmitted={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function ManageAssignmentsForm({ onSubmitted }: { onSubmitted: () => void }) {
  const assignments = useEvaluationStore((state) => state.assignments)
  const addAssignment = useEvaluationStore((state) => state.addAssignment)
  const updateAssignment = useEvaluationStore(
    (state) => state.updateAssignment
  )
  const removeAssignment = useEvaluationStore(
    (state) => state.removeAssignment
  )

  const [draft, setDraft] = React.useState<string[]>(() =>
    assignments.map((assignment) => assignment.description)
  )

  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null)
  const prevCountRef = React.useRef(draft.length)
  const shouldFocusNewRef = React.useRef(false)

  React.useEffect(() => {
    setDraft(assignments.map((assignment) => assignment.description))
  }, [assignments])

  React.useEffect(() => {
    const prev = prevCountRef.current
    prevCountRef.current = draft.length
    if (inputRefs.current.length > draft.length) {
      inputRefs.current.length = draft.length
    }
    if (shouldFocusNewRef.current && draft.length > prev) {
      shouldFocusNewRef.current = false
      let secondFrame = 0
      const firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          const last = inputRefs.current[draft.length - 1]
          if (!last) return
          last.focus({ preventScroll: true })
          const container = scrollContainerRef.current
          if (container) {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: "smooth",
            })
          } else {
            last.scrollIntoView({ behavior: "smooth", block: "end" })
          }
        })
      })
      return () => {
        cancelAnimationFrame(firstFrame)
        if (secondFrame) cancelAnimationFrame(secondFrame)
      }
    } else if (draft.length <= prev) {
      shouldFocusNewRef.current = false
    }
  }, [draft.length])

  const errors = React.useMemo(
    () =>
      draft.map((value) => {
        const result = assignmentDescriptionSchema.safeParse(value)
        return result.success ? null : (result.error.issues[0]?.message ?? "Valor inválido")
      }),
    [draft]
  )

  const isValid = errors.every((error) => error === null)

  const handleAdd = React.useCallback(() => {
    shouldFocusNewRef.current = true
    setDraft((prev) => [...prev, ""])
  }, [])

  const handleRemove = React.useCallback((index: number) => {
    inputRefs.current.splice(index, 1)
    setDraft((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleChange = React.useCallback((index: number, value: string) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? value : item)))
  }, [])

  const handleSubmit = React.useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (!isValid) return
      const parsed = draft.map(
        (value) => assignmentDescriptionSchema.parse(value) as string
      )
      for (let i = assignments.length - 1; i >= parsed.length; i -= 1) {
        removeAssignment(i)
      }
      const common = Math.min(assignments.length, parsed.length)
      for (let i = 0; i < common; i += 1) {
        if (assignments[i]?.description !== parsed[i]) {
          updateAssignment(i, { description: parsed[i] ?? "" })
        }
      }
      for (let i = assignments.length; i < parsed.length; i += 1) {
        addAssignment({ description: parsed[i] ?? "" })
      }
      onSubmitted()
    },
    [
      assignments,
      draft,
      isValid,
      addAssignment,
      updateAssignment,
      removeAssignment,
      onSubmitted,
    ]
  )

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div
        ref={scrollContainerRef}
        className="no-scrollbar flex max-h-[60vh] flex-col gap-6 overflow-y-auto p-1 pb-2"
      >
        <FieldGroup>
          <div className="grid grid-cols-1 gap-3">
            {draft.map((value, index) => {
              const error = errors[index]
              const invalid = error !== null
              return (
                <Field key={index} data-invalid={invalid || undefined}>
                  <FieldLabel htmlFor={`assignment-${index}`}>
                    Tarea {index + 1}
                  </FieldLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`assignment-${index}`}
                      name={`assignment-${index}`}
                      type="text"
                      placeholder={`Descripción (${PLACEHOLDER_EXAMPLES[index % PLACEHOLDER_EXAMPLES.length]})`}
                      value={value}
                      ref={(node) => {
                        inputRefs.current[index] = node
                      }}
                      onChange={(event) =>
                        handleChange(index, event.target.value)
                      }
                      aria-invalid={invalid || undefined}
                      className="flex-1 scroll-mb-2"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      tabIndex={-1}
                      aria-label={`Quitar Tarea ${index + 1}`}
                      onClick={() => handleRemove(index)}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                  <FieldError errors={error ? [{ message: error }] : undefined} />
                </Field>
              )
            })}
            {draft.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin tareas definidas. Agrega la primera con el botón de abajo.
              </p>
            ) : null}
          </div>
        </FieldGroup>
      </div>
      <DialogFooter className="sm:justify-between">
        <Button type="button" variant="outline" onClick={handleAdd}>
          <PlusIcon data-icon="inline-start" />
          Agregar tarea
        </Button>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancelar
          </DialogClose>
          <Button type="submit" disabled={!isValid}>
            Guardar
          </Button>
        </div>
      </DialogFooter>
    </form>
  )
}
