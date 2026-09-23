import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import {
  getInitials,
  type StudentType,
} from "@/lib/students"
import {
  UNIT_BASE_WEIGHT,
  UNIT_EXAM_WEIGHT,
  unitGradeKey,
  type Assignment,
  type CriteriaType,
} from "@/lib/evaluation"
import { toTitleCase } from "@/lib/utils"

const PAGE_FORMAT = "letter" as const
const PAGE_ORIENTATION = "portrait" as const
const MARGIN_MM = 15

const DASH = "—"
const TASKS_DELIVERED_LABEL = "Tareas Entregadas"
const TASKS_LABEL = "Calificación Tareas"
const TASKS_WEIGHTED_LABEL = "Calificación Tareas"
const BASE_GRADE_LABEL = "Calificación Base"
const BASE_WEIGHTED_LABEL = "Calificación Base P."
const EXAM_LABEL = "Examen"
const EXAM_WEIGHTED_LABEL = "Examen P."
const UNIT_FINAL_LABEL = "Calificación Final"
const FOOTER_TEXT = "Pinax"
const LEGEND_TITLE = "Abreviaturas"

const PRIMARY_COLOR: [number, number, number] = [33, 37, 41]
const ACCENT_COLOR: [number, number, number] = [59, 130, 246]
const MUTED_COLOR: [number, number, number] = [107, 114, 128]
const DESCRIPTION_COLOR: [number, number, number] = [156, 163, 175]

const SUMMARY_HIGHLIGHT_FILL: [number, number, number] = [243, 244, 246]

const NOTE_LINE_HEIGHT = 6
const NOTE_HEADING_SIZE = 14
const NOTE_LABEL_SIZE = 10
const NOTE_FOOTER_SIZE = 8
const FOOTER_RESERVE_MM = 7

export interface ExportContext {
  otherCriteria: CriteriaType[]
  assignments: Assignment[]
  assignmentsPercentage: number
  unitCriteria: CriteriaType[]
}

export interface SavePdfResult {
  saved: boolean
  path?: string
}

export function unitAbbreviation(index: number): string {
  return `U${index + 1}`
}

function sortStudentsByDisplayNameAsc(
  students: StudentType[]
): StudentType[] {
  return [...students].sort((a, b) =>
    a.displayName.localeCompare(b.displayName, "es")
  )
}

export function buildSummaryTableData(
  students: StudentType[],
  ctx: ExportContext
) {
  const unitCriteria = ctx.unitCriteria ?? []
  const head: string[] = ["Nombre", "CB", "CBP"]
  unitCriteria.forEach(() => {
    head.push("E", "EP", "CF")
  })

  const groupHead: ({ content: string; colSpan?: number } | string)[] | null =
    unitCriteria.length > 0
      ? [
          "",
          "",
          "",
          ...unitCriteria.map((unit) => ({
            content: getInitials(unit.label),
            colSpan: 3,
          })),
        ]
      : null

  const orderedStudents = sortStudentsByDisplayNameAsc(students)
  const body = orderedStudents.map((student) => {
    const evaluation = student.evaluation
    const row: string[] = [student.displayName]
    if (evaluation) {
      const base = evaluation.base ?? evaluation.final
      row.push(
        formatScoreOrDash(base),
        formatScoreOrDash(evaluation.baseWeighted)
      )
    } else {
      row.push(DASH, DASH)
    }
    unitCriteria.forEach((_, index) => {
      if (evaluation) {
        const unit = evaluation.units?.[unitGradeKey(index)]
        row.push(
          formatScoreOrDash(unit?.exam),
          formatScoreOrDash(unit?.examWeighted),
          formatScoreOrDash(unit?.final)
        )
      } else {
        row.push(DASH, DASH, DASH)
      }
    })
    return row
  })

  // Promedio grupal por unidad: promedio de `Math.round(final)`,
  // replica la lógica del footer de data-table (CFR).
  const evaluated = orderedStudents.filter(
    (student) =>
      student.status === "evaluated" && student.evaluation !== null
  )
  const foot: string[] = ["Promedio Grupal", "", ""]
  unitCriteria.forEach((_, index) => {
    const key = unitGradeKey(index)
    const finals = evaluated
      .map((student) => student.evaluation?.units?.[key]?.final)
      .filter((value): value is number => value !== undefined)
    if (finals.length === 0) {
      foot.push("", "", DASH)
      return
    }
    const rounded = finals.map((value) => Math.round(value))
    const average =
      rounded.reduce((sum, value) => sum + value, 0) / rounded.length
    foot.push("", "", formatScoreOrDash(average))
  })

  const legend: { abbreviation: string; meaning: string }[] = [
    { abbreviation: "CB", meaning: BASE_GRADE_LABEL },
    {
      abbreviation: "CBP",
      meaning: `${BASE_WEIGHTED_LABEL} (${UNIT_BASE_WEIGHT}%)`,
    },
  ]
  for (const unit of unitCriteria) {
    legend.push({
      abbreviation: getInitials(unit.label),
      meaning: unit.label,
    })
  }
  legend.push(
    { abbreviation: "E", meaning: EXAM_LABEL },
    {
      abbreviation: "EP",
      meaning: `${EXAM_WEIGHTED_LABEL} (${UNIT_EXAM_WEIGHT}%)`,
    },
    { abbreviation: "CF", meaning: UNIT_FINAL_LABEL }
  )

  return { head, body, foot, legend, groupHead }
}

