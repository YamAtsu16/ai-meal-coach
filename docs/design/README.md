# AI食事コーチアプリケーション 設計書

## 概要

AI食事コーチは、日々の食事記録から栄養バランスを分析し、AIを活用してパーソナライズされた栄養アドバイスを提供するWebアプリケーションです。

この設計書は、システムの全体像から詳細な技術仕様まで、開発に必要な全ての情報を体系的に整理しています。

## 設計書の構成

### 📋 概要・アーキテクチャ
- [**システム概要**](./overview/system-overview.md) - アプリケーションの概要、主要機能、対象ユーザー
- [**システムアーキテクチャ**](./overview/system-architecture.md) - 技術スタック、アーキテクチャ構成

### 🚀 機能設計
- [**認証機能**](./features/authentication.md) - ユーザー認証・認可システム
- [**プロフィール管理**](./features/profile-management.md) - ユーザープロフィール・目標設定
- [**食事記録管理**](./features/meal-management.md) - 食事記録のCRUD操作
- [**食品検索機能**](./features/food-search.md) - 外部API連携による食品検索
- [**栄養分析・AI機能**](./features/nutrition-analysis.md) - OpenAI APIによる栄養分析
- [**データ可視化**](./features/data-visualization.md) - チャート・グラフによるデータ表示

### 🔧 技術設計
- [**データベース設計**](./technical/database-design.md) - MongoDB コレクション設計
- [**API設計**](./technical/api-design.md) - RESTful API仕様
- [**セキュリティ設計**](./technical/security-design.md) - 認証・認可・データ保護
- [**パフォーマンス設計**](./technical/performance-design.md) - 最適化戦略

### 🛠️ 運用・保守
- [**エラーハンドリング**](./operations/error-handling.md) - エラー処理・例外処理
- [**テスト設計**](./operations/testing-design.md) - テスト戦略・品質保証
- [**デプロイメント**](./operations/deployment.md) - 環境構成・デプロイ手順
- [**運用・保守**](./operations/maintenance.md) - 監視・ログ・バックアップ
- [**拡張計画**](./operations/expansion-plan.md) - 今後の機能拡張・技術改善

## クイックスタート

### 開発者向け
1. [システム概要](./overview/system-overview.md)でアプリケーションの全体像を把握
2. [システムアーキテクチャ](./overview/system-architecture.md)で技術スタックを確認
3. [API設計](./technical/api-design.md)でエンドポイント仕様を参照
4. [データベース設計](./technical/database-design.md)でデータ構造を理解

### 新規参加者向け
1. [システム概要](./overview/system-overview.md) - まずはここから
2. [機能設計](./features/) - 各機能の詳細を順次確認
3. [テスト設計](./operations/testing-design.md) - 品質保証の方針を理解

## 技術仕様サマリー

| 項目 | 技術・仕様 |
|------|-----------|
| **フロントエンド** | Next.js 15.2.3, React 19.0.0, TypeScript, Tailwind CSS |
| **バックエンド** | Next.js API Routes, NextAuth.js, MongoDB |
| **AI・外部API** | OpenAI GPT-4o-mini, Edamam Food Database API, DeepL API |
| **認証** | JWT認証, bcryptjs パスワードハッシュ化 |
| **テスト** | Jest, Testing Library（35個のテストファイル） |
| **データベース** | MongoDB（users, profiles, meals コレクション） |

## 文書管理

- **バージョン**: 1.0
- **作成日**: 2024年1月
- **最終更新日**: 2024年1月
- **作成者**: AI Assistant

## 関連ドキュメント

- [テスト項目表](../test/test-matrix.md) - 全テストケースの詳細
- [README.md](../../README.md) - プロジェクト概要・開発環境構築

---

💡 **ヒント**: 各設計書は独立して読めるよう構成されていますが、相互参照リンクを活用してより深い理解を得ることができます。
