# AI食事コーチアプリ

健康的な食事習慣をサポートするAIパワードのミールトラッキングアプリケーション。

## 機能

- 食事記録の追加と管理
- 栄養素の自動計算（カロリー、タンパク質、脂質、炭水化物）
- 過去の食事記録の閲覧
- 栄養バランスの視覚化
- ユーザープロファイル管理
- 目標設定と進捗追跡
- AIによる栄養アドバイス

## 技術スタック

- Next.js
- React
- TypeScript
- Tailwind CSS
- MongoDB
- OpenAI API

## セットアップ手順

1. リポジトリをクローン
```
git clone https://github.com/yourusername/ai-meal-coach.git
cd ai-meal-coach
```

2. 依存パッケージのインストール
```
npm install
```

3. 環境変数の設定
`.env.example` ファイルを `.env` にコピーして、必要な環境変数を設定します。
```
cp .env.example .env
```

4. OpenAI APIキーの設定
[OpenAI Platform](https://platform.openai.com/) からAPIキーを取得し、`.env` ファイルに以下の変数を設定します。
```
OPENAI_API_KEY=your_api_key_here
```

5. MongoDBのセットアップ
- MongoDBをローカルにインストールするか、MongoDB Atlasでクラウドホスティングを設定
- データベース接続文字列を`.env`ファイルに設定

6. 開発サーバーの起動
```
npm run dev
```

7. ブラウザで http://localhost:3000 にアクセス

## AIによる栄養アドバイス機能

このアプリケーションはOpenAI APIを使用して、ユーザーの食事記録を分析し、栄養バランスに関するアドバイスを提供します。この機能を使用するには：

1. 食事記録を追加
2. ナビゲーションメニューから「分析」を選択
3. 分析タイプ（日次または週間）を選択
4. 「分析を開始」ボタンをクリック

分析結果には、栄養バランスの評価、改善点、および具体的なアドバイスが含まれます。

## ライセンス

MIT

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
