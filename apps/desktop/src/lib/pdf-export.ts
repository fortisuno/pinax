import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import {
  formatScore,
  getInitials,
  type StudentEvaluation,
  type StudentType,
} from "@/lib/students"
import type { Assignment, CriteriaType } from "@/lib/evaluation"

const PAGE_FORMAT = "letter" as const
const PAGE_ORIENTATION = "portrait" as const
const MARGIN_MM = 15

const DASH = "—"
const PASS_THRESHOLD = 6
const TASKS_DELIVERED_LABEL = "Tareas Entregadas"
const TASKS_LABEL = "Tareas"
const TASKS_WEIGHTED_LABEL = "Calificación Tareas"
const FINAL_GRADE_LABEL = "Calificación final"
const STATUS_LABEL = "Estado"
const PASS_TEXT = "Aprobado"
const FAIL_TEXT = "Reprobado"
const NOT_EVALUATED_TEXT = "Sin calificar"
const FOOTER_TEXT = "Pinax"
const LEGEND_TITLE = "Abreviaturas"

const PRIMARY_COLOR: [number, number, number] = [33, 37, 41]
const ACCENT_COLOR: [number, number, number] = [59, 130, 246]
const MUTED_COLOR: [number, number, number] = [107, 114, 128]
const DESCRIPTION_COLOR: [number, number, number] = [156, 163, 175]

const NOTE_LINE_HEIGHT = 6
const NOTE_HEADING_SIZE = 14
const NOTE_LABEL_SIZE = 10
const NOTE_FOOTER_SIZE = 8
const FOOTER_RESERVE_MM = 12

export interface ExportContext {
  otherCriteria: CriteriaType[]
  assignments: Assignment[]
  assignmentsPercentage: number
}

export interface SavePdfResult {
  saved: boolean
  path?: string
}

export function buildSummaryTableData(
  students: StudentType[],
  ctx: ExportContext
) {
  const head: string[] = ["Nombre", "TE", "T", "TP"]
  for (const criterion of ctx.otherCriteria) {
    head.push(getInitials(criterion.label))
    head.push(`${getInitials(criterion.label)} P`)
  }
  head.push("CF", "Estado")

  const body = students.map((student) => {
    const evaluation = student.evaluation
    const row: string[] = [student.name]
    if (evaluation) {
      row.push(
        String(evaluation.tasksDelivered),
        formatScore(evaluation.tasksAverage),
        formatScore(evaluation.tasks)
      )
    } else {
      row.push(DASH, DASH, DASH)
    }
    for (const criterion of ctx.otherCriteria) {
      if (evaluation) {
        row.push(
          formatScore(evaluation.criteria[criterion.label] ?? 0),
          formatScore(evaluation.weightedCriteria[criterion.label] ?? 0)
        )
      } else {
        row.push(DASH, DASH)
      }
    }
    if (evaluation) {
      row.push(formatScore(evaluation.final))
      row.push(evaluation.final >= PASS_THRESHOLD ? PASS_TEXT : FAIL_TEXT)
    } else {
      row.push(DASH, DASH)
    }
    return row
  })

  const legend: { abbreviation: string; meaning: string }[] = [
    { abbreviation: "TE", meaning: TASKS_DELIVERED_LABEL },
    { abbreviation: "T", meaning: TASKS_LABEL },
    { abbreviation: "TP", meaning: TASKS_WEIGHTED_LABEL },
    { abbreviation: "CF", meaning: FINAL_GRADE_LABEL },
  ]
  for (const criterion of ctx.otherCriteria) {
    legend.push({
      abbreviation: getInitials(criterion.label),
      meaning: criterion.label,
    })
    legend.push({
      abbreviation: `${getInitials(criterion.label)} P`,
      meaning: `${criterion.label} Ponderado`,
    })
  }

  return { head, body, legend }
}

function formatScoreOrDash(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) {
    return DASH
  }
  return formatScore(value)
}

function statusLabelFor(evaluation: StudentEvaluation | null): string {
  if (!evaluation) return NOT_EVALUATED_TEXT
  return evaluation.final >= PASS_THRESHOLD ? PASS_TEXT : FAIL_TEXT
}

