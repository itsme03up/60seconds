import React, { useState } from 'react'
import PrepForm from './components/PrepForm'
import SlideShow from './components/SlideShow'
import { useLocalStorage } from './hooks/useLocalStorage'

function App() {
  const [mode, setMode] = useState('edit') // 'edit' | 'slideshow'
  
  // ローカルストレージと同期されたPREPデータ
  const [prepData, setPrepData] = useLocalStorage('prepSlideData', {
    point: '',
    reason: '',
    example: '',
    summary: '',
    referenceLink: ''
  })

  const handleStartSlideshow = () => {
    // 最低限のデータチェック
    if (!prepData.point.trim() && !prepData.reason.trim() && 
        !prepData.example.trim() && !prepData.summary.trim()) {
      alert('少なくとも1つのセクションにデータを入力してください。')
      return
    }
    
    setMode('slideshow')
  }

  const handleBackToEdit = () => {
    setMode('edit')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {mode === 'edit' ? (
        <PrepForm 
          prepData={prepData}
          setPrepData={setPrepData}
          onStartSlideshow={handleStartSlideshow}
        />
      ) : (
        <SlideShow 
          prepData={prepData}
          onBackToEdit={handleBackToEdit}
        />
      )}
    </div>
  )
}

export default App
