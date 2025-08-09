import React, { useEffect, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default function MarkdownSlide({ content, title, isActive, layout = 'center', referenceLink }) {
  const [htmlContent, setHtmlContent] = useState('')

  useEffect(() => {
    if (content) {
      // Markedの設定
      marked.setOptions({
        breaks: true,
        gfm: true
      })

      // MarkdownをHTMLに変換
      const rawHtml = marked.parse(content)
      
      // XSS対策のためDOMPurifyでサニタイズ
      const cleanHtml = DOMPurify.sanitize(rawHtml)
      
      setHtmlContent(cleanHtml)
    }
  }, [content])

  return (
    <div className={`slide-content w-full h-full flex flex-col p-8 ${isActive ? 'active slide-in' : ''}`}>
      {layout === 'bottom' ? (
        // Exampleスライド用レイアウト：左右分割（左：iframe、右：テキスト）
        <>
          {title && (
            <h2 className="text-4xl font-bold text-center mb-6 text-gray-900 fade-in">
              {title}
            </h2>
          )}
          
          <div className="flex-1 flex gap-6">
            {/* 左側：参考リンクプレビュー */}
            {referenceLink ? (
              <div className="flex-1 bg-white border-2 border-gray-200 rounded-lg p-4 shadow-lg flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">参考リンク</h3>
                <div className="flex-1 bg-gray-50 rounded border overflow-hidden min-h-0">
                  <iframe
                    src={referenceLink}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    title="参考リンクプレビュー"
                  />
                </div>
                <a 
                  href={referenceLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800 break-all text-xs mt-2 text-center"
                >
                  {referenceLink}
                </a>
              </div>
            ) : (
              <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 text-center">参考リンクが設定されていません</p>
              </div>
            )}
            
            {/* 右側：テキストコンテンツ */}
            <div className="flex-1 bg-gray-50 rounded-lg p-6 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">具体例・事例</h3>
              <div className="flex-1 overflow-y-auto">
                <div 
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed fade-in"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                  style={{
                    fontSize: '1.1rem',
                    lineHeight: '1.6'
                  }}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        // 通常のスライドレイアウト：中央揃え
        <div className="max-w-4xl mx-auto flex flex-col justify-center h-full">
          {title && (
            <h2 className="text-4xl font-bold text-center mb-8 text-gray-900 fade-in">
              {title}
            </h2>
          )}
          
          <div 
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed fade-in"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            style={{
              fontSize: '1.25rem',
              lineHeight: '1.8'
            }}
          />
        </div>
      )}
    </div>
  )
}
