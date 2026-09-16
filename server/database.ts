import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

export interface ScoreRecord {
  id: string
  fileName: string
  storedName: string
  title: string
  artist: string
  album: string
  tempo: number
  barCount: number
  trackIndex: number
  trackName: string
  tuning: number[]
  importedAt: string
}

const dataDirectory = join(process.cwd(), 'server-data')
mkdirSync(dataDirectory, { recursive: true })

const database = new Database(join(dataDirectory, 'scores.sqlite'))
database.pragma('journal_mode = WAL')
database.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id TEXT PRIMARY KEY,
    file_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT NOT NULL,
    tempo INTEGER NOT NULL,
    bar_count INTEGER NOT NULL,
    track_index INTEGER NOT NULL,
    track_name TEXT NOT NULL,
    tuning TEXT NOT NULL,
    imported_at TEXT NOT NULL
  )
`)

const toRecord = (row: Record<string, unknown>): ScoreRecord => ({
  id: String(row.id),
  fileName: String(row.file_name),
  storedName: String(row.stored_name),
  title: String(row.title),
  artist: String(row.artist),
  album: String(row.album),
  tempo: Number(row.tempo),
  barCount: Number(row.bar_count),
  trackIndex: Number(row.track_index),
  trackName: String(row.track_name),
  tuning: JSON.parse(String(row.tuning)) as number[],
  importedAt: String(row.imported_at),
})

export const scoreRepository = {
  list: (): ScoreRecord[] =>
    database
      .prepare('SELECT * FROM scores ORDER BY imported_at DESC')
      .all()
      .map((row) => toRecord(row as Record<string, unknown>)),

  get: (id: string): ScoreRecord | undefined => {
    const row = database.prepare('SELECT * FROM scores WHERE id = ?').get(id)
    return row ? toRecord(row as Record<string, unknown>) : undefined
  },

  insert: (score: ScoreRecord) => {
    database
      .prepare(`
        INSERT INTO scores (
          id, file_name, stored_name, title, artist, album, tempo,
          bar_count, track_index, track_name, tuning, imported_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        score.id,
        score.fileName,
        score.storedName,
        score.title,
        score.artist,
        score.album,
        score.tempo,
        score.barCount,
        score.trackIndex,
        score.trackName,
        JSON.stringify(score.tuning),
        score.importedAt,
      )
  },

  updateTrack: (id: string, trackIndex: number, trackName: string, tuning: number[], barCount: number) =>
    database
      .prepare(
        'UPDATE scores SET track_index = ?, track_name = ?, tuning = ?, bar_count = ? WHERE id = ?',
      )
      .run(trackIndex, trackName, JSON.stringify(tuning), barCount, id),

  remove: (id: string) => database.prepare('DELETE FROM scores WHERE id = ?').run(id),
}
