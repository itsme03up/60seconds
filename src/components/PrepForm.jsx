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
          <div className="mt-2 text-xs text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full">
            ☁️ Deck ID: {prepData.deckId}
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

      {/* ボタン群 */}
      <div className="space-y-4 pt-6">
        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={handleSave}>
            💾 ローカル保存
          </Button>
          <Button variant="outline" onClick={handleLoad}>
            📂 ローカル読み込み
          </Button>
          <Button onClick={onStartSlideshow} className="px-8">
            ▶️ 再生へ
          </Button>
        </div>
        
        {/* クラウド機能 */}
        <div className="flex justify-center space-x-4">
          <Button 
            variant="outline" 
            onClick={handleSaveToCloud}
            disabled={isCloudSaving}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            {isCloudSaving ? '☁️ 保存中...' : '☁️ クラウド保存'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleListCloudDecks}
            disabled={isCloudLoading}
            className="text-green-600 border-green-300 hover:bg-green-50"
          >
            {isCloudLoading ? '☁️ 読み込み中...' : '☁️ クラウド読み込み'}
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

      {/* クラウドデッキ一覧モーダル */}
      {showDecksList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">☁️ クラウドに保存されたデッキ</h3>
              <p className="text-sm text-gray-600 mt-1">読み込みたいデッキをクリックしてください</p>
            </div>
            <div className="overflow-y-auto max-h-64 p-4">
              {availableDecks.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  保存されたデッキが見つかりませんでした
                </div>
              ) : (
                <div className="space-y-2">
                  {availableDecks.map((deck) => (
                    <div
                      key={deck.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleLoadFromCloud(deck.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            Deck ID: {deck.id}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            更新: {deck.lastModified?.toLocaleString() || '不明'}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('このデッキを削除してもよろしいですか？')) {
                              deleteDeck(deck.id).then(() => {
                                setAvailableDecks(prev => prev.filter(d => d.id !== deck.id));
                                alert('デッキを削除しました');
                              }).catch(err => {
                                alert('削除に失敗しました: ' + err.message);
                              });
                            }
                          }}
                          className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button variant="outline" onClick={() => setShowDecksList(false)}>
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* クラウド保存・読み込み・一覧表示 */}
      <div className="space-y-4">
        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={handleSaveToCloud} disabled={isCloudSaving}>
            ☁️ クラウド保存
          </Button>
          <Button variant="outline" onClick={handleListCloudDecks} disabled={isCloudLoading}>
            ☁️ クラウド一覧
          </Button>
        </div>

        {showDecksList && (
          <div className="border-t pt-4">
            <h2 className="text-lg font-bold">クラウドデッキ一覧</h2>
            <ul>
              {availableDecks.map(deck => (
                <li key={deck.id} className="flex justify-between py-2">
                  <span>{deck.title}</span>
                  <Button variant="link" onClick={() => handleLoadFromCloud(deck.id)}>
                    読み込み
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
