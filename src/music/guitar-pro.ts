export interface ImportedScoreNote {
  string: number
  fret: number
  midi: number
  isDead: boolean
  isGhost: boolean
}

export interface ImportedScoreBeat {
  duration: number
  isRest: boolean
  notes: ImportedScoreNote[]
}

export interface ImportedScoreBar {
  timeSignature: [number, number]
  beats: ImportedScoreBeat[]
}

export interface ImportedScoreTrack {
  name: string
  tuning: number[]
  program: number
  isPercussion: boolean
  bars: ImportedScoreBar[]
}

export interface ImportedScore {
  title: string
  artist: string
  album: string
  tempo: number
  tracks: ImportedScoreTrack[]
}

export const loadGuitarProScore = async (url: string): Promise<ImportedScore> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Unable to load score: ${response.status}`)
  return parseGuitarProBytes(await response.arrayBuffer())
}

export const parseGuitarProBytes = async (data: ArrayBuffer): Promise<ImportedScore> => {
  const alphaTab = await import('@coderline/alphatab')
  const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(new Uint8Array(data))

  return {
    title: score.title,
    artist: score.artist,
    album: score.album,
    tempo: score.tempo,
    tracks: score.tracks.map((track) => ({
      name: track.name,
      tuning: [...(track.staves[0]?.tuning ?? [])],
      program: track.playbackInfo.program,
      isPercussion: track.isPercussion,
      bars: (track.staves[0]?.bars ?? []).map((bar, barIndex) => ({
        timeSignature: [
          score.masterBars[barIndex]?.timeSignatureNumerator ?? 4,
          score.masterBars[barIndex]?.timeSignatureDenominator ?? 4,
        ],
        beats: bar.voices.flatMap((voice) =>
          voice.beats.map((beat) => ({
            duration: beat.duration,
            isRest: beat.isRest,
            notes: beat.notes.map((note) => ({
              string: note.string,
              fret: note.fret,
              midi: note.realValue,
              isDead: note.isDead,
              isGhost: note.isGhost,
            })),
          })),
        ),
      })),
    })),
  }
}