function formatScoreOrDash(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) {
    return DASH
  }
  // Dos decimales solo para el PDF; la UI sigue usando `formatScore`.
  return value.toFixed(2)
}

function toUnitTitleCase(label: string): string {
  // Normaliza a minúsculas en español y reutiliza `toTitleCase`
  // para respetar artículos y conjunciones.
  return toTitleCase(label.toLocaleLowerCase("es-MX"))
}

function drawNoteHeader(doc: jsPDF, studentName: string): number {
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFont("helvetica", "bold")
  doc.setFontSize(NOTE_HEADING_SIZE)
  doc.setTextColor(...PRIMARY_COLOR)
  doc.text(studentName, MARGIN_MM, MARGIN_MM + 4)

  doc.setDrawColor(...ACCENT_COLOR)
  doc.setLineWidth(0.4)
  const headingBottom = MARGIN_MM + 6
  doc.line(MARGIN_MM, headingBottom, pageWidth - MARGIN_MM, headingBottom)

  return headingBottom + 8
}

function drawNoteFooter(doc: jsPDF, pageNum: number, dateStr: string): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const footerY = pageHeight - MARGIN_MM

  doc.setDrawColor(...MUTED_COLOR)
  doc.setLineWidth(0.2)
  doc.line(MARGIN_MM, footerY - 4, pageWidth - MARGIN_MM, footerY - 4)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(NOTE_FOOTER_SIZE)
  doc.setTextColor(...MUTED_COLOR)
  doc.text(`${FOOTER_TEXT} · Generado el ${dateStr}`, MARGIN_MM, footerY)
  doc.text(`Pág. ${pageNum}`, pageWidth - MARGIN_MM, footerY, {
    align: "right",
  })
}

function noteContentBottom(doc: jsPDF): number {
  return doc.internal.pageSize.getHeight() - MARGIN_MM - FOOTER_RESERVE_MM
}

function ensureNoteSpace(
  doc: jsPDF,
  cursorY: number,
  neededH: number,
  studentName: string
): number {
  if (cursorY + neededH <= noteContentBottom(doc)) return cursorY
  doc.addPage()
  return drawNoteHeader(doc, studentName)
}

function drawAllFooters(doc: jsPDF, dateStr: string): void {
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i)
    drawNoteFooter(doc, i, dateStr)
  }
}

function currentDateStr(): string {
  return new Date().toLocaleDateString("es-MX")
}

