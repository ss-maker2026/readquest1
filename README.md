# 読書ログ

読み終えた本を記録するシンプルな読書ログアプリ（Next.js App Router + TypeScript + Tailwind CSS）。

## 機能

- 記録の追加（タイトル・著者・読了日・入手方法・媒体・感想・シェア有無・永久保存の有無）
- 記録の一覧表示（読了日が新しい順）
- 記録の削除

データはブラウザの `localStorage` に保存されます（バックエンド不要）。

## セットアップ

```bash
npm install
npm run dev
```

http://localhost:3000 を開いて確認できます。

## Vercelへのデプロイ

1. GitHubなどにこのリポジトリをpush
2. [Vercel](https://vercel.com) で「Add New Project」からリポジトリをインポート
3. Framework Preset は `Next.js` が自動検出されるのでそのままデプロイ
