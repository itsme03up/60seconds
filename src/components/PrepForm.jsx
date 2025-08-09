import React, { useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { useDebounce } from '../hooks/useDebounce'
import { z } from 'zod'

// データバリデーション用スキーマ
const PrepDataSchema = z.object({
  point: z.string().default(''),
  reason: z.string().default(''),
  example: z.string().default(''),
  summary: z.string().default(''),
  referenceLink: z.string().url().or(z.string().length(0)).default('')
})

const ExportDataSchema = z.object({
  version: z.string().optional(),
  createdAt: z.string().optional(),
  appName: z.string().optional(),
  prepData: PrepDataSchema
})

export default function PrepForm({ prepData, setPrepData, onStartSlideshow }) {
  const fileInputRef = useRef(null)

  // 自動保存（1秒デバウンス）
  const debouncedSave = useDebounce((data) => {
    // 自動保存処理（ローカルストレージは useLocalStorage で自動管理）
    // データの保存は useLocalStorage フックで自動的に行われます
  }, 1000)

  useEffect(() => {
    debouncedSave(prepData)
  }, [prepData, debouncedSave])

  const handleInputChange = (field, value) => {
    setPrepData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleExport = () => {
    const dataToExport = {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      appName: '60秒PREPスライド',
      prepData
    }
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prep-slides-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const rawData = JSON.parse(e.target.result)
          
          // バリデーション実行
          const validationResult = ExportDataSchema.safeParse(rawData)
          
          if (validationResult.success) {
            setPrepData(validationResult.data.prepData)
            alert('✅ データを正常にインポートしました！')
          } else {
            // フォールバック: 部分的なデータでも可能な限り復元
            const fallbackResult = PrepDataSchema.safeParse(rawData.prepData || rawData)
            if (fallbackResult.success) {
              setPrepData(fallbackResult.data)
              alert('⚠️ 一部のデータが無効でしたが、可能な範囲でインポートしました。')
            } else {
              alert('❌ 無効なファイル形式です。\n\n対応形式:\n- point, reason, example, summary (文字列)\n- referenceLink (有効なURL)')
            }
          }
        } catch (error) {
          alert('❌ ファイルの読み込みに失敗しました。\nJSONファイルを選択してください。')
        }
      }
      reader.readAsText(file)
    }
    // ファイル入力をリセット
    event.target.value = ''
  }

  const triggerImport = () => {
    fileInputRef.current?.click()
  }

  const handleSave = () => {
    // useLocalStorageフックにより自動保存されているため、確認メッセージのみ
    alert('データがローカルストレージに保存されました！')
  }

  const handleLoad = () => {
    // useLocalStorageフックによって自動的に読み込まれるため、
    // ここでは確認メッセージのみ表示
    alert('データを読み込みました！\n現在の内容がローカルストレージから復元されています。')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          1分 PREP スライドジェネレータ
        </h1>
        <p className="text-gray-600">
          PREP法（Point/Reason/Example/Summary）に基づくスライドを作成しましょう
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Point */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Point（要点・結論）
          </label>
          <Textarea
            placeholder="まず結論を明確に述べてください..."
            value={prepData.point}
            onChange={(e) => handleInputChange('point', e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Reason（理由・根拠）
          </label>
          <Textarea
            placeholder="なぜそう言えるのか、理由や根拠を説明してください..."
            value={prepData.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        {/* Example */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Example（具体例・事例）
          </label>
          <Textarea
            placeholder="具体的な例や事例を挙げてください..."
            value={prepData.example}
            onChange={(e) => handleInputChange('example', e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Summary（まとめ）
          </label>
          <Textarea
            placeholder="最後にもう一度要点をまとめてください..."
            value={prepData.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            className="min-h-[120px]"
          />
        </div>
      </div>

      {/* 参考リンク */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          参考リンク（オプション）
        </label>
        <Input
          type="url"
          placeholder="https://example.com"
          value={prepData.referenceLink}
          onChange={(e) => handleInputChange('referenceLink', e.target.value)}
        />
        <p className="text-xs text-gray-500">
          埋め込み可能なサイトのURLを入力すると、スライドショー中にプレビューが表示されます
        </p>
      </div>

      {/* ボタン群 */}
      <div className="space-y-4 pt-6">
        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={handleSave}>
            💾 保存
          </Button>
          <Button variant="outline" onClick={handleLoad}>
            📂 読み込み
          </Button>
          <Button onClick={onStartSlideshow} className="px-8">
            ▶️ 再生へ
          </Button>
        </div>
        
        {/* Export/Import */}
        <div className="flex justify-center space-x-4 text-sm">
          <Button variant="ghost" onClick={handleExport} className="text-xs">
            📤 エクスポート
          </Button>
          <Button variant="ghost" onClick={triggerImport} className="text-xs">
            📥 インポート
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
        
        {/* キーボードショートカットヘルプ */}
        <div className="text-center text-xs text-gray-500 mt-4">
          💡 ヒント: スライドショー中は Space で一時停止/再開、← → でスライド移動
        </div>
      </div>
    </div>
  )
}
