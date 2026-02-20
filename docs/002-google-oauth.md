# 002 — Google OAuth 設定

**Phase**: 1
**状態**: []
**依存**: 001（Supabase プロジェクト作成済みであること）

## 概要
Google Cloud Console で OAuth クライアントを作成し、Supabase Auth と連携する。
コードの変更は不要で、外部サービスの設定作業が中心となるチケット。

---

## TODO

### Google Cloud Console 設定
- [ ] [console.cloud.google.com](https://console.cloud.google.com) でプロジェクトを作成（または既存を選択）
- [ ] 「APIとサービス」→「OAuth 同意画面」を設定
  - ユーザータイプ: 外部
  - アプリ名・サポートメールを入力
  - スコープ: `email`, `profile`, `openid` を追加
- [ ] 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuth 2.0 クライアント ID」
  - アプリケーションの種類: ウェブアプリケーション
  - 承認済みリダイレクト URI に以下を追加:
    ```
    https://<your-project-ref>.supabase.co/auth/v1/callback
    ```
- [ ] クライアント ID とクライアントシークレットをメモ

### Supabase ダッシュボード設定
- [ ] Supabase ダッシュボード →「Authentication」→「Providers」→「Google」を有効化
- [ ] Google の クライアント ID とクライアントシークレットを入力して保存
- [ ] Supabase に表示される Callback URL を Google Cloud Console の承認済みリダイレクト URI に追加（未追加の場合）

### ローカル開発用設定
- [ ] Supabase ダッシュボード →「Authentication」→「URL Configuration」で以下を設定
  - Site URL: `http://localhost:3000`
  - Redirect URLs に `http://localhost:3000/auth/callback` を追加

---

## 完了条件
- Supabase ダッシュボードの Google Provider が「Enabled」になっている
- ローカルで Googleログインボタンを押すと Google の認証画面に遷移する（実装は 003 で行う）
