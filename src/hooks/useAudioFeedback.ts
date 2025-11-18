import { useEffect, useRef, useState } from 'react'

export function useAudioFeedback() {
  const successAudioRef = useRef<HTMLAudioElement | null>(null)
  const errorAudioRef = useRef<HTMLAudioElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Create and preload audio elements
    successAudioRef.current = new Audio(
      'https://vrbzndopcbnxpbrzuins.supabase.co/storage/v1/object/public/sound_effects/winfantasia-6912%20(1).mp3'
    )
    errorAudioRef.current = new Audio(
      'https://vrbzndopcbnxpbrzuins.supabase.co/storage/v1/object/public/sound_effects/wrong-47985%20(1).mp3'
    )

    // Set playback speed to 1.5x
    successAudioRef.current.playbackRate = 1.5
    errorAudioRef.current.playbackRate = 1.5

    successAudioRef.current.preload = 'auto'
    errorAudioRef.current.preload = 'auto'

    let loadedCount = 0
    const handleCanPlay = () => {
      loadedCount++
      if (loadedCount === 2) {
        setIsLoaded(true)
      }
    }
    
    successAudioRef.current.addEventListener('canplaythrough', handleCanPlay)
    errorAudioRef.current.addEventListener('canplaythrough', handleCanPlay)

    return () => {
      successAudioRef.current?.removeEventListener('canplaythrough', handleCanPlay)
      errorAudioRef.current?.removeEventListener('canplaythrough', handleCanPlay)
    }
  }, [])

  const playSuccess = () => {
    if (!successAudioRef.current) return

    try {
      successAudioRef.current.currentTime = 0
      successAudioRef.current.play().catch((error) => {
        console.warn('Success audio playback failed:', error)
      })
    } catch (error) {
      console.warn('Success audio error:', error)
    }
  }

  const playError = () => {
    if (!errorAudioRef.current) return

    try {
      errorAudioRef.current.currentTime = 0
      errorAudioRef.current.play().catch((error) => {
        console.warn('Error audio playback failed:', error)
      })
    } catch (error) {
      console.warn('Error audio error:', error)
    }
  }

  const stopAllAudio = () => {
    if (successAudioRef.current) {
      successAudioRef.current.pause()
      successAudioRef.current.currentTime = 0
    }
    if (errorAudioRef.current) {
      errorAudioRef.current.pause()
      errorAudioRef.current.currentTime = 0
    }
  }

  return { playSuccess, playError, stopAllAudio, isLoaded }
}
