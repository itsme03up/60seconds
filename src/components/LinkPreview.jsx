import React, { useState } from 'react'

export default function LinkPreview({ url, isActive }) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
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
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">プレビューを読み込めませんでした</p>
              <p className="text-sm">このサイトは埋め込みに対応していない可能性があります</p>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                新しいタブで開く
              </a>
            </div>
          </div>
        ) : (
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
