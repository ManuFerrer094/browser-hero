'use client'

import { Note } from './GameEngine'

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private source: MediaElementAudioSourceNode | null = null

  async initializeAnalyzer(audioElement: HTMLAudioElement): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()
      this.analyser = this.audioContext.createAnalyser()
      this.source = this.audioContext.createMediaElementSource(audioElement)
      
      this.source.connect(this.analyser)
      this.analyser.connect(this.audioContext.destination)
      
      this.analyser.fftSize = 2048
      this.analyser.smoothingTimeConstant = 0.8
    } catch (error) {
      console.error('Failed to initialize audio analyzer:', error)
      throw error
    }
  }

  async generateNotesFromAudio(audioUrl: string, duration: number): Promise<Note[]> {
    return new Promise((resolve, reject) => {
      const audio = document.createElement('audio')
      audio.crossOrigin = 'anonymous'
      audio.src = audioUrl
      
      const notes: Note[] = []

      audio.addEventListener('loadeddata', async () => {
        try {
          await this.initializeAnalyzer(audio)
          
          if (!this.analyser) {
            throw new Error('Analyzer not initialized')
          }

          const bufferLength = this.analyser.frequencyBinCount
          const dataArray = new Uint8Array(bufferLength)
          
          // Analysis parameters
          const beatThreshold = 120 // Minimum volume for beat detection
          const minNoteInterval = 0.2 // Minimum time between notes in seconds
          
          let lastNoteTime = -minNoteInterval
          const beatHistory: number[] = []
          
          const analyzeAudio = () => {
            if (!this.analyser || audio.ended || audio.currentTime >= duration) {
              resolve(notes)
              return
            }

            this.analyser.getByteFrequencyData(dataArray)
            
            const currentTime = audio.currentTime
            
            // Calculate energy in different frequency bands
            const bassEnergy = this.getEnergyInRange(dataArray, 0, 4) // Low frequencies
            const midEnergy = this.getEnergyInRange(dataArray, 4, 16) // Mid frequencies
            const trebleEnergy = this.getEnergyInRange(dataArray, 16, 64) // High frequencies
            
            const totalEnergy = bassEnergy + midEnergy + trebleEnergy
            
            // Beat detection using energy variance
            beatHistory.push(totalEnergy)
            if (beatHistory.length > 10) {
              beatHistory.shift()
            }
            
            const avgEnergy = beatHistory.reduce((a, b) => a + b, 0) / beatHistory.length
            const energyVariance = beatHistory.reduce((sum, energy) => sum + Math.pow(energy - avgEnergy, 2), 0) / beatHistory.length
            
            // Generate note if we detect a beat and enough time has passed
            if (totalEnergy > beatThreshold && 
                totalEnergy > avgEnergy + Math.sqrt(energyVariance) * 1.5 &&
                currentTime - lastNoteTime >= minNoteInterval) {
              
              // Determine lane based on dominant frequency
              let dominantLane = 2 // Default to middle lane
              
              if (bassEnergy > midEnergy && bassEnergy > trebleEnergy) {
                dominantLane = 0 // Bass -> leftmost lane
              } else if (trebleEnergy > midEnergy && trebleEnergy > bassEnergy) {
                dominantLane = 4 // Treble -> rightmost lane
              } else if (midEnergy > bassEnergy && midEnergy > trebleEnergy) {
                dominantLane = Math.floor(Math.random() * 3) + 1 // Mid frequencies -> middle lanes
              }
              
              // Add some randomness but keep it musical
              if (Math.random() > 0.7) {
                dominantLane = Math.max(0, Math.min(4, dominantLane + (Math.random() > 0.5 ? 1 : -1)))
              }

              const note: Note = {
                id: `note-${currentTime}-${dominantLane}`,
                lane: dominantLane,
                startTime: currentTime + 2, // Give player 2 seconds to prepare
                duration: 0.1,
                hit: false
              }

              notes.push(note)
              lastNoteTime = currentTime
            }

            setTimeout(analyzeAudio, 1000 / 43) // ~43 FPS analysis
          }

          // Start analysis
          audio.play()
          analyzeAudio()

        } catch (error) {
          reject(error)
        }
      })

      audio.addEventListener('error', (error) => {
        reject(error)
      })

      // Load the audio
      audio.load()
    })
  }

  private getEnergyInRange(dataArray: Uint8Array, startBin: number, endBin: number): number {
    let energy = 0
    for (let i = startBin; i < Math.min(endBin, dataArray.length); i++) {
      energy += dataArray[i]
    }
    return energy / (endBin - startBin)
  }

  // Generate demo notes for when audio analysis isn't available
  generateDemoNotes(duration: number): Note[] {
    const notes: Note[] = []
    let noteInterval = 0.5 // Notes every 0.5 seconds
    const patterns = [
      [0, 2, 4], // Left, center, right
      [1, 3], // Mid lanes
      [0, 1, 2, 3, 4], // All lanes
      [2], // Center only
      [0, 4], // Outer lanes
    ]

    for (let time = 2; time < duration - 1; time += noteInterval) {
      const pattern = patterns[Math.floor(Math.random() * patterns.length)]
      const lane = pattern[Math.floor(Math.random() * pattern.length)]
      
      const note: Note = {
        id: `demo-note-${time}-${lane}`,
        lane,
        startTime: time,
        duration: 0.1,
        hit: false
      }

      notes.push(note)
      
      // Vary the interval slightly for more natural feel
      noteInterval += (Math.random() - 0.5) * 0.2
      if (noteInterval < 0.3) noteInterval = 0.3
      if (noteInterval > 0.8) noteInterval = 0.8
    }

    return notes
  }

  cleanup(): void {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.analyser = null
    this.source = null
  }
}

// YouTube URL utilities
export const extractYouTubeId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

export const getYouTubeEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0`
}

// Since we can't directly download YouTube audio in the browser,
// we'll create a proxy component that uses the YouTube embed API
export const createYouTubeAudioProxy = (videoId: string): Promise<string> => {
  return new Promise((resolve) => {
    // For demo purposes, we'll resolve with a demo audio URL
    // In a real implementation, you would use a backend service
    // to extract audio from YouTube videos
    console.log('Processing video ID:', videoId)
    
    setTimeout(() => {
      // Return a demo audio file path (you can add actual audio files to public folder)
      resolve('/demo-audio.mp3')
    }, 2000)
  })
}