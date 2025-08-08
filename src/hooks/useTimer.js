import { useState, useEffect, useRef } from 'react'

export function useTimer(duration = 60) {
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)

  const start = () => {
    if (!isRunning) {
      setIsRunning(true)
    }
  }

  const pause = () => {
    setIsRunning(false)
  }

  const reset = () => {
    setIsRunning(false)
    setTimeElapsed(0)
  }

  const stop = () => {
    setIsRunning(false)
    setTimeElapsed(0)
  }

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1
          if (newTime >= duration) {
            setIsRunning(false)
            return duration
          }
          return newTime
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
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
