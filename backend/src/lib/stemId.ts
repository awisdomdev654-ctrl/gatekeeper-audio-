import { randomBytes } from 'node:crypto'

export function createStemId(): string {
  return `STEM-${randomBytes(3).toString('hex').toUpperCase()}`
}

export function sanitizeFilename(name: string): string {
  const base = name.replace(/[/\\]/g, '_').trim() || 'stem.wav'
  return base.slice(0, 200)
}
