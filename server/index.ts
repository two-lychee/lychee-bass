import Fastify from 'fastify'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { createReadStream, existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { parseGuitarProBytes, type ImportedScore, type ImportedScoreTrack } from '../src/music/guitar-pro'
import { scoreRepository, type ScoreRecord } from './database'

const app = Fastify({ logger: true })
const port = Number(process.env.PORT ?? 3001)
const scoreDirectory = join(process.cwd(), 'server-data', 'scores')
const allowedExtensions = new Set(['.gp', '.gp3', '.gp4', '.gp5', '.gpx'])

const countTrackNotes = (track: ImportedScoreTrack) =>
  track.bars.reduce(
    (total, bar) => total + bar.beats.reduce((barTotal, beat) => barTotal + beat.notes.length, 0),
    0,
  )

const firstNoteBar = (track: ImportedScoreTrack) =>
  track.bars.findIndex((bar) => bar.beats.some((beat) => beat.notes.length > 0)) + 1

const isBassTrack = (track: ImportedScoreTrack) =>
  track.tuning.length === 4 ||
  (track.program >= 32 && track.program <= 39) ||
  /bass|harris/i.test(track.name)

const selectPracticeTrack = (score: ImportedScore) => {
  const playable = score.tracks
    .map((track, index) => ({ track, index, noteCount: countTrackNotes(track) }))
    .filter(({ track, noteCount }) => !track.isPercussion && noteCount > 0)
  if (!playable.length) return null

  const bassTracks = playable.filter(({ track }) => isBassTrack(track))
  const selected = [...(bassTracks.length ? bassTracks : playable)].sort(
    (left, right) => right.noteCount - left.noteCount,
  )[0]
  const startsAtBar = firstNoteBar(selected.track)
  const warnings: string[] = []
  if (!bassTracks.length) {
    warnings.push(
      `未找到 Bass 轨，已选择音符最完整的轨道“${selected.track.name || `Track ${selected.index + 1}`}”并映射到 Bass 指板。`,
    )
  }
  if (startsAtBar > 1) warnings.push(`所选轨道前 ${startsAtBar - 1} 小节为空，首个音符在第 ${startsAtBar} 小节。`)
  return { ...selected, startsAtBar, warning: warnings.join(' ') }
}

const describeTrack = (track: ImportedScoreTrack, index: number) => ({
  index,
  name: track.name || `Track ${index + 1}`,
  program: track.program,
  tuning: track.tuning,
  isBass: isBassTrack(track),
  isPercussion: track.isPercussion,
  noteCount: countTrackNotes(track),
  firstNoteBar: firstNoteBar(track),
  barCount: track.bars.length,
})

const selectionWarning = (track: ImportedScoreTrack, startsAtBar: number) => {
  const warnings: string[] = []
  if (!isBassTrack(track)) warnings.push(`当前选择“${track.name || '未命名轨道'}”，将映射到 Bass 指板。`)
  if (startsAtBar > 1) warnings.push(`该轨道前 ${startsAtBar - 1} 小节为空，首个音符在第 ${startsAtBar} 小节。`)
  return warnings.join(' ')
}

const readStoredScore = async (record: ScoreRecord) => {
  const file = await import('node:fs/promises').then((fs) =>
    fs.readFile(join(scoreDirectory, record.storedName)),
  )
  return parseGuitarProBytes(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength))
}

mkdirSync(scoreDirectory, { recursive: true })

await app.register(multipart, {
  limits: { files: 1, fileSize: 20 * 1024 * 1024 },
})

app.get('/api/health', async () => ({ status: 'ok' }))

app.get('/api/scores', async () => scoreRepository.list())

app.get<{ Params: { id: string } }>('/api/scores/:id', async (request, reply) => {
  const score = scoreRepository.get(request.params.id)
  if (!score) return reply.code(404).send({ message: 'Score not found' })
  return score
})

app.get<{ Params: { id: string } }>('/api/scores/:id/tracks', async (request, reply) => {
  const record = scoreRepository.get(request.params.id)
  if (!record) return reply.code(404).send({ message: 'Score not found' })
  const score = await readStoredScore(record)
  return {
    selectedTrackIndex: record.trackIndex,
    tracks: score.tracks.map(describeTrack),
  }
})

app.patch<{ Params: { id: string }; Body: { trackIndex?: number } }>(
  '/api/scores/:id/track',
  async (request, reply) => {
    const record = scoreRepository.get(request.params.id)
    if (!record) return reply.code(404).send({ message: 'Score not found' })
    const trackIndex = request.body?.trackIndex
    if (!Number.isInteger(trackIndex) || trackIndex === undefined || trackIndex < 0) {
      return reply.code(400).send({ message: '请选择有效轨道' })
    }
    const score = await readStoredScore(record)
    const track = score.tracks[trackIndex]
    const noteCount = track ? countTrackNotes(track) : 0
    if (!track || track.isPercussion || noteCount === 0) {
      return reply.code(422).send({ message: '该轨道没有可用于 Tab 练习的弦位音符' })
    }
    scoreRepository.updateTrack(
      record.id,
      trackIndex,
      track.name || `Track ${trackIndex + 1}`,
      track.tuning,
      track.bars.length,
    )
    const startsAtBar = firstNoteBar(track)
    return {
      trackIndex,
      trackName: track.name || `Track ${trackIndex + 1}`,
      noteCount,
      firstNoteBar: startsAtBar,
      warning: selectionWarning(track, startsAtBar),
    }
  },
)