function drawNoteHeader(doc: jsPDF, studentName: string): number {
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFont("helvetica", "bold")
  doc.setFontSize(NOTE_HEADING_SIZE)
  doc.setTextColor(...PRIMARY_COLOR)
  doc.text(studentName, MARGIN_MM, MARGIN_MM + 4)

  doc.setDrawColor(...ACCENT_COLOR)
  doc.setLineWidth(0.4)
  const headingBottom = MARGIN_MM + 8
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

  let cursorY = drawNoteHeader(doc, student.name)

  const labelValueRow = (label: string, value: string, emphasize = false) => {
    cursorY = ensureNoteSpace(doc, cursorY, NOTE_LINE_HEIGHT, student.name)
    doc.setFont("helvetica", emphasize ? "bold" : "normal")
    doc.setFontSize(NOTE_LABEL_SIZE)
    doc.setTextColor(...PRIMARY_COLOR)
    doc.text(label, MARGIN_MM, cursorY)

    doc.setFont("helvetica", emphasize ? "bold" : "normal")
    doc.setFontSize(NOTE_LABEL_SIZE)
    doc.setTextColor(...PRIMARY_COLOR)
    doc.text(value, pageWidth - MARGIN_MM, cursorY, { align: "right" })

    cursorY += NOTE_LINE_HEIGHT
  }

  const labelValueRowAtomic = (rows: { label: string; value: string }[]) => {
    cursorY = ensureNoteSpace(
      doc,
      cursorY,
      rows.length * NOTE_LINE_HEIGHT,
      student.name
    )
    for (const row of rows) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(NOTE_LABEL_SIZE)
      doc.setTextColor(...PRIMARY_COLOR)
      doc.text(row.label, MARGIN_MM, cursorY)
      doc.text(row.value, pageWidth - MARGIN_MM, cursorY, { align: "right" })
      cursorY += NOTE_LINE_HEIGHT
    }
  }

  const evaluation = student.evaluation

  for (let i = 0; i < ctx.assignments.length; i += 1) {
    cursorY = ensureNoteSpace(doc, cursorY, NOTE_LINE_HEIGHT, student.name)
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
        const lines = doc.splitTextToSize(description, maxDescWidth)
        let firstLine: string = Array.isArray(lines)
          ? (lines[0] ?? "")
          : String(lines)
        if (
          Array.isArray(lines) &&
          (lines.length > 1 || doc.getTextWidth(firstLine) > maxDescWidth)
        ) {
          const ellipsis = "…"
          while (
            firstLine.length > 0 &&
            doc.getTextWidth(firstLine + ellipsis) > maxDescWidth
          ) {
            firstLine = firstLine.slice(0, -1)
          }
          firstLine = `${firstLine.trimEnd()}${ellipsis}`
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

  cursorY += 2

  if (evaluation) {
    labelValueRow(TASKS_DELIVERED_LABEL, String(evaluation.tasksDelivered))
    labelValueRow(TASKS_LABEL, formatScoreOrDash(evaluation.tasksAverage))
    labelValueRow(
      `${TASKS_WEIGHTED_LABEL} (${ctx.assignmentsPercentage}%)`,
      formatScoreOrDash(evaluation.tasks)
    )
    for (const criterion of ctx.otherCriteria) {
      labelValueRow(
        `Calificación ${criterion.label}`,
        formatScoreOrDash(evaluation.criteria[criterion.label])
      )
      labelValueRow(
        `Calificación ${criterion.label} Ponderado (${criterion.value}%)`,
        formatScoreOrDash(evaluation.weightedCriteria[criterion.label])
      )
    }
    labelValueRowAtomic([
      { label: FINAL_GRADE_LABEL, value: formatScoreOrDash(evaluation.final) },
      { label: STATUS_LABEL, value: statusLabelFor(evaluation) },
    ])
  } else {
    labelValueRow(TASKS_DELIVERED_LABEL, DASH)
    labelValueRow(TASKS_LABEL, DASH)
    labelValueRow(
      `${TASKS_WEIGHTED_LABEL} (${ctx.assignmentsPercentage}%)`,
      DASH
    )
    for (const criterion of ctx.otherCriteria) {
      labelValueRow(`Calificación ${criterion.label}`, DASH)
      labelValueRow(
        `Calificación ${criterion.label} Ponderado (${criterion.value}%)`,
        DASH
      )
    }
    labelValueRowAtomic([
      { label: FINAL_GRADE_LABEL, value: DASH },
      { label: STATUS_LABEL, value: statusLabelFor(evaluation) },
    ])
  }
}

function drawSummaryPage(
  doc: jsPDF,
  students: StudentType[],
  ctx: ExportContext,
  dateStr: string
): void {
  const { head, body, legend } = buildSummaryTableData(students, ctx)

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

  autoTable(doc, {
    startY: MARGIN_MM + 14,
    head: [head],
    body,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
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
    columnStyles: {
      0: { halign: "left", fontStyle: "bold" },
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
  drawSummaryPage(doc, students, ctx, dateStr)
  for (const student of students) {
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
  return `${sanitizeFilename(student.name)}-${formatDateForFilename(date)}.pdf`
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