function drawNotePage(
  doc: jsPDF,
  student: StudentType,
  ctx: ExportContext
): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const unitCriteria = ctx.unitCriteria ?? []

  let cursorY = drawNoteHeader(doc, student.displayName)

  const labelValueRow = (
    label: string,
    value: string,
    options?: { emphasize?: boolean; indentX?: number }
  ) => {
    const emphasize = options?.emphasize ?? false
    const indentX = options?.indentX ?? 0
    cursorY = ensureNoteSpace(doc, cursorY, NOTE_LINE_HEIGHT, student.displayName)
    doc.setFont("helvetica", emphasize ? "bold" : "normal")
    doc.setFontSize(NOTE_LABEL_SIZE)
    doc.setTextColor(...PRIMARY_COLOR)
    doc.text(label, MARGIN_MM + indentX, cursorY)

    doc.setFont("helvetica", emphasize ? "bold" : "normal")
    doc.setFontSize(NOTE_LABEL_SIZE)
    doc.setTextColor(...PRIMARY_COLOR)
    doc.text(value, pageWidth - MARGIN_MM, cursorY, { align: "right" })

    cursorY += NOTE_LINE_HEIGHT
  }

  const drawDividerLine = () => {
    // Compensa arrastre previo de labelValueRow (NOTE_LINE_HEIGHT):
    // sin esto arriba queda 6+4=10 vs 4 abajo.
    // Abajo usa +6 (vs +4 arriba) para compensar baseline de jsPDF:
    // el texto dibuja en baseline, el ascenso (~2.5mm en 10pt)
    // come aire visual bajo la línea; +6 equilibra blanco arriba/abajo.
    cursorY -= NOTE_LINE_HEIGHT
    cursorY = ensureNoteSpace(doc, cursorY, 10, student.displayName)
    cursorY += 4
    doc.setDrawColor(...MUTED_COLOR)
    doc.setLineWidth(0.2)
    doc.line(MARGIN_MM, cursorY, pageWidth - MARGIN_MM, cursorY)
    cursorY += 6
  }

  const evaluation = student.evaluation

  labelValueRow(
    TASKS_DELIVERED_LABEL,
    evaluation ? String(evaluation.tasksDelivered) : DASH,
    { emphasize: true }
  )

  for (let i = 0; i < ctx.assignments.length; i += 1) {
    cursorY = ensureNoteSpace(doc, cursorY, NOTE_LINE_HEIGHT, student.displayName)
    const value =
      evaluation && i < student.assignmentGrades.length
        ? formatScoreOrDash(student.assignmentGrades[i])
        : DASH
    const label = `Tarea ${i + 1}`
    const description = ctx.assignments[i]?.description.trim() ?? ""

    doc.setFont("helvetica", "normal")
    doc.setFontSize(NOTE_LABEL_SIZE)
    doc.setTextColor(...PRIMARY_COLOR)
    doc.text(label, MARGIN_MM, cursorY)

    if (description) {
      const labelWidth = doc.getTextWidth(`${label} `)
      const maxDescWidth =
        pageWidth - MARGIN_MM * 2 - labelWidth - 20
      if (maxDescWidth > 10) {
        doc.setFont("helvetica", "italic")
        doc.setTextColor(...DESCRIPTION_COLOR)
        const wrapped = `(${description})`
        const lines = doc.splitTextToSize(wrapped, maxDescWidth)
        let firstLine: string = Array.isArray(lines)
          ? (lines[0] ?? "")
          : String(lines)
        if (
          Array.isArray(lines) &&
          (lines.length > 1 || doc.getTextWidth(firstLine) > maxDescWidth)
        ) {
          const ellipsis = "…"
          let base = firstLine.endsWith(")")
            ? firstLine.slice(0, -1)
            : firstLine
          while (
            base.length > 1 &&
            doc.getTextWidth(`${base}${ellipsis})`) > maxDescWidth
          ) {
            base = base.slice(0, -1)
          }
          firstLine = `${base.trimEnd()}${ellipsis})`
        }
        doc.text(firstLine, MARGIN_MM + labelWidth, cursorY)
      }
    }

    doc.setFont("helvetica", "normal")
    doc.setFontSize(NOTE_LABEL_SIZE)
    doc.setTextColor(...PRIMARY_COLOR)
    doc.text(value, pageWidth - MARGIN_MM, cursorY, { align: "right" })

    cursorY += NOTE_LINE_HEIGHT
  }

  if (evaluation) {
    const base = evaluation.base ?? evaluation.final
    const baseWeighted = evaluation.baseWeighted ?? 0
    labelValueRow(TASKS_LABEL, formatScoreOrDash(evaluation.tasksAverage))
    labelValueRow(
      `${TASKS_WEIGHTED_LABEL} P. (${ctx.assignmentsPercentage}%)`,
      formatScoreOrDash(evaluation.tasks),
      { emphasize: true }
    )
    for (const criterion of ctx.otherCriteria) {
      labelValueRow(
        `Calificación ${criterion.label}`,
        formatScoreOrDash(evaluation.criteria[criterion.label])
      )
      labelValueRow(
        `Calificación ${criterion.label} P. (${criterion.value}%)`,
        formatScoreOrDash(evaluation.weightedCriteria[criterion.label]),
        { emphasize: true }
      )
    }
    labelValueRow(BASE_GRADE_LABEL, formatScoreOrDash(base))
    labelValueRow(
      `${BASE_WEIGHTED_LABEL} (${UNIT_BASE_WEIGHT}%)`,
      formatScoreOrDash(baseWeighted),
      { emphasize: true }
    )
    drawDividerLine()
    unitCriteria.forEach((unit, index) => {
      const unitResult = evaluation.units?.[unitGradeKey(index)]
      labelValueRow(toUnitTitleCase(unit.label), "", { emphasize: true })
      labelValueRow(EXAM_LABEL, formatScoreOrDash(unitResult?.exam))
      labelValueRow(
        `${EXAM_WEIGHTED_LABEL} (${UNIT_EXAM_WEIGHT}%)`,
        formatScoreOrDash(unitResult?.examWeighted),
        { emphasize: true }
      )
      labelValueRow(UNIT_FINAL_LABEL, formatScoreOrDash(unitResult?.final), {
        emphasize: true,
      })
      if (index < unitCriteria.length - 1) drawDividerLine()
    })
  } else {
    labelValueRow(TASKS_LABEL, DASH)
    labelValueRow(
      `${TASKS_WEIGHTED_LABEL} P. (${ctx.assignmentsPercentage}%)`,
      DASH,
      { emphasize: true }
    )
    for (const criterion of ctx.otherCriteria) {
      labelValueRow(`Calificación ${criterion.label}`, DASH)
      labelValueRow(
        `Calificación ${criterion.label} P. (${criterion.value}%)`,
        DASH,
        { emphasize: true }
      )
    }
    labelValueRow(BASE_GRADE_LABEL, DASH)
    labelValueRow(`${BASE_WEIGHTED_LABEL} (${UNIT_BASE_WEIGHT}%)`, DASH, {
      emphasize: true,
    })
    drawDividerLine()
    unitCriteria.forEach((unit, index) => {
      labelValueRow(toUnitTitleCase(unit.label), "", { emphasize: true })
      labelValueRow(EXAM_LABEL, DASH)
      labelValueRow(`${EXAM_WEIGHTED_LABEL} (${UNIT_EXAM_WEIGHT}%)`, DASH, {
        emphasize: true,
      })
      labelValueRow(UNIT_FINAL_LABEL, DASH, {
        emphasize: true,
      })
      if (index < unitCriteria.length - 1) drawDividerLine()
    })
  }
}

