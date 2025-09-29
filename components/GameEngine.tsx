'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

export interface Note {
  id: string
  lane: number // 0-4 for lanes A, S, D, F, G
  startTime: number
  duration: number
  hit: boolean
}

interface GameEngineProps {
  audioUrl: string
  notes: Note[]
  onGameEnd: (score: number) => void
}

const LANES = ['A', 'S', 'D', 'F', 'G']
const LANE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const NOTE_SPEED = 200 // pixels per second
const HIT_ZONE_Y = CANVAS_HEIGHT - 100
const LANE_WIDTH = CANVAS_WIDTH / 5

export const GameEngine: React.FC<GameEngineProps> = ({
  audioUrl,
  notes,
  onGameEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw lanes
    for (let i = 0; i < 5; i++) {
      const x = i * LANE_WIDTH
      
      // Lane background
      ctx.fillStyle = pressedKeys.has(LANES[i]) ? LANE_COLORS[i] + '40' : '#1a1a1a'
      ctx.fillRect(x, 0, LANE_WIDTH, CANVAS_HEIGHT)
      
      // Lane borders
      ctx.strokeStyle = '#444444'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, CANVAS_HEIGHT)
      ctx.stroke()

      // Lane labels
      ctx.fillStyle = pressedKeys.has(LANES[i]) ? '#ffffff' : LANE_COLORS[i]
      ctx.font = 'bold 24px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(LANES[i], x + LANE_WIDTH / 2, HIT_ZONE_Y + 40)
    }

    // Draw hit zone
    ctx.fillStyle = '#ffffff20'
    ctx.fillRect(0, HIT_ZONE_Y - 20, CANVAS_WIDTH, 40)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.strokeRect(0, HIT_ZONE_Y - 20, CANVAS_WIDTH, 40)

    // Draw notes
    notes.forEach(note => {
      if (note.hit) return

      const noteY = HIT_ZONE_Y - (note.startTime - currentTime) * NOTE_SPEED
      
      // Only draw notes that are visible
      if (noteY > -50 && noteY < CANVAS_HEIGHT + 50) {
        const x = note.lane * LANE_WIDTH + 10
        const width = LANE_WIDTH - 20
        const height = Math.max(30, note.duration * NOTE_SPEED)

        // Note shadow
        ctx.fillStyle = '#00000080'
        ctx.fillRect(x + 2, noteY + 2, width, height)

        // Note body
        ctx.fillStyle = LANE_COLORS[note.lane]
        ctx.fillRect(x, noteY, width, height)

        // Note highlight
        ctx.fillStyle = '#ffffff40'
        ctx.fillRect(x, noteY, width, height / 3)

        // Note border
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.strokeRect(x, noteY, width, height)
      }
    })

    // Draw UI
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`Score: ${score}`, 20, 40)
    ctx.fillText(`Combo: ${combo}`, 20, 80)

  }, [currentTime, score, combo, pressedKeys, notes])

  const checkHits = useCallback(() => {
    const hitWindow = 0.1 // 100ms hit window

    notes.forEach(note => {
      if (note.hit) return

      const timeDiff = Math.abs(currentTime - note.startTime)
      
      if (timeDiff <= hitWindow && pressedKeys.has(LANES[note.lane])) {
        note.hit = true
        const points = Math.max(50, 100 - Math.floor(timeDiff * 500))
        setScore(prev => prev + points * (combo + 1))
        setCombo(prev => prev + 1)
      } else if (currentTime > note.startTime + hitWindow) {
        note.hit = true // Miss
        setCombo(0)
      }
    })
  }, [currentTime, pressedKeys, notes, combo])

  const gameLoop = useCallback(() => {
    if (!audioRef.current || !isPlaying) return

    setCurrentTime(audioRef.current.currentTime)
    checkHits()
    drawGame()

    animationRef.current = requestAnimationFrame(gameLoop)
  }, [isPlaying, checkHits, drawGame])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toUpperCase()
    if (LANES.includes(key)) {
      setPressedKeys(prev => new Set(prev).add(key))
    }
  }, [])

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toUpperCase()
    if (LANES.includes(key)) {
      setPressedKeys(prev => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
    }
  }, [])

  const startGame = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  useEffect(() => {
    if (isPlaying) {
      gameLoop()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, gameLoop])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      const handleEnded = () => {
        setIsPlaying(false)
        onGameEnd(score)
      }
      
      audio.addEventListener('ended', handleEnded)
      return () => audio.removeEventListener('ended', handleEnded)
    }
  }, [score, onGameEnd])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="mb-4">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-purple-500 rounded-lg"
        />
      </div>

      <audio ref={audioRef} src={audioUrl} />

      {!isPlaying && (
        <motion.button
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold text-lg rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ¡Empezar Canción!
        </motion.button>
      )}
    </div>
  )
}