app.get<{ Params: { id: string } }>('/api/scores/:id/practice', async (request, reply) => {
  const record = scoreRepository.get(request.params.id)
  if (!record) return reply.code(404).send({ message: 'Score not found' })

  const score = await readStoredScore(record)
  const savedTrack = score.tracks[record.trackIndex]
  const savedNoteCount = savedTrack ? countTrackNotes(savedTrack) : 0
  const fallback = !savedTrack || savedTrack.isPercussion || savedNoteCount === 0
    ? selectPracticeTrack(score)
    : null
  const track = fallback?.track ?? savedTrack
  const trackIndex = fallback?.index ?? record.trackIndex
  const noteCount = fallback?.noteCount ?? savedNoteCount
  if (!track) return reply.code(422).send({ message: '该曲谱没有可用于 Tab 练习的弦位音符' })
  const startsAtBar = fallback?.startsAtBar ?? firstNoteBar(track)
  if (trackIndex !== record.trackIndex) {
    scoreRepository.updateTrack(record.id, trackIndex, track.name || `Track ${trackIndex + 1}`, track.tuning, track.bars.length)
  }
  return {
    id: record.id,
    title: score.title,
    artist: score.artist,
    album: score.album,
    tempo: score.tempo,
    track,
    trackIndex,
    noteCount,
    firstNoteBar: startsAtBar,
    warning: fallback?.warning || selectionWarning(track, startsAtBar),
  }
})

app.get<{ Params: { id: string } }>('/api/scores/:id/file', async (request, reply) => {
  const score = scoreRepository.get(request.params.id)
  if (!score) return reply.code(404).send({ message: 'Score not found' })
  reply.header('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(score.fileName)}`)
  reply.type('application/octet-stream')
  return reply.send(createReadStream(join(scoreDirectory, score.storedName)))
})

app.post('/api/scores', async (request, reply) => {
  const upload = await request.file()
  if (!upload) return reply.code(400).send({ message: 'A Guitar Pro file is required' })

  const extension = extname(upload.filename).toLowerCase()
  if (!allowedExtensions.has(extension)) {
    return reply.code(415).send({ message: 'Supported formats: GP, GP3, GP4, GP5 and GPX' })
  }

  const buffer = await upload.toBuffer()
  let parsed
  try {
    parsed = await parseGuitarProBytes(
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
    )
  } catch {
    return reply.code(422).send({ message: 'The uploaded file is not a readable Guitar Pro score' })
  }

  const selection = selectPracticeTrack(parsed)
  if (!selection) {
    return reply.code(422).send({ message: '曲谱可以读取，但没有找到可用于 Tab 练习的弦位音符' })
  }
  const selectedTrackIndex = selection.index
  const track = selection.track

  const id = randomUUID()
  const storedName = `${id}${extension}`
  writeFileSync(join(scoreDirectory, storedName), buffer)
  const record: ScoreRecord = {
    id,
    fileName: upload.filename,
    storedName,
    title: parsed.title || upload.filename.replace(/\.[^.]+$/, ''),
    artist: parsed.artist || 'Unknown artist',
    album: parsed.album || '',
    tempo: parsed.tempo || 120,
    barCount: track.bars.length,
    trackIndex: selectedTrackIndex,
    trackName: track.name || (track.tuning.length === 4 ? 'Bass' : 'Track 1'),
    tuning: track.tuning,
    importedAt: new Date().toISOString(),
  }
  scoreRepository.insert(record)
  return reply.code(201).send({
    ...record,
    noteCount: selection.noteCount,
    firstNoteBar: selection.startsAtBar,
    warning: selection.warning,
  })
})

app.delete<{ Params: { id: string } }>('/api/scores/:id', async (request, reply) => {
  const score = scoreRepository.get(request.params.id)
  if (!score) return reply.code(404).send({ message: 'Score not found' })
  const filePath = join(scoreDirectory, score.storedName)
  if (existsSync(filePath)) unlinkSync(filePath)
  scoreRepository.remove(score.id)
  return reply.code(204).send()
})

const distributionDirectory = join(process.cwd(), 'dist')
if (existsSync(distributionDirectory)) {
  await app.register(fastifyStatic, { root: distributionDirectory })
  app.setNotFoundHandler((request, reply) => {
    if (request.raw.url?.startsWith('/api/')) return reply.code(404).send({ message: 'Not found' })
    return reply.sendFile('index.html')
  })
}

await app.listen({ port, host: '0.0.0.0' })