function drawSummaryPage(
  doc: jsPDF,
  students: StudentType[],
  ctx: ExportContext,
  dateStr: string
): void {
  const { head, body, foot, legend, groupHead } = buildSummaryTableData(
    students,
    ctx
  )

  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(...PRIMARY_COLOR)
  doc.text("Reporte grupal", MARGIN_MM, MARGIN_MM + 4)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...MUTED_COLOR)
  doc.text(
    `Generado el ${dateStr} · ${students.length} alumno(s)`,
    MARGIN_MM,
    MARGIN_MM + 10
  )

  const highlightColumnStyles: Record<
    number,
    { halign: "center"; fillColor: [number, number, number] }
  > = {
    2: { halign: "center", fillColor: SUMMARY_HIGHLIGHT_FILL },
  }
  ;(ctx.unitCriteria ?? []).forEach((_, index) => {
    highlightColumnStyles[5 + index * 3] = {
      halign: "center",
      fillColor: SUMMARY_HIGHLIGHT_FILL,
    }
  })
  const compactSummary = head.length > 12

  autoTable(doc, {
    startY: MARGIN_MM + 14,
    head: groupHead ? [groupHead, head] : [head],
    body,
    foot: [foot],
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: compactSummary ? 6.5 : 8,
      cellPadding: compactSummary ? 1.5 : 2,
      textColor: PRIMARY_COLOR,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: PRIMARY_COLOR,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      halign: "center",
      valign: "middle",
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: PRIMARY_COLOR,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { halign: "left", fontStyle: "bold" },
      ...highlightColumnStyles,
    },
    margin: {
      left: MARGIN_MM,
      right: MARGIN_MM,
      bottom: MARGIN_MM + FOOTER_RESERVE_MM,
    },
  })

  const finalY =
    (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable
      ?.finalY ?? MARGIN_MM + 30

  const pageHeight = doc.internal.pageSize.getHeight()
  const legendBottom = (): number =>
    pageHeight - MARGIN_MM - FOOTER_RESERVE_MM

  let legendY = finalY + 10
  const ensureLegendSpace = (neededH: number): void => {
    if (legendY + neededH <= legendBottom()) return
    doc.addPage()
    legendY = MARGIN_MM
  }

  ensureLegendSpace(5 + 4.5)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(...PRIMARY_COLOR)
  doc.text(LEGEND_TITLE, MARGIN_MM, legendY)

  legendY += 5
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...MUTED_COLOR)
  for (const entry of legend) {
    ensureLegendSpace(4.5)
    doc.text(`${entry.abbreviation} — ${entry.meaning}`, MARGIN_MM, legendY)
    legendY += 4.5
  }
}

