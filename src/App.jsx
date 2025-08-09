import React, { useState } from 'react'
import { Play, Save, Upload, Download, Link as LinkIcon, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import PrepForm from './components/PrepForm'
import SlideShow from './components/SlideShow'
import ErrorBoundary from './components/ErrorBoundary'
import { useLocalStorage } from './hooks/useLocalStorage'

function App() {
  const [mode, setMode] = useState('edit') // 'edit' | 'slideshow'
  
  // ローカルストレージと同期されたPREPデータ
  const [prepData, setPrepData] = useLocalStorage('prepSlideData', {
    point: '',
    reason: '',
    example: '',
    summary: '',
    referenceLink: '',
    deckId: '', // クラウド保存用のdeckId追加
    durations: {
      point: 15,
      reason: 15,
      example: 15,
      summary: 15
    }
  })

  const total = Object.values(prepData.durations).reduce((a, b) => a + b, 0)

  const handleStartSlideshow = () => {
    // 最低限のデータチェック
    if (!prepData.point.trim() && !prepData.reason.trim() && 
        !prepData.example.trim() && !prepData.summary.trim()) {
      alert('少なくとも1つのセクションにデータを入力してください。')
      return
    }
    
    console.log('Starting slideshow with data:', prepData);
    setMode('slideshow')
  }

  const handleBackToEdit = () => {
    setMode('edit')
  }

  if (mode === 'slideshow') {
    return (
      <ErrorBoundary onReset={handleBackToEdit}>
        <SlideShow 
          prepData={prepData}
          onBackToEdit={handleBackToEdit}
        />
      </ErrorBoundary>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-white">
        {/* Top Nav */}
        <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-gray-900/90 bg-gray-900 border-b border-gray-800">
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3 bg-gray-700 text-gray-200 border-gray-600">BETA</Badge>
              <span className="font-semibold text-white">60seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger>
                  <Button variant="outline" size="sm" className="border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white">
                    <Save className="mr-2 h-4 w-4" /> クラウド保存
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  データをクラウドに保存します
                </TooltipContent>
              </Tooltip>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleStartSlideshow}>
                <Play className="mr-2 h-4 w-4" /> スライドショー開始
              </Button>
              <a href="https://github.com/annayanchuk/60seconds" target="_blank" rel="noreferrer">
                <Button variant="ghost" size="icon" aria-label="GitHub" className="text-gray-300 hover:text-white hover:bg-gray-800">
                  <Github className="h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-10">
          {/* Hero */}
          <section className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">1分 PREP スライドジェネレータ</h1>
            <p className="text-slate-600 mt-2">PREP法で素早く構成、リンクを小窓でプレビュー。タイマーは1分可変（各セクション秒数）です。</p>
          </section>

          {/* 2ペイン */}
          <div className="grid gap-6 md:grid-cols-5">
            {/* 左：編集フォーム */}
            <Card className="md:col-span-3 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>編集</CardTitle>
                <CardDescription>Point / Reason / Example / Summary を入力し、必要なら参考リンクを追加してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <PrepForm 
                  prepData={prepData}
                  setPrepData={setPrepData}
                  onStartSlideshow={handleStartSlideshow}
                  isEmbedded={true}
                />
                <div className="text-sm text-slate-500">※ 太字は <code>**強調**</code> で書けます</div>
              </CardContent>
              <CardFooter className="justify-between">
                <div className="text-sm text-slate-500">合計時間：<span className="font-medium">{total}s</span></div>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleStartSlideshow}>
                  <Play className="mr-2 h-4 w-4" /> スライドショー開始
                </Button>
              </CardFooter>
            </Card>

            {/* 右：設定／プレビュー／データ */}
            <div className="md:col-span-2 space-y-6">
              {/* 秒数設定 */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>スライド表示時間（秒）</CardTitle>
                  <CardDescription>各セクションの表示時間を調整できます。</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Point</Label>
                    <Input 
                      type="number" 
                      min={3} 
                      max={90} 
                      value={prepData.durations?.point || 15}
                      onChange={e => setPrepData(prev => ({
                        ...prev,
                        durations: {
                          ...prev.durations,
                          point: parseInt(e.target.value) || 15
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Reason</Label>
                    <Input 
                      type="number" 
                      min={3} 
                      max={90} 
                      value={prepData.durations?.reason || 15}
                      onChange={e => setPrepData(prev => ({
                        ...prev,
                        durations: {
                          ...prev.durations,
                          reason: parseInt(e.target.value) || 15
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Example</Label>
                    <Input 
                      type="number" 
                      min={3} 
                      max={90} 
                      value={prepData.durations?.example || 15}
                      onChange={e => setPrepData(prev => ({
                        ...prev,
                        durations: {
                          ...prev.durations,
                          example: parseInt(e.target.value) || 15
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Summary</Label>
                    <Input 
                      type="number" 
                      min={3} 
                      max={90} 
                      value={prepData.durations?.summary || 15}
                      onChange={e => setPrepData(prev => ({
                        ...prev,
                        durations: {
                          ...prev.durations,
                          summary: parseInt(e.target.value) || 15
                        }
                      }))}
                    />
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-slate-500">合計時間：{total}s</CardFooter>
              </Card>

              {/* 参考リンクプレビュー */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" /> 参考リンク（プレビュー）
                  </CardTitle>
                  <CardDescription>埋め込み可能なサイトは小窓で表示されます。</CardDescription>
                </CardHeader>
                <CardContent>
                  {prepData.referenceLink ? (
                    <div className="aspect-video bg-gray-50 rounded border overflow-hidden">
                      <iframe
                        src={prepData.referenceLink}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                        title="参考リンクプレビュー"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-50 rounded border flex items-center justify-center">
                      <p className="text-gray-500 text-sm">参考リンクを入力してください</p>
                    </div>
                  )}
                  <div className="text-xs text-slate-500 mt-2">※ X-Frame-Options / CSP により埋め込めない場合があります</div>
                </CardContent>
              </Card>

              {/* データ管理（Tabsで整理） */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>データ管理</CardTitle>
                  <CardDescription>ローカル／クラウド／ファイルで管理できます。</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="cloud">
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="cloud">クラウド</TabsTrigger>
                      <TabsTrigger value="local">ローカル</TabsTrigger>
                      <TabsTrigger value="file">ファイル</TabsTrigger>
                    </TabsList>

                    <TabsContent value="cloud" className="space-y-2 mt-4">
                      <div className="flex gap-2">
                        <Button><Upload className="mr-2 h-4 w-4" /> 保存</Button>
                        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> 一覧</Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="local" className="mt-4">
                      <p className="text-sm text-slate-500">このブラウザのみで保持します。</p>
                    </TabsContent>

                    <TabsContent value="file" className="mt-4 space-y-2">
                      <div className="flex gap-2">
                        <Button variant="outline">JSONエクスポート</Button>
                        <Button variant="outline">JSONインポート</Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="my-10" />
          <p className="text-center text-sm text-slate-500">
            ヒント：スライドショー中は <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Space</kbd> で一時停止／再開、<kbd className="px-2 py-1 bg-gray-100 rounded text-xs">←</kbd> <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">→</kbd> で前後移動でした
          </p>
        </main>

        <footer className="py-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} 60seconds — PREP 1分スピーチ支援
        </footer>
      </div>
    </TooltipProvider>
  )
}

export default App
