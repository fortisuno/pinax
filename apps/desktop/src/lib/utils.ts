import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const LOWERCASE_WORDS = new Set([
  "el",
  "la",
  "los",
  "las",
  "un",
  "una",
  "a",
  "al",
  "con",
  "de",
  "del",
  "en",
  "para",
  "por",
  "sin",
  "sobre",
  "y",
  "e",
  "o",
  "u",
])

export function toTitleCase(input: string): string {
  const words = input.trim().split(/\s+/)
  if (words.length === 0) return ""

  return words
    .map((word, index) => {
      const lower = word.toLowerCase()
      if (
        index !== 0 &&
        index !== words.length - 1 &&
        LOWERCASE_WORDS.has(lower)
      ) {
        return lower
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(" ")
}