'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GameEngine, Note } from '@/components/GameEngine'
import { AudioAnalyzer, extractYouTubeId } from '@/components/AudioAnalyzer'

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [gameState, setGameState] = useState<'menu' | 'loading' | 'playing' | 'ended'>('menu')
  const [audioUrl, setAudioUrl] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [finalScore, setFinalScore] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    
    // If no URL provided, go directly to demo mode
    if (!youtubeUrl.trim()) {
      setGameState('loading')
      // Generate demo notes
      const analyzer = new AudioAnalyzer()
      const demoNotes = analyzer.generateDemoNotes(120) // 2 minute demo
      setNotes(demoNotes)
      setAudioUrl('') // No audio for pure demo
      setTimeout(() => setGameState('playing'), 1000)
      return
    }

    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      setErrorMessage('Por favor, ingresa una URL válida de YouTube')
      return
    }

    setGameState('loading')

    try {
      const videoId = extractYouTubeId(youtubeUrl)
      if (!videoId) {
        throw new Error('No se pudo extraer el ID del video de YouTube')
      }

      // For demo purposes, we'll use a demo approach
      // In production, this would connect to a backend service
      const analyzer = new AudioAnalyzer()
      
      // Generate demo notes for now (since we can't access YouTube audio directly)
      const demoNotes = analyzer.generateDemoNotes(180) // 3 minute song
      setNotes(demoNotes)
      
      // Create a demo audio URL (in production, this would be the extracted audio)
      setAudioUrl('/demo-audio.mp3') // You would need to add a demo audio file
      
      // For now, let's proceed without actual audio
      setTimeout(() => setGameState('playing'), 2000)

    } catch (error) {
      console.error('Error processing YouTube URL:', error)
      setErrorMessage('Error al procesar el video. Intentando con modo demo...')
      
      // Fallback to demo mode
      const analyzer = new AudioAnalyzer()
      const demoNotes = analyzer.generateDemoNotes(120) // 2 minute demo
      setNotes(demoNotes)
      setAudioUrl('') // No audio for pure demo
      setTimeout(() => setGameState('playing'), 1000)
    }
  }

  const handleGameEnd = (score: number) => {
    setFinalScore(score)
    setGameState('ended')
  }

  const restartGame = () => {
    setGameState('menu')
    setYoutubeUrl('')
    setAudioUrl('')
    setNotes([])
    setFinalScore(0)
    setErrorMessage('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-black">
      {gameState === 'menu' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl"
          >
            <motion.h1
              className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              BROWSER HERO
            </motion.h1>
            
            <motion.p
              className="text-xl md:text-2xl text-gray-300 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Convierte cualquier canción de YouTube en un juego estilo Guitar Hero
            </motion.p>

            {errorMessage && (
              <motion.div
                className="bg-red-600 text-white p-4 rounded-lg mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errorMessage}
              </motion.div>
            )}

            <motion.form
              onSubmit={handleUrlSubmit}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex flex-col space-y-4">
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="Pega aquí la URL de YouTube... (o deja vacío para modo demo)"
                  className="w-full px-6 py-4 text-lg bg-gray-800 border-2 border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                />
                <motion.button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {youtubeUrl ? '¡EMPEZAR A JUGAR!' : '¡MODO DEMO!'}
                </motion.button>
              </div>
            </motion.form>

            <motion.div
              className="mt-12 text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className="mb-4">Controles del juego:</p>
              <div className="flex justify-center space-x-4 mb-4">
                <span className="px-3 py-1 bg-red-600 rounded font-bold">A</span>
                <span className="px-3 py-1 bg-orange-600 rounded font-bold">S</span>
                <span className="px-3 py-1 bg-yellow-600 rounded font-bold">D</span>
                <span className="px-3 py-1 bg-green-600 rounded font-bold">F</span>
                <span className="px-3 py-1 bg-blue-600 rounded font-bold">G</span>
              </div>
              <p className="text-sm">Presiona las teclas cuando las notas lleguen a la zona de impacto</p>
            </motion.div>
          </motion.div>
        </div>
      )}

      {gameState === 'loading' && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mb-8"></div>
            <h2 className="text-3xl font-bold mb-4">Procesando audio...</h2>
            <p className="text-gray-400">Generando notas automáticamente desde el audio</p>
          </motion.div>
        </div>
      )}

      {gameState === 'playing' && (
        <GameEngine
          audioUrl={audioUrl}
          notes={notes}
          onGameEnd={handleGameEnd}
        />
      )}

      {gameState === 'ended' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-gray-900 p-8 rounded-lg border-2 border-purple-500"
          >
            <h2 className="text-5xl font-bold mb-4 text-yellow-400">¡JUEGO TERMINADO!</h2>
            <p className="text-3xl mb-8">Puntuación Final: <span className="text-green-400 font-bold">{finalScore.toLocaleString()}</span></p>
            
            <div className="space-y-4">
              <motion.button
                onClick={restartGame}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold text-lg rounded-lg mr-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Jugar de Nuevo
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
