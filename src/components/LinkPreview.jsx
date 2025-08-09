import React, { useState, useEffect } from 'react'

export default function LinkPreview({ url, isActive }) {
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'loaded' | 'blocked' | 'error'

  // URL変更時に状態をリセット
  useEffect(() => {
    if (!url) {
      setStatus('idle')
      return
    }
    
    setStatus('loading')
    
    // 2.5秒後に埋め込みブロック判定
    const timeoutId = setTimeout(() => {
      if (status === 'loading') {
        setStatus('blocked')
      }
    }, 2500)
    
    return () => clearTimeout(timeoutId)
  }, [url])

  const handleLoad = () => {
    setStatus('loaded')
  }

  const handleError = () => {
    setStatus('error')
  }

  if (!url) {
    return (
      <div className={`slide-content w-full h-full flex items-center justify-center ${isActive ? 'active slide-in' : ''}`}>
        <div className="text-center text-gray-500">
          <p className="text-xl mb-4">参考リンクが設定されていません</p>
          <p className="text-sm">編集モードでURLを入力してください</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`slide-content w-full h-full flex flex-col ${isActive ? 'active slide-in' : ''}`}>
      <div className="bg-gray-100 p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">参考リンク</h3>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 break-all text-sm"
        >
          {url}
        </a>
      </div>
      
      <div className="flex-1 relative">
        {/* ローディング状態 */}
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm">プレビューを読み込み中...</p>
            </div>
          </div>
        )}
        
        {/* 埋め込みブロック・エラー時のフォールバック */}
        {(status === 'blocked' || status === 'error') && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800 font-medium">
                      {status === 'blocked' 
                        ? 'このサイトは埋め込みが許可されていない可能性があります'
                        : '読み込みエラーが発生しました'
                      }
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                {status === 'blocked' 
                  ? 'サイトの設定（X-Frame-Options や CSP）により、プレビューを表示できませんでした。'
                  : 'ネットワークエラーまたは無効なURLです。'
                }<br/>
                下のボタンから新しいタブで開いてご覧ください。
              </p>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                新しいタブで開く
              </a>
            </div>
          </div>
        )}

        {/* 正常に読み込まれた場合のiframe */}
        {status !== 'blocked' && status !== 'error' && (
          <iframe
            src={url}
            className="w-full h-full border-0"
            onLoad={handleLoad}
            onError={handleError}
            sandbox="allow-scripts allow-same-origin allow-forms"
            title="参考リンクプレビュー"
          />
        )}
      </div>
    </div>
  )
}
