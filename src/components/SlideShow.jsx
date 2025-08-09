import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Play, Pause, RotateCcw, Home, ChevronLast } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import MarkdownSlide from './MarkdownSlide'
import LinkPreview from './LinkPreview'

export default function SlideShow({ prepData, onBackToEdit }) {
  const [isPlaying, setIsPlaying] = useState(true)
  
  // ① 可変にも対応できるよう定義（prepDataから取得、デフォルトは15秒）
  const durations = [
    prepData.durations?.point || 15,
    prepData.durations?.reason || 15,
    prepData.durations?.example || 15,
    prepData.durations?.summary || 15
  ]
  const edges = durations.reduce((a, s) => { a.push((a.at(-1) || 0) + s); return a; }, [])
  const total = edges.at(-1)
  
  // ② 再生位置の管理（RAFで秒ドリフトを回避）
  const startRef = useRef(performance.now())
  const offsetRef = useRef(0)
  const rafRef = useRef(0)
  const [t, setT] = useState(0)

  // ② タイマーループの実装
  useEffect(() => {
    cancelAnimationFrame(rafRef.current)
    
    const loop = () => {
      if (isPlaying) {
        const nowSec = (performance.now() - startRef.current) / 1000 + offsetRef.current
        const clampedT = Math.min(nowSec, total)
        setT(clampedT)
        
        if (nowSec < total) {
          rafRef.current = requestAnimationFrame(loop)
        }
      }
    }
    
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(loop)
    }
    
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, total])

  // ③ t→idx 変換（可変長対応）
  const currentSlide = edges.findIndex(edge => t < edge)
  const validCurrentSlide = currentSlide === -1 ? edges.length - 1 : currentSlide
  
  // ④ 手動移動：タイムラインを「そのスライドの先頭時刻」に同期
  const goTo = (target) => {
    const clamped = Math.max(0, Math.min(target, durations.length - 1))
    const targetStart = (edges[clamped - 1] ?? 0) // そのスライド開始秒
    const now = performance.now()
    // startTs を再定義して、次フレーム以降もこのスライドになるように
    startRef.current = now - (targetStart - offsetRef.current) * 1000
    offsetRef.current = 0
    setT(targetStart) // 表示も即時反映
  }

  const handleNextSlide = () => goTo(validCurrentSlide + 1)
  const handlePrevSlide = () => goTo(validCurrentSlide - 1)

  // 計算値
  const timeElapsed = t
  const timeRemaining = total - t
  const progress = (t / total) * 100
  const isCompleted = t >= total

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

  // 自動スライド送りは削除（再生位置ベースに変更）

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
          handlePrevSlide()
          break
        case 'ArrowRight':
          event.preventDefault()
          handleNextSlide()
          break
        case 'r':
        case 'R':
          event.preventDefault()
          handleReset()
          break
        case 'Escape':
          event.preventDefault()
          onBackToEdit()
          break
        case 'Home':
          event.preventDefault()
          goTo(0)
          break
        case 'End':
          event.preventDefault()
          goTo(slides.length - 1)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onBackToEdit, slides.length])

  // 削除された重複関数定義

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev)
  }

  const handleReset = () => {
    startRef.current = performance.now()
    offsetRef.current = 0
    setT(0)
    setIsPlaying(true)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ヘッダー - shadcn/ui スタイル */}
      <header className="bg-gray-900 text-white border-b border-gray-800">
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={onBackToEdit} 
              className="border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              編集へ戻る
            </Button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-gray-700 text-gray-200 border-gray-600">
                  {slides.length > 0 ? `${validCurrentSlide + 1} / ${slides.length}` : '0 / 0'}
                </Badge>
                <span className="text-sm text-gray-300 font-medium">
                  {slides[validCurrentSlide] ? slides[validCurrentSlide].title.split('（')[0] : ''}
                </span>
              </div>
              {/* デバッグ情報 */}
              <span className="text-xs text-yellow-300 mt-1">
                Playing: {isPlaying ? 'YES' : 'NO'} | t: {t.toFixed(1)} | Total: {total}s
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
              <div className="text-sm text-gray-400">
                残り: {formatTime(Math.floor(timeRemaining))}
              </div>
            </div>
            
            <Separator orientation="vertical" className="h-8 bg-gray-700" />
            
            <div className="flex space-x-2">
              {!isPlaying ? (
                <Button 
                  onClick={handleTogglePlay} 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Play className="mr-2 h-4 w-4" />
                  開始
                </Button>
              ) : (
                <Button 
                  onClick={handleTogglePlay} 
                  variant="outline" 
                  size="sm"
                  className="border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white"
                >
                  <Pause className="mr-2 h-4 w-4" />
                  一時停止
                </Button>
              )}
              <Button 
                onClick={handleReset} 
                variant="outline" 
                size="sm"
                className="border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                リセット
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* プログレスバー - Card形式 */}
      <Card className="mx-4 mt-4 mb-2 rounded-xl shadow-sm border-slate-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-slate-700">
                {validCurrentSlide + 1}/{slides.length}
              </Badge>
              <span className="text-sm font-medium text-slate-700">
                {slides[validCurrentSlide] ? slides[validCurrentSlide].title.split('（')[0] : ''}
              </span>
            </div>
            <div className="text-sm text-slate-600 font-mono">
              残り {Math.floor(timeRemaining)}秒 / 合計 {total}秒
            </div>
          </div>
          
          {/* プログレスバーコンテナ（上部にラベル用余白を確保） */}
          <div className="pt-8">
            <div className="w-full bg-gray-200 h-4 relative rounded-full overflow-hidden shadow-inner">
              {/* 各セクションの背景（色分け） */}
              {durations.map((duration, index) => {
                const sectionStart = (edges[index - 1] || 0) / total * 100
                const sectionWidth = duration / total * 100
                const colors = [
                    'bg-sky-100',
                    'bg-teal-100',
                    'bg-amber-100',
                    'bg-indigo-100'
                ]
                const accents = [
                    'ring-sky-400',
                    'ring-teal-400',
                    'ring-amber-400',
                    'ring-indigo-400'
                ]
                
                return (
                  <div
                    key={`section-${index}`}
                    className={`absolute top-0 bottom-0 ${colors[index]} ${accents[index]} ring-1 text-slate-800 transition-all duration-300`}
                    style={{ 
                      left: `${sectionStart}%`,
                      width: `${sectionWidth}%`
                    }}
                  />
                )
              })}

              {/* 各スライドの区切り線と秒数表示 */}
              {slides.map((slide, index) => {
                const sectionStart = (edges[index - 1] || 0) / total * 100
                const sectionCenter = sectionStart + (durations[index] / total * 100) / 2
                
                return (
                  <div key={`divider-${index}`}>
                    {/* セクション境界線 */}
                    {index > 0 && (
                      <div
                        className="absolute top-0 bottom-0 border-l-2 border-gray-500 z-10"
                        style={{ left: `${sectionStart}%` }}
                      />
                    )}
                    
                    {/* セクションラベルと秒数 */}
                    <div
                      className="absolute -top-8 transform -translate-x-1/2 text-xs text-gray-700 whitespace-nowrap font-medium text-center"
                      style={{ left: `${sectionCenter}%` }}
                    >
                      <div>{slide.title.split('（')[0]}</div>
                      <div className="text-gray-500">{durations[index]}秒</div>
                    </div>
                  </div>
                )
              })}
              
              {/* 現在のスライド範囲ハイライト */}
              <div
                className="absolute top-0 bottom-0 bg-red-500 bg-opacity-30 transition-all duration-300 border-l-2 border-r-2 border-red-600"
                style={{ 
                  left: `${((edges[validCurrentSlide - 1] || 0) / total) * 100}%`,
                  width: `${(durations[validCurrentSlide] / total) * 100}%`
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* メインスライドエリア */}
      <div 
        className="flex-1 relative overflow-hidden"
        role="region"
        aria-label={slides[validCurrentSlide] ? slides[validCurrentSlide].title || 'スライド' : 'スライド'}
      >
        {slides.length > 0 ? (
          slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-500 ${
                index === validCurrentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {slide.type === 'slide' ? (
                <MarkdownSlide
                  title={slide.title}
                  content={slide.content}
                  isActive={index === validCurrentSlide}
                  layout={slide.layout || 'center'}
                  referenceLink={slide.referenceLink}
                />
              ) : (
                <LinkPreview
                  url={slide.url}
                  isActive={index === validCurrentSlide}
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
      <Card className="mx-4 mb-4 rounded-xl shadow-sm border-slate-200">
        <CardContent className="p-4 flex justify-between items-center">
          <Button 
            onClick={handlePrevSlide} 
            disabled={validCurrentSlide === 0}
            variant="outline"
            className="px-4 py-2 min-w-[120px] disabled:opacity-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            前のスライド
          </Button>
          
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                  index === validCurrentSlide 
                    ? 'bg-emerald-600 ring-2 ring-emerald-200' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                title={`スライド ${index + 1} に移動`}
              />
            ))}
          </div>
          
          <Button 
            onClick={handleNextSlide} 
            disabled={validCurrentSlide === slides.length - 1}
            variant="outline"
            className="px-4 py-2 min-w-[120px] disabled:opacity-50"
          >
            次のスライド
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
