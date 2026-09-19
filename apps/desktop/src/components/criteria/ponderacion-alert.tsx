import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
} from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"

export type PonderacionStatus = "ok" | "warning" | "destructive"

export const PONDERACION_STATUS_CLASSNAMES: Record<
  PonderacionStatus,
  string
> = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-900 *:data-[slot=alert-description]:text-emerald-900/80 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100 dark:*:data-[slot=alert-description]:text-emerald-100/80",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 *:data-[slot=alert-description]:text-amber-900/80 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 dark:*:data-[slot=alert-description]:text-amber-100/80",
  destructive: "",
}

export function getPonderacionStatus(total: number): PonderacionStatus {
  if (total > 100) return "destructive"
  if (total < 100) return "warning"
  return "ok"
}

export function PonderacionAlert({
  totalPercentage,
}: {
  totalPercentage: number
}) {
  const status = getPonderacionStatus(totalPercentage)
  const difference = Math.abs(100 - totalPercentage)
  const totalLabel = `${totalPercentage}%`

  if (status === "ok") {
    return (
      <Alert
        className={`${PONDERACION_STATUS_CLASSNAMES.ok} w-fit max-w-full shrink-0`}
      >
        <CheckCircle2Icon />
        <AlertTitle>Ponderación completa: {totalLabel}</AlertTitle>
      </Alert>
    )
  }

  if (status === "warning") {
    return (
      <Alert
        className={`${PONDERACION_STATUS_CLASSNAMES.warning} w-fit max-w-full shrink-0`}
      >
        <AlertTriangleIcon />
        <AlertTitle>
          Ponderación incompleta: {totalLabel} (falta {difference}%)
        </AlertTitle>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive" className="w-fit max-w-full shrink-0">
      <AlertCircleIcon />
      <AlertTitle>
        Ponderación excedida: {totalLabel} (sobra {difference}%)
      </AlertTitle>
    </Alert>
  )
}
