# 🎯 60秒 PREP スライドジェネレータ

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-orange.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-green.svg)](https://tailwindcss.com/)

**PREP法に基づく60秒プレゼンテーションを効率的に作成・練習できるWebアプリケーション**

> 🚀 **[Live Demo](https://your-demo-url.vercel.app)** で実際に試してみてください！

![Screenshot](https://via.placeholder.com/800x400/2563eb/ffffff?text=60秒+PREP+スライド+Screenshot)

## 🎯 想定ユースケース

- **📢 1分スピーチの練習** - 時間を意識した簡潔な発表の練習
- **⚡ ライトニングトーク（LT）準備** - 短時間プレゼンの構成確認
- **🌅 朝会での情報共有** - PREP法での効率的な報告
- **📊 プレゼンテーション構成の確認** - 論理的な流れの検証

## ✨ 主な機能

### 📝 編集モード
- **PREP構造** - Point/Reason/Example/Summary の各セクションをMarkdown形式で入力
- **参考リンク** - ExampleスライドにiframeプレビューでURL表示
- **自動保存** - 1秒デバウンスでリアルタイム保存
- **データ管理** - JSON形式でのExport/Import機能

### 🎬 再生モード
- **高精度タイマー** - `performance.now()`基準の正確な60秒計測
- **自動スライド送り** - 各セクション15秒ずつの自動切り替え
- **手動ナビゲーション** - キーボードショートカット対応
- **視覚的フィードバック** - セクション分けされた詳細プログレスバー
- **埋め込み対応** - iframe表示とフォールバック機能

## ⌨️ キーボードショートカット

| キー | 機能 |
|------|------|
| `Space` | ⏯️ タイマー開始/一時停止 |
| `←` | ⬅️ 前のスライド |
| `→` | ➡️ 次のスライド |
| `R` | 🔄 リセット（最初から再開） |
| `Esc` | 📝 編集モードへ戻る |
| `Home` | ⏮️ 最初のスライド |
| `End` | ⏭️ 最後のスライド |

## � セットアップ

```bash
# 依存ライブラリのインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build
```

## 🏗️ 技術スタック

- **フロントエンド**: React 18.2, Vite 5.0+
- **スタイリング**: Tailwind CSS v4.0, shadcn/ui
- **ユーティリティ**: Marked (Markdown parser), DOMPurify (XSS prevention)
- **ビルドツール**: Vite + @tailwindcss/vite plugin

## 📁 プロジェクト構成

```
src/
├── components/
│   ├── PrepForm.jsx         # PREP入力フォーム + Export/Import
│   ├── MarkdownSlide.jsx    # Markdown→HTML + アニメーション
│   ├── LinkPreview.jsx      # iframe プレビュー + フォールバック
│   ├── SlideShow.jsx        # タイマー制御 + スライド切替
│   └── ui/                  # shadcn/ui コンポーネント
├── hooks/
│   ├── useLocalStorage.js   # localStorage 同期
│   ├── useTimer.js          # 高精度タイマー + visibilitychange対応
│   └── useDebounce.js       # デバウンス処理
└── lib/
    └── utils.js             # ユーティリティ関数
```

## � 既知の制限事項

- **iframe埋め込み** - サイト側の設定（X-Frame-Options、CSP）により表示できない場合があります
- **タイマー精度** - 長時間バックグラウンドタブになると若干の時間ずれが生じる可能性があります
- **ブラウザ対応** - モダンブラウザ（ES2020+）での動作を想定しています

## 🤝 コントリビューション

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 🙏 謝辞

- [PREP法](https://ja.wikipedia.org/wiki/PREP法) - 論理的な文章構成手法
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful React components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework