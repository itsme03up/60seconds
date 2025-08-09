import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Amplify runtime configuration (optional)
// If amplify_outputs.json exists (after running Amplify sandbox/deploy), configure Amplify.
import { Amplify } from 'aws-amplify'
;(async () => {
  try {
    const res = await fetch('/amplify_outputs.json', { cache: 'no-store' })
    if (res.ok) {
      const cfg = await res.json()
      Amplify.configure(cfg)
      console.log('✅ Amplify configured (Storage enabled)')
      console.log('AMPLIFY OUTPUTS - Storage:', cfg.storage) // デバッグ用
      if (!cfg.storage) {
        console.warn('⚠️ Storage configuration not found in amplify_outputs.json')
      }
    } else {
      console.log('ℹ️ Amplify outputs not found. Cloud features will be disabled until backend is generated.')
    }
  } catch (err) {
    console.warn('Amplify config fetch failed:', err?.message || err)
  }
})()

// アプリケーション起動時にコンソールをクリア
console.clear()
console.log('🎯 60秒PREPスライドジェネレータ - 起動中...')

// グローバルエラーハンドラーでスクリプトエラーを抑制
window.addEventListener('error', (event) => {
  if (event.filename && (event.filename.includes('parts.js') || event.filename.includes('news.js'))) {
    console.warn('外部スクリプトエラーを無視:', event.message)
    event.preventDefault()
    return false
  }
})

// 未処理のPromise rejectionも処理
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('nav_area') || event.reason.message.includes('parts.js'))) {
    console.warn('外部スクリプトのPromiseエラーを無視:', event.reason.message)
    event.preventDefault()
  }
})

// Amplifyの設定は後で追加（amplify_outputs.jsonが生成されてから）
// import { Amplify } from "aws-amplify";
// import amplifyConfig from "../amplify_outputs.json";
// Amplify.configure(amplifyConfig);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
