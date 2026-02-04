import fs from 'fs/promises'
import path from 'path'

function getWritableDir() {
  if (process.env.VERCEL) {
    return '/tmp'
  }
  return path.join(process.cwd(), 'config')
}

export function getReportCachePath() {
  return path.join(getWritableDir(), 'freee-reports.json')
}

export function getTokenCachePath() {
  return path.join(getWritableDir(), 'freee-token.json')
}

export async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content) as T
  } catch (error) {
    return null
  }
}

export async function writeJson(filePath: string, data: unknown): Promise<void> {
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}
