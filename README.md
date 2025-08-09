# 1分 PREP スライドジェネレータ

PREP 法に基づくスライドを React/Vite + Tailwind v4 + shadcn/ui で作成・再生できるアプリケーションです。

## 🎯 想定ユースケース
- **1分スピーチの練習** - 時間を意識した簡潔な発表の練習
- **ライトニングトーク（LT）準備** - 短時間プレゼンの構成確認
- **朝会での情報共有** - PREP法での効率的な報告
- **プレゼンテーション構成の確認** - 論理的な流れの検証

## ✨ 主な機能

### 📝 編集モード
- PREP（Point/Reason/Example/Summary）の各セクションをMarkdown形式で入力
- 参考リンクURL入力（Exampleスライドで中央表示）
- **自動保存**（1秒デバウンス）
- **Export/Import機能**（JSON形式）

### 🎬 再生モード
- **高精度60秒タイマー**（performance.now()使用）
- スライドの自動切り替え + 手動ナビゲーション
- **キーボードショートカット対応**
- リアルタイム進捗バー
- 参考リンクのiframeプレビュー（フォールバック機能付き）

## ⌨️ キーボードショートカット
| キー | 機能 |
|------|------|
| `Space` | タイマー開始/一時停止 |
| `←` | 前のスライド |
| `→` | 次のスライド |
| `Esc` | 編集モードへ戻る |
| `Home` | 最初のスライド |
| `End` | 最後のスライド |

## 🗂 ディレクトリ構成

project-root/
├── .github/
│ └── copilot.md # Copilot 向け指示
├── public/
│ └── index.html
├── src/
│ ├── components/
│ │ ├── PrepForm.jsx # PREP＋リンク入力フォーム
│ │ ├── MarkdownSlide.jsx # Markdown→HTML＋アニメーション
│ │ ├── LinkPreview.jsx # iframe プレビュー
│ │ └── SlideShow.jsx # タイマー制御＋スライド切替
│ ├── hooks/
│ │ ├── useLocalStorage.js # localStorage 同期フック
│ │ └── useTimer.js # 経過秒数カウントフック
│ ├── App.jsx
│ ├── index.css # Tailwind v4 一行インポート
│ └── index.jsx
├── .gitignore
├── package.json
└── README.md

shell
コピーする
編集する

## 🚀 セットアップ

```bash
# 依存ライブラリのインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build
⚙️ 主な機能
編集モード

PREP（Point/Reason/Example/Summary）のテキストと参考リンクを Markdown で入力

ローカル保存／読み込み

再生モード

1分（60秒）で自動スライド再生

右上に経過秒数をカウント表示

各スライドに Markdown → HTML（太字や箇条書き）＆アニメーション表示

埋め込み可能なリンクを iframe でプレビュー

📖 使い方
テキストとリンクを編集モードで入力

「再生へ」ボタンをクリック

1分間のスライドショーをお楽しみください