import React from 'react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'

export default function PrepForm({ prepData, setPrepData, onStartSlideshow }) {
  const handleInputChange = (field, value) => {
    setPrepData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    alert('データがローカルストレージに保存されました！')
  }

  const handleLoad = () => {
    // useLocalStorageフックによって自動的に読み込まれるため、
    // ここでは確認メッセージのみ表示
    alert('データを読み込みました！')
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
      <div className="flex justify-center space-x-4 pt-6">
        <Button variant="outline" onClick={handleSave}>
          保存
        </Button>
        <Button variant="outline" onClick={handleLoad}>
          読み込み
        </Button>
        <Button onClick={onStartSlideshow} className="px-8">
          再生へ →
        </Button>
      </div>
    </div>
  )
}
