import { useState, useEffect, useRef } from 'react'

export function useTimer(duration = 60) {
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const startTimeRef = useRef(null)
  const pausedTimeRef = useRef(0)
  const rafRef = useRef(null)

  const start = () => {
    if (!isRunning) {
      startTimeRef.current = performance.now() - pausedTimeRef.current * 1000
      setIsRunning(true)
    }
  }

  const pause = () => {
    setIsRunning(false)
    pausedTimeRef.current = timeElapsed
  }

  const reset = () => {
    setIsRunning(false)
    setTimeElapsed(0)
    pausedTimeRef.current = 0
    startTimeRef.current = null
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
  }

  const stop = () => {
    reset()
  }

  // 高精度タイマー（requestAnimationFrame使用）
  useEffect(() => {
    const updateTimer = () => {
      if (isRunning && startTimeRef.current !== null) {
        const now = performance.now()
        const elapsed = Math.floor((now - startTimeRef.current) / 1000)
        
        if (elapsed >= duration) {
          setTimeElapsed(duration)
          setIsRunning(false)
        } else {
          setTimeElapsed(elapsed)
          rafRef.current = requestAnimationFrame(updateTimer)
        }
      }
    }

    if (isRunning) {
      rafRef.current = requestAnimationFrame(updateTimer)
    } else {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isRunning, duration])

  const timeRemaining = duration - timeElapsed
  const progress = (timeElapsed / duration) * 100

  return {
    timeElapsed,
    timeRemaining,
    progress,
    isRunning,
    isCompleted: timeElapsed >= duration,
    start,
    pause,
    reset,
    stop
  }
}
