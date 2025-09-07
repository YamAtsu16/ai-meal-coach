# Vercel デプロイメント手順

[← 設計書トップに戻る](../README.md)

## 1. 概要

このドキュメントでは、AI食事コーチアプリケーションをVercelで無料デプロイする手順を説明します。

### 1.1 前提条件
- GitHubアカウント（リポジトリ管理用）
- 外部サービスのAPIキー取得
- MongoDB Atlas（無料プラン）の設定

### 1.2 Vercel無料プランの制限
- **帯域幅**: 100GB/月
- **関数実行時間**: 10秒
- **関数実行回数**: 100GB-hours/月
- **ビルド時間**: 6,000分/月
- **チーム人数**: 1人

## 2. 事前準備

### 2.1 GitHubリポジトリの準備

#### 2.1.1 リポジトリの作成・プッシュ
```bash
# GitHubでリポジトリを作成後
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-meal-coach.git
git push -u origin main
```

#### 2.1.2 必要なファイルの確認
- ✅ `package.json` - 依存関係とスクリプト
- ✅ `next.config.ts` - Next.js設定
- ✅ `.gitignore` - 環境変数ファイルの除外
- ❌ `.env.example` - 環境変数テンプレート（作成推奨）

### 2.2 環境変数テンプレートの作成

`.env.example` ファイルを作成：
```bash
# データベース
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/ai-meal-coach?retryWrites=true&w=majority

# 認証
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=https://your-app-name.vercel.app

# 外部API
OPENAI_API_KEY=your-openai-api-key
EDAMAM_APP_ID=your-edamam-app-id
EDAMAM_APP_KEY=your-edamam-app-key
DEEPL_API_KEY=your-deepl-api-key
```

## 3. 外部サービスの準備

### 3.1 MongoDB Atlas（データベース）

