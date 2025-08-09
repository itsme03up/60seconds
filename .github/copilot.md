# GitHub Copilot 指示書

## プロジェクト概要
このプロジェクトは、PREP法（Point/Reason/Example/Summary）に基づく1分間のスライドプレゼンテーションを作成・再生するWebアプリケーションです。

## 技術スタック
- **フロントエンド**: React 18 + Vite
- **UI Framework**: Tailwind CSS v3 + shadcn/ui
- **Markdown処理**: marked + DOMPurify
- **状態管理**: React Hooks + localStorage

## アーキテクチャ

### コンポーネント構成
- `PrepForm.jsx`: PREP入力フォーム（編集モード）
- `SlideShow.jsx`: スライドショー制御とタイマー機能
- `MarkdownSlide.jsx`: Markdown→HTML変換とアニメーション
- `LinkPreview.jsx`: 外部リンクのiframe埋め込みプレビュー

### カスタムフック
- `useLocalStorage.js`: localStorage同期フック
- `useTimer.js`: 60秒タイマー機能

### UI コンポーネント
- `Button.jsx`: shadcn/ui準拠のボタン
- `Textarea.jsx`: shadcn/ui準拠のテキストエリア
- `Input.jsx`: shadcn/ui準拠の入力フィールド

## 主な機能

### 編集モード
- PREP（Point/Reason/Example/Summary）の各セクションをMarkdown形式で入力
- 参考リンクURL入力（オプション）
- ローカルストレージへの自動保存/読み込み

### 再生モード
- 60秒自動タイマー
- スライドの自動切り替え（タイマーベース）
- 手動ナビゲーション（前/次ボタン、インジケータークリック）
- リアルタイム進捗バー
- 参考リンクのiframeプレビュー

## 開発ガイドライン

### スタイリング
- Tailwind CSS v3を使用
- shadcn/ui準拠のコンポーネント設計
- レスポンシブデザイン対応
- アニメーション（slide-in, fade-in）

### データフロー
1. ユーザー入力 → PrepForm → localStorage
2. localStorage → App state → SlideShow
3. タイマー → スライド自動切り替え

### セキュリティ
- DOMPurifyによるXSS対策
- iframe sandboxing
- CSP準拠のインライン実行

## 拡張ポイント
- 追加のMarkdown記法サポート
- カスタムテーマ・スタイル
- スライドテンプレート機能
- エクスポート機能（PDF/HTML）
- プレゼンテーション分析機能

## 短時間で効く改善ポイント（優先順）

### 1. デモへの導線
- Vercel/Netlifyでの公開
- README冒頭に**Live Demo**リンクとスクショGIFを配置
- 実際の動作を即座に確認できる環境

### 2. Timerの精度と操作性
- `performance.now()`を使用した高精度タイマー
- タブ非アクティブ時の遅延対策
- キーボードショートカット:
  - **Space**: 一時停止/再開
  - **←/→**: スライド移動
  - **Esc**: 編集モードへ戻る

### 3. iframeフォールバック
- X-Frame-Options等で埋め込み不可時の対応
- 警告カード + 「新規タブで開く」ボタン
- 将来的にOGPリンクプレビューAPIへの自動フォールバック

### 4. Markdownの安全性強化
- `react-markdown` + `rehype-sanitize`の採用検討
- HTML混入の無害化
- 許可タグの限定(`<strong class="animate-fade-in">`)

### 5. 保存体験の向上
- 1秒デバウンスでの自動保存
- Export/Import機能（JSON形式）
- 保存スキーマのバージョニング対応

### 6. UIの細かな磨き込み
- 進行バー（1/4 + 残り秒併記）
- 2ペインレイアウト（md以上: 並列、sm: 縦積み）
- 参考リンク欄の説明文改善
- 再生時フォントサイズの最適化

### 7. アクセシビリティ対応
- `aria-live="polite"`でタイマー読み上げ
- スライド領域に`role="region"`
- キーボード操作の充実

### 8. Tailwind v4運用整理
- CSSファーストアプローチの活用
- `postcss.config.js`の最適化
- セットアップの簡素化

### 9. プロジェクト基盤強化
- LICENSEファイルの追加
- GitHub Actions CI/CD
- `good first issue`ラベルの活用

### 10. ドキュメント拡充
- キーボード操作一覧
- 埋め込み可否の注意書き
- 想定ユースケースの明記

## 想定ユースケース
- 1分スピーチの練習
- ライトニングトーク（LT）の準備
- 朝会での情報共有
- プレゼンテーション構成の確認
- PREP法の学習・練習

## キーボードショートカット（実装予定）
| キー | 機能 |
|------|------|
| `Space` | タイマー開始/一時停止 |
| `←` | 前のスライド |
| `→` | 次のスライド |
| `Esc` | 編集モードへ戻る |
| `Home` | 最初のスライド |
| `End` | 最後のスライド |

## 技術的改善ポイント

### パフォーマンス
- React.memoを使用したコンポーネント最適化
- useMemoでの重い計算のメモ化
- Lazy loadingでの初期ロード時間短縮

### 開発体験
- Storybook導入でコンポーネント開発
- Cypress/PlaywrightでのE2Eテスト
- ESLint/Prettierの設定強化