export function exportStudentReport(
  student: StudentType,
  ctx: ExportContext
): Blob {
  const doc = new jsPDF({
    unit: "mm",
    format: PAGE_FORMAT,
    orientation: PAGE_ORIENTATION,
  })
  const dateStr = currentDateStr()
  drawNotePage(doc, student, ctx)
  drawAllFooters(doc, dateStr)
  return new Blob([doc.output("arraybuffer")], { type: "application/pdf" })
}

export function exportGroupReport(
  students: StudentType[],
  ctx: ExportContext
): Blob {
  const doc = new jsPDF({
    unit: "mm",
    format: PAGE_FORMAT,
    orientation: PAGE_ORIENTATION,
  })
  const dateStr = currentDateStr()
  const orderedStudents = sortStudentsByDisplayNameAsc(students)
  drawSummaryPage(doc, orderedStudents, ctx, dateStr)
  for (const student of orderedStudents) {
    doc.addPage()
    drawNotePage(doc, student, ctx)
  }
  drawAllFooters(doc, dateStr)
  return new Blob([doc.output("arraybuffer")], { type: "application/pdf" })
}

export function formatDateForFilename(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function sanitizeFilename(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "alumno"
}

export function buildGroupReportFilename(date: Date = new Date()): string {
  return `reporte-grupal-${formatDateForFilename(date)}.pdf`
}

export function buildStudentReportFilename(
  student: StudentType,
  date: Date = new Date()
): string {
  return `${sanitizeFilename(student.displayName)}-${formatDateForFilename(date)}.pdf`
}

export async function savePdf(
  blob: Blob,
  suggestedName: string
): Promise<SavePdfResult> {
  if (typeof window === "undefined" || !window.api) {
    return { saved: false }
  }
  return window.api.savePdf(blob, suggestedName)
}

export async function exportAndSaveGroupReport(
  students: StudentType[],
  ctx: ExportContext
): Promise<SavePdfResult> {
  const blob = exportGroupReport(students, ctx)
  return savePdf(blob, buildGroupReportFilename())
}

export async function exportAndSaveStudentReport(
  student: StudentType,
  ctx: ExportContext
): Promise<SavePdfResult> {
  const blob = exportStudentReport(student, ctx)
  return savePdf(blob, buildStudentReportFilename(student))
}
