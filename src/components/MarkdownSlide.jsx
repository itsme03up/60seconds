import React, { useEffect, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default function MarkdownSlide({ content, title, isActive }) {
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
    <div className={`slide-content w-full h-full flex flex-col justify-center p-8 ${isActive ? 'active slide-in' : ''}`}>
      <div className="max-w-4xl mx-auto">
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
    </div>
  )
}
