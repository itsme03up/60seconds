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

## デバッグ情報
- React DevTools対応
- コンソールエラーハンドリング
- localStorage状態確認機能