#### 3.1.1 アカウント作成・クラスター設定
1. [MongoDB Atlas](https://www.mongodb.com/atlas) にアクセス
2. 無料アカウントを作成
3. 新しいクラスターを作成（M0 Sandbox - 無料）
4. データベースユーザーを作成
5. ネットワークアクセス設定（0.0.0.0/0 を許可）

#### 3.1.2 接続文字列の取得
```
mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority
```

### 3.2 OpenAI API

#### 3.2.1 APIキーの取得
1. [OpenAI Platform](https://platform.openai.com/) にアクセス
2. アカウント作成・ログイン
3. API Keys セクションでキーを生成
4. **重要**: GPT-4o-miniは無料枠で利用可能

#### 3.2.2 使用量制限の設定
- 月額制限を設定（例：$5）
- 使用量アラートの設定

### 3.3 Edamam Food Database API

#### 3.3.1 アカウント作成・APIキー取得
1. [Edamam Developer](https://developer.edamam.com/) にアクセス
2. 無料アカウントを作成
3. Food Database API を選択
4. Application ID と API Key を取得

#### 3.3.2 無料プランの制限
- **リクエスト数**: 1,000回/月
- **レート制限**: 10回/分

### 3.4 DeepL API（オプション）

#### 3.4.1 APIキー取得
1. [DeepL API](https://www.deepl.com/pro-api) にアクセス
2. 無料アカウントを作成
3. API キーを取得

#### 3.4.2 無料プランの制限
- **翻訳量**: 500,000文字/月

## 4. Vercelデプロイ手順

### 4.1 Vercelアカウント作成

#### 4.1.1 アカウント作成
1. [Vercel](https://vercel.com/) にアクセス
2. "Start Deploying" をクリック
3. GitHubアカウントでサインアップ

#### 4.1.2 GitHubとの連携
- Vercelが自動的にGitHubリポジトリにアクセス権を要求
- 必要な権限を許可

### 4.2 プロジェクトのインポート

#### 4.2.1 新しいプロジェクトの作成
1. Vercel ダッシュボードで "New Project" をクリック
2. GitHubリポジトリ一覧から `ai-meal-coach` を選択
3. "Import" をクリック

#### 4.2.2 プロジェクト設定
```
Project Name: ai-meal-coach
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 4.3 環境変数の設定

#### 4.3.1 環境変数の追加
Vercel ダッシュボード → Settings → Environment Variables

| 変数名 | 値 | 環境 |
|--------|----|----|
| `DATABASE_URL` | MongoDB Atlas接続文字列 | Production, Preview, Development |
| `NEXTAUTH_SECRET` | ランダムな秘密鍵 | Production, Preview, Development |
| `NEXTAUTH_URL` | https://your-app.vercel.app | Production |
| `NEXTAUTH_URL` | https://your-app-git-branch.vercel.app | Preview |
| `NEXTAUTH_URL` | http://localhost:3000 | Development |
| `OPENAI_API_KEY` | OpenAI APIキー | Production, Preview, Development |
| `EDAMAM_APP_ID` | Edamam Application ID | Production, Preview, Development |
| `EDAMAM_APP_KEY` | Edamam API Key | Production, Preview, Development |
| `DEEPL_API_KEY` | DeepL API Key | Production, Preview, Development |

#### 4.3.2 NEXTAUTH_SECRETの生成
```bash
# ランダムな秘密鍵を生成
openssl rand -base64 32
```

または、オンラインジェネレーターを使用：
- [Generate Secret](https://generate-secret.vercel.app/32)

### 4.4 デプロイの実行

#### 4.4.1 初回デプロイ
1. 環境変数設定後、"Deploy" ボタンをクリック
2. ビルドプロセスの完了を待機（通常2-5分）
3. デプロイ完了後、URLが生成される

#### 4.4.2 デプロイ状況の確認
- Vercel ダッシュボードでビルドログを確認
- エラーがある場合は、ログを確認して修正

## 5. デプロイ後の設定

### 5.1 カスタムドメイン（オプション）

#### 5.1.1 ドメインの追加
1. Vercel ダッシュボード → Settings → Domains
2. カスタムドメインを追加
3. DNS設定を更新

### 5.2 セキュリティ設定

#### 5.2.1 HTTPS強制
- Vercelは自動的にHTTPSを有効化
- HTTP → HTTPS リダイレクトも自動設定

#### 5.2.2 セキュリティヘッダー
`next.config.ts` に追加：
```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

## 6. 動作確認

### 6.1 基本機能のテスト

#### 6.1.1 認証機能
- [ ] ユーザー登録が正常に動作する
- [ ] ログイン・ログアウトが正常に動作する
- [ ] 認証状態が正しく管理される

#### 6.1.2 データベース接続
- [ ] MongoDB Atlasへの接続が成功する
- [ ] データの読み書きが正常に動作する

#### 6.1.3 外部API連携
- [ ] OpenAI APIが正常に動作する
- [ ] Edamam APIが正常に動作する
- [ ] DeepL APIが正常に動作する（使用している場合）

### 6.2 パフォーマンステスト

#### 6.2.1 ページ読み込み速度
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) でスコア確認
- 目標: Performance Score 90以上

#### 6.2.2 API応答時間
- ブラウザの開発者ツールでAPI応答時間を確認
- 目標: 500ms以下

## 7. 継続的デプロイメント

### 7.1 自動デプロイ設定

#### 7.1.1 ブランチ設定
- `main` ブランチ → Production環境
- `develop` ブランチ → Preview環境
- Pull Request → Preview環境

#### 7.1.2 デプロイフック
```bash
# 手動デプロイトリガー
curl -X POST "https://api.vercel.com/v1/integrations/deploy/YOUR_HOOK_ID"
```

### 7.2 環境別設定

#### 7.2.1 Preview環境
- Pull Requestごとに一意のURLが生成
- 本番環境と同じ設定でテスト可能

#### 7.2.2 Development環境
- ローカル開発環境の設定
- `vercel dev` コマンドで本番環境と同じ条件でテスト

## 8. 監視・メンテナンス

### 8.1 ログ監視

#### 8.1.1 Vercel Analytics
- リアルタイムのアクセス解析
- パフォーマンス監視

#### 8.1.2 エラー監視
- Vercel ダッシュボードでエラーログを確認
- 必要に応じてSentryなどの外部サービス導入

### 8.2 使用量監視

#### 8.2.1 Vercel使用量
- 関数実行時間
- 帯域幅使用量
- ビルド時間

#### 8.2.2 外部API使用量
- OpenAI API使用量
- Edamam API使用量
- MongoDB Atlas使用量

## 9. トラブルシューティング

### 9.1 よくあるエラー

#### 9.1.1 ビルドエラー
```bash
# TypeScriptエラー
Error: Type check failed

# 解決方法
npm run lint
npm run build # ローカルでビルド確認
```

#### 9.1.2 環境変数エラー
```bash
# 環境変数未設定エラー
Error: Environment variable DATABASE_URL is not defined

# 解決方法
# Vercel ダッシュボードで環境変数を確認・設定
```

#### 9.1.3 データベース接続エラー
```bash
# MongoDB接続エラー
MongoServerError: bad auth

# 解決方法
# 1. MongoDB Atlasのユーザー名・パスワード確認
# 2. ネットワークアクセス設定確認
# 3. 接続文字列の形式確認
```

### 9.2 パフォーマンス問題

#### 9.2.1 関数タイムアウト
```bash
# 10秒制限エラー
Error: Function execution timed out

# 解決方法
# 1. 処理の最適化
# 2. 外部API呼び出しの最適化
# 3. データベースクエリの最適化
```

#### 9.2.2 コールドスタート対策
- 関数の軽量化
- 必要最小限のインポート
- 接続プールの活用

## 10. セキュリティ考慮事項

### 10.1 環境変数の管理
- 本番環境の環境変数は絶対に公開しない
- 開発環境とは異なる値を使用
- 定期的なキーローテーション

### 10.2 API制限
- レート制限の実装
- 不正アクセスの監視
- CORS設定の適切な管理

## 11. コスト管理

### 11.1 無料枠の監視
- Vercel使用量の定期確認
- 外部API使用量の監視
- アラート設定の活用

### 11.2 最適化施策
- 不要なAPI呼び出しの削減
- 画像最適化
- キャッシュ戦略の実装

---

## 関連ドキュメント

- [システムアーキテクチャ](../overview/system-architecture.md) - 技術構成の詳細
- [API設計](../technical/api-design.md) - API仕様
- [セキュリティ設計](../technical/security-design.md) - セキュリティ対策

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

**最終更新**: 2025年9月  
**作成者**: AI Assistant
