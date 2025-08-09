import React, { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { useDebounce } from '../hooks/useDebounce'
import { z } from 'zod'
import { newDeckId, saveDeck, loadDeck, listDecks, deleteDeck } from '../lib/cloudStorage'

// データバリデーション用スキーマ
const PrepDataSchema = z.object({
  point: z.string().default(''),
  reason: z.string().default(''),
  example: z.string().default(''),
  summary: z.string().default(''),
  referenceLink: z.string().url().or(z.string().length(0)).default(''),
  durations: z.object({
    point: z.number().min(3).max(90).default(15),
    reason: z.number().min(3).max(90).default(15),
    example: z.number().min(3).max(90).default(15),
    summary: z.number().min(3).max(90).default(15)
  }).default({})
})

const ExportDataSchema = z.object({
  version: z.string().optional(),
  createdAt: z.string().optional(),
  appName: z.string().optional(),
  prepData: PrepDataSchema
})

export default function PrepForm({ prepData, setPrepData, onStartSlideshow }) {
  const fileInputRef = useRef(null)
  const [isCloudSaving, setIsCloudSaving] = useState(false)
  const [isCloudLoading, setIsCloudLoading] = useState(false)
  const [availableDecks, setAvailableDecks] = useState([])
  const [showDecksList, setShowDecksList] = useState(false)

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
      prepData: {
        ...prepData,
        // タイトル情報も含める
        title: `PREP資料 - ${new Date().toLocaleDateString()}`
      }
    }
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const fileName = prepData.deckId 
      ? `prep-deck-${prepData.deckId}-${new Date().toISOString().split('T')[0]}.json`
      : `prep-slides-${new Date().toISOString().split('T')[0]}.json`
    a.download = fileName
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

  // ローカルストレージ機能
  const handleSave = () => {
    // useLocalStorageフックにより自動保存されているため、確認メッセージのみ
    alert('💾 データがローカルストレージに保存されました！\n（入力と同時に自動保存されています）')
  }

  const handleLoad = () => {
    // useLocalStorageフックによって自動的に読み込まれるため、
    // ここでは確認メッセージのみ表示
    alert('📂 データを読み込みました！\n現在の内容がローカルストレージから復元されています。')
  }

  // クラウド保存機能
  const handleSaveToCloud = async () => {
    if (isCloudSaving) return;
    
    setIsCloudSaving(true);
    try {
      // 現在のフォーム状態から deckJson を作る
      const deckJson = {
        title: `PREP資料 - ${new Date().toLocaleDateString()}`,
        totalSec: 60,
        sections: [
          { key: "point",   text: prepData.point,   link: prepData.referenceLink },
          { key: "reason",  text: prepData.reason,  link: prepData.referenceLink },
          { key: "example", text: prepData.example, link: prepData.referenceLink },
          { key: "summary", text: prepData.summary, link: prepData.referenceLink }
        ]
      };

      const id = prepData.deckId || newDeckId();
      await saveDeck(id, deckJson);
      
      // deckId を state に保持して次回上書き保存できるように
      setPrepData(prev => ({ ...prev, deckId: id }));
      
      alert(`✅ クラウド保存しました！\nDeck ID: ${id}`);
    } catch (error) {
      console.error('クラウド保存エラー:', error);
      alert(`❌ クラウド保存に失敗しました。\n${error.message}\n\nローカル保存は継続されています。`);
    } finally {
      setIsCloudSaving(false);
    }
  };

  // クラウドから一覧取得
  const handleListCloudDecks = async () => {
    setIsCloudLoading(true);
    try {
      const decks = await listDecks();
      setAvailableDecks(decks);
      if (decks.length === 0) {
        alert('クラウドにデータが見つかりませんでした');
      } else {
        setShowDecksList(true);
      }
    } catch (error) {
      console.error('クラウド一覧取得エラー:', error);
      alert(`❌ クラウドデータの取得に失敗しました。\n${error.message}`);
    } finally {
      setIsCloudLoading(false);
    }
  };

  // クラウドから読み込み
  const handleLoadFromCloud = async (deckId) => {
    setIsCloudLoading(true);
    try {
      const data = await loadDeck(deckId);
      
      // データを現在のフォームに適用
      setPrepData(prev => ({
        ...prev,
        deckId: deckId,
        point:   data.sections?.find(s => s.key === "point")?.text || "",
        reason:  data.sections?.find(s => s.key === "reason")?.text || "",
        example: data.sections?.find(s => s.key === "example")?.text || "",
        summary: data.sections?.find(s => s.key === "summary")?.text || "",
        referenceLink: data.sections?.find(s => s.link)?.link || ""
      }));
      
      setShowDecksList(false);
      alert(`✅ クラウドから読み込みました！\nDeck ID: ${deckId}`);
    } catch (error) {
      console.error('クラウド読み込みエラー:', error);
      alert(`❌ クラウドデータの読み込みに失敗しました。\n${error.message}`);
    } finally {
      setIsCloudLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          1分 PREP スライドジェネレータ
        </h1>
        <p className="text-gray-600">
          PREP法（Point/Reason/Example/Summary）に基づくスライドを作成しましょう
        </p>
        {prepData.deckId && (
          <div className="mt-3 text-xs bg-blue-50 inline-block px-4 py-2 rounded-full border border-blue-200">
            <span className="text-blue-800 font-medium">☁️ クラウド保存済み:</span>
            <span className="text-blue-600 ml-2 font-mono">{prepData.deckId}</span>
          </div>
        )}
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

      {/* スライド秒数設定 */}
      <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
        <label className="text-sm font-medium text-gray-700">
          スライド表示時間設定（秒）
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-600">Point</label>
            <Input
              type="number"
              min="3"
              max="90"
              value={prepData.durations?.point || 15}
              onChange={(e) => handleInputChange('durations', {
                ...prepData.durations,
                point: parseInt(e.target.value) || 15
              })}
              className="text-center"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Reason</label>
            <Input
              type="number"
              min="3"
              max="90"
              value={prepData.durations?.reason || 15}
              onChange={(e) => handleInputChange('durations', {
                ...prepData.durations,
                reason: parseInt(e.target.value) || 15
              })}
              className="text-center"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Example</label>
            <Input
              type="number"
              min="3"
              max="90"
              value={prepData.durations?.example || 15}
              onChange={(e) => handleInputChange('durations', {
                ...prepData.durations,
                example: parseInt(e.target.value) || 15
              })}
              className="text-center"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Summary</label>
            <Input
              type="number"
              min="3"
              max="90"
              value={prepData.durations?.summary || 15}
              onChange={(e) => handleInputChange('durations', {
                ...prepData.durations,
                summary: parseInt(e.target.value) || 15
              })}
              className="text-center"
            />
          </div>
        </div>
        <div className="text-xs text-gray-500 text-center">
          合計時間: {Object.values(prepData.durations || {point: 15, reason: 15, example: 15, summary: 15}).reduce((a, b) => a + b, 0)}秒
        </div>
      </div>

      {/* メインアクション */}
      <div className="space-y-4 pt-6">
        <div className="flex justify-center">
          <Button onClick={onStartSlideshow} className="px-12 py-3 text-lg bg-green-600 hover:bg-green-700">
            ▶️ スライドショー開始
          </Button>
        </div>
        
        {/* データ管理セクション */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 text-center mb-4">
            💾 データ管理
          </h3>
          
          {/* ローカルストレージ */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-600 text-center mb-2">
              📱 ローカル保存（このブラウザのみ）
            </h4>
            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={handleSave} size="sm" className="text-gray-600">
                💾 ローカル保存確認
              </Button>
              <Button variant="outline" onClick={handleLoad} size="sm" className="text-gray-600">
                📂 ローカル読み込み確認
              </Button>
            </div>
          </div>
          
          {/* クラウドストレージ */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-600 text-center mb-2">
              ☁️ クラウド保存（どこからでもアクセス）
            </h4>
            <div className="flex justify-center space-x-3">
              <Button 
                variant="outline" 
                onClick={handleSaveToCloud}
                disabled={isCloudSaving}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                size="sm"
              >
                {isCloudSaving ? '☁️ 保存中...' : '☁️ クラウド保存'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleListCloudDecks}
                disabled={isCloudLoading}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                size="sm"
              >
                {isCloudLoading ? '📋 読み込み中...' : '📋 クラウド一覧'}
              </Button>
            </div>
          </div>
          
          {/* ファイル操作 */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-600 text-center mb-2">
              📁 ファイル操作（バックアップ・共有用）
            </h4>
            <div className="flex justify-center space-x-3">
              <Button variant="ghost" onClick={handleExport} size="sm" className="text-xs">
                📤 JSONエクスポート
              </Button>
              <Button variant="ghost" onClick={triggerImport} size="sm" className="text-xs">
                📥 JSONインポート
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
          
          {/* 自動保存の説明 */}
          <div className="text-center text-xs text-gray-500 bg-gray-50 p-2 rounded">
            💡 入力内容は自動的にブラウザに保存されます
          </div>
        </div>
        
        {/* キーボードショートカットヘルプ */}
        <div className="text-center text-xs text-gray-500 mt-4">
          💡 ヒント: スライドショー中は Space で一時停止/再開、← → でスライド移動
        </div>
      </div>

      {/* クラウドデッキ一覧モーダル */}
      {showDecksList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-hidden">
            <div className="p-4 border-b bg-blue-50">
              <h3 className="text-lg font-semibold text-blue-900">☁️ クラウドに保存されたデッキ</h3>
              <p className="text-sm text-blue-700 mt-1">読み込みたいデッキをクリックしてください</p>
            </div>
            <div className="overflow-y-auto max-h-64 p-4">
              {availableDecks.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">📭</div>
                  <p>保存されたデッキが見つかりませんでした</p>
                  <p className="text-xs mt-1">まずはデッキを作成してクラウド保存してみてください</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableDecks.map((deck) => (
                    <div
                      key={deck.id}
                      className="border rounded-lg p-3 hover:bg-blue-50 cursor-pointer transition-colors group"
                      onClick={() => handleLoadFromCloud(deck.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900 group-hover:text-blue-700">
                            📄 {deck.title || `Deck ${deck.id.slice(0, 8)}`}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {deck.id}
                          </div>
                          <div className="text-xs text-gray-500">
                            📅 更新: {deck.lastModified?.toLocaleString() || '不明'}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('このデッキを削除してもよろしいですか？')) {
                              deleteDeck(deck.id).then(() => {
                                setAvailableDecks(prev => prev.filter(d => d.id !== deck.id));
                                alert('✅ デッキを削除しました');
                              }).catch(err => {
                                alert('❌ 削除に失敗しました: ' + err.message);
                              });
                            }
                          }}
                          className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="デッキを削除"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <Button variant="outline" onClick={() => setShowDecksList(false)}>
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
