export type WorkRecord = {
  id: string
  taskName: string
  startedAt: string
  endedAt: string
  elapsedMs: number
}

export const STORAGE_KEY = 'my-work-timer.records.v1'
const BACKUP_FORMAT = 'my-work-timer.records'

function isRecord(value: unknown): value is WorkRecord {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Partial<WorkRecord>
  return typeof record.id === 'string' && typeof record.taskName === 'string'
    && typeof record.startedAt === 'string' && Number.isFinite(Date.parse(record.startedAt))
    && typeof record.endedAt === 'string' && Number.isFinite(Date.parse(record.endedAt))
    && typeof record.elapsedMs === 'number' && Number.isFinite(record.elapsedMs) && record.elapsedMs >= 0
}

function validateRecords(value: unknown): WorkRecord[] {
  if (!Array.isArray(value) || !value.every(isRecord)) throw new Error('Invalid saved records')
  return value
}

export function readRecords(): WorkRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw === null ? [] : validateRecords(JSON.parse(raw))
}

export function makeBackup(records: WorkRecord[]): string {
  return JSON.stringify({ format: BACKUP_FORMAT, version: 1, records })
}

export function parseBackup(text: string): WorkRecord[] {
  const backup: unknown = JSON.parse(text)
  if (typeof backup !== 'object' || backup === null || !('format' in backup)
    || backup.format !== BACKUP_FORMAT || !('version' in backup) || backup.version !== 1
    || !('records' in backup)) throw new Error('Invalid backup')
  return validateRecords(backup.records).map(({ id, taskName, startedAt, endedAt, elapsedMs }) => (
    { id, taskName, startedAt, endedAt, elapsedMs }
  ))
}

export function mergeRecords(existing: WorkRecord[], imported: WorkRecord[]): WorkRecord[] {
  const ids = new Set(existing.map(record => record.id))
  const added = imported.filter(record => {
    if (ids.has(record.id)) return false
    ids.add(record.id)
    return true
  })
  return [...existing, ...added].sort((a, b) => Date.parse(b.endedAt) - Date.parse(a.endedAt))
}
