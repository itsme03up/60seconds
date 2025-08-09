import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { useTimer } from '../hooks/useTimer'
import MarkdownSlide from './MarkdownSlide'
import LinkPreview from './LinkPreview'

export default function SlideShow({ prepData, onBackToEdit }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const { timeElapsed, timeRemaining, progress, isCompleted, setSec } = useTimer(60, isPlaying)

  // スライドデータの準備
  const slides = [
    { type: 'slide', title: 'Point（要点・結論）', content: prepData.point },
    { type: 'slide', title: 'Reason（理由・根拠）', content: prepData.reason },
    { 
      type: 'slide', 
      title: 'Example（具体例・事例）', 
      content: prepData.example,
      layout: 'bottom',
      referenceLink: prepData.referenceLink
    },
    { type: 'slide', title: 'Summary（まとめ）', content: prepData.summary },
  ]

  // 自動スライド送り
  useEffect(() => {
    if (isPlaying && timeElapsed > 0) {
      const slideInterval = 60 / slides.length // 各スライドの表示時間
      const targetSlide = Math.floor(timeElapsed / slideInterval)
      
      if (targetSlide !== currentSlide && targetSlide < slides.length) {
        setCurrentSlide(targetSlide)
      }
    }
  }, [timeElapsed, isPlaying, slides.length, currentSlide])

  // スライドショー完了時の処理
  useEffect(() => {
    if (isCompleted) {
      setTimeout(() => {
        alert('スライドショーが完了しました！')
      }, 500)
    }
  }, [isCompleted])

  // キーボードショートカット（スペース：一時停止/再開、←/→：前後スライド、R：リセット）
  useEffect(() => {
    const handleKeyPress = (event) => {
      // フォーカスが入力要素にある場合は無視
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return
      }

      switch (event.key) {
        case ' ':
          event.preventDefault()
          setIsPlaying(prev => !prev)
          break
        case 'ArrowLeft':
          event.preventDefault()
          setCurrentSlide(prev => Math.max(0, prev - 1))
          break
        case 'ArrowRight':
          event.preventDefault()
          setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))
          break
        case 'r':
        case 'R':
          event.preventDefault()
          setSec(0)
          setCurrentSlide(0)
          setIsPlaying(true)
          break
        case 'Escape':
          event.preventDefault()
          onBackToEdit()
          break
        case 'Home':
          event.preventDefault()
          setCurrentSlide(0)
          break
        case 'End':
          event.preventDefault()
          setCurrentSlide(slides.length - 1)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onBackToEdit, slides.length, setSec])

  const handlePrevSlide = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1))
  }

  const handleNextSlide = () => {
    setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))
  }

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev)
  }

  const handleReset = () => {
    setSec(0)
    setCurrentSlide(0)
    setIsPlaying(true)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* ヘッダー - タイマーとコントロール */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBackToEdit} className="text-gray-900">
            ← 編集へ戻る
          </Button>
          <div className="flex flex-col">
            <span className="text-lg font-mono">
              {slides.length > 0 ? `${currentSlide + 1} / ${slides.length}` : '0 / 0'}
            </span>
            <span className="text-sm text-gray-300">
              {slides[currentSlide] ? slides[currentSlide].title.split('（')[0] : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div 
              className="text-2xl font-mono font-bold"
              aria-live="polite"
              aria-label={`経過時間 ${formatTime(Math.floor(timeElapsed))}秒`}
            >
              {formatTime(Math.floor(timeElapsed))}
            </div>
            <div className="text-sm text-gray-300">
              残り: {formatTime(Math.floor(timeRemaining))}
            </div>
          </div>
          
          <div className="flex space-x-2">
            {!isPlaying ? (
              <Button onClick={handleTogglePlay} variant="outline" className="text-gray-900">
                ▶ 開始
              </Button>
            ) : (
              <Button onClick={handleTogglePlay} variant="outline" className="text-gray-900">
                ⏸ 一時停止
              </Button>
            )}
            <Button onClick={handleReset} variant="outline" className="text-gray-900">
              ⏹ リセット
            </Button>
          </div>
        </div>
      </div>

      {/* 詳細プログレスバー - セクション分け */}
      <div className="w-full bg-gray-200 h-3 relative">
        {/* 各スライドのマーカー */}
        {slides.map((_, index) => (
          <div
            key={index}
            className="absolute top-0 bottom-0 border-l border-gray-300"
            style={{ left: `${(index / slides.length) * 100}%` }}
          >
            <div className="absolute -top-6 left-0 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
              {index + 1}
            </div>
          </div>
        ))}
        
        {/* 全体の進行バー */}
        <div 
          className="bg-blue-600 h-full transition-all duration-1000 ease-linear relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-800"></div>
        </div>
        
        {/* 現在のスライド位置マーカー */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-red-500 transition-all duration-300"
          style={{ left: `${(currentSlide / slides.length) * 100}%` }}
        >
          <div className="absolute -top-4 left-0 transform -translate-x-1/2 text-xs font-medium text-red-600">
            ▼
          </div>
        </div>
      </div>

      {/* メインスライドエリア */}
      <div 
        className="flex-1 relative overflow-hidden"
        role="region"
        aria-label={slides[currentSlide] ? slides[currentSlide].title || 'スライド' : 'スライド'}
      >
        {slides.length > 0 ? (
          slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-500 ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {slide.type === 'slide' ? (
                <MarkdownSlide
                  title={slide.title}
                  content={slide.content}
                  isActive={index === currentSlide}
                  layout={slide.layout || 'center'}
                  referenceLink={slide.referenceLink}
                />
              ) : (
                <LinkPreview
                  url={slide.url}
                  isActive={index === currentSlide}
                />
              )}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-xl mb-4">スライドデータがありません</p>
              <p className="text-sm">編集モードでPREPデータを入力してください</p>
            </div>
          </div>
        )}
      </div>

      {/* フッター - ナビゲーション */}
      <div className="bg-gray-100 p-4 flex justify-between items-center">
        <Button 
          onClick={handlePrevSlide} 
          disabled={currentSlide === 0}
          variant="outline"
        >
          ← 前のスライド
        </Button>
        
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <Button 
          onClick={handleNextSlide} 
          disabled={currentSlide === slides.length - 1}
          variant="outline"
        >
          次のスライド →
        </Button>
      </div>
    </div>
  )
}
