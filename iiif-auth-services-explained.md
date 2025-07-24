# IIIF Authentication API 2.0 サービスの詳解

## 概要

IIIF Authentication API 2.0 では3つの主要なサービスが定義されていますが、すべてが必須というわけではありません。本記事では、各サービスの役割と必要性、実装パターンについて詳しく解説します。

## 3つのサービスの概要

### 1. Probe Service (AuthProbeService2)
- **エンドポイント例**: `/api/iiif/probe`
- **役割**: 認証状態の確認
- **必須**: いいえ（推奨）

### 2. Access Service (AuthAccessService2)
- **エンドポイント例**: `/api/iiif/access`
- **役割**: 認証処理（ログイン）
- **必須**: はい

### 3. Token Service (AuthAccessTokenService2)
- **エンドポイント例**: `/api/iiif/token`
- **役割**: トークンの配信
- **必須**: プロファイルによる

## 各サービスの詳細

### 1. Probe Service (AuthProbeService2)

#### 目的
- クライアントが保護されたリソースにアクセスする前に、認証状態を確認する
- 利用可能な認証方法を発見する
- 不要な認証フローを避ける

#### リクエスト/レスポンス例

**リクエスト:**
```http
GET /api/iiif/probe HTTP/1.1
Authorization: Bearer [token]
```

**レスポンス（未認証）:**
```json
{
  "@context": "http://iiif.io/api/auth/2/context.json",
  "type": "AuthProbeResult2",
  "status": 401,
  "service": [{
    "@context": "http://iiif.io/api/auth/2/context.json",
    "id": "https://example.org/auth/access",
    "type": "AuthAccessService2",
    "profile": "active",
    "label": "Login required",
    "service": [{
      "@context": "http://iiif.io/api/auth/2/context.json",
      "id": "https://example.org/auth/token",
      "type": "AuthAccessTokenService2"
    }]
  }]
}
```

**レスポンス（認証済み）:**
```json
{
  "@context": "http://iiif.io/api/auth/2/context.json",
  "type": "AuthProbeResult2",
  "status": 200,
  "location": {
    "id": "https://example.org/iiif/image/sample/info.json",
    "type": "Image"
  }
}
```

#### なぜ必須ではないのか？
- クライアントは401エラーレスポンスから直接Access Serviceの情報を取得できる
- ただし、Probe Serviceがあると、より効率的な認証フローが実現できる

### 2. Access Service (AuthAccessService2)

#### 目的
- ユーザーの認証情報を受け取り、検証する
- 成功時にアクセストークンを発行する
- 認証UIを提供する（またはそのエンドポイントを示す）

#### プロファイル

**1. Active プロファイル**
```json
{
  "type": "AuthAccessService2",
  "profile": "active",
  "label": "Login with username and password"
}
```
- ユーザー操作が必要（ログインフォームなど）
- Token Service が必須

**2. Kiosk プロファイル**
```json
{
  "type": "AuthAccessService2",
  "profile": "kiosk",
  "label": "Click to access"
}
```
- ユーザー操作は最小限（クリックのみ）
- Token Service は不要

**3. External プロファイル**
```json
{
  "type": "AuthAccessService2",
  "profile": "external",
  "label": "Login with institutional credentials"
}
```
- 外部の認証システムを使用
- Token Service の必要性は実装による

#### 実装例

```typescript
// POST /api/iiif/access
export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  
  if (validateCredentials(username, password)) {
    const token = await createToken(username);
    return NextResponse.json({
      accessToken: token,
      expiresIn: 3600
    });
  }
  
  return new NextResponse('Unauthorized', { status: 401 });
}
```

### 3. Token Service (AuthAccessTokenService2)

#### 目的
- ブラウザウィンドウ間でトークンを安全に受け渡す
- postMessage APIを使用したクロスオリジン通信
- ポップアップウィンドウから親ウィンドウへのトークン配信

#### 動作フロー

1. **クライアントがToken Service URLを構築**
```javascript
const tokenUrl = new URL(tokenService.id);
tokenUrl.searchParams.set('messageId', crypto.randomUUID());
tokenUrl.searchParams.set('origin', window.location.origin);
```

2. **ポップアップウィンドウを開く**
```javascript
const authWindow = window.open(tokenUrl.toString(), 'auth', 'width=600,height=600');
```

3. **Token Serviceの処理**
```typescript
// GET /api/iiif/token
export async function GET(request: NextRequest) {
  const messageId = request.nextUrl.searchParams.get('messageId');
  const origin = request.nextUrl.searchParams.get('origin');
  const accessToken = request.nextUrl.searchParams.get('accessToken');
  
  if (accessToken && await verifyToken(accessToken)) {
    // postMessageでトークンを返すHTMLを生成
    const html = `
      <script>
        window.opener.postMessage({
          messageId: "${messageId}",
          accessToken: "${accessToken}",
          expiresIn: 3600
        }, "${origin}");
        window.close();
      </script>
    `;
    return new NextResponse(html, { 
      headers: { 'Content-Type': 'text/html' } 
    });
  }
  
  // 認証ページへリダイレクト
  return NextResponse.redirect(`/auth?messageId=${messageId}&origin=${origin}`);
}
```

## 実装パターン

### パターン1: フル実装（推奨）

```
Client → Image Request → 401 with Probe Service
  ↓
Client → Probe Service → Auth required with Access Service
  ↓
Client → Token Service → Redirect to Login
  ↓
Client → Access Service → Get Token
  ↓
Token Service → postMessage → Client
  ↓
Client → Image Request with Token → Success
```

**メリット:**
- 完全なIIIF Auth 2.0準拠
- 認証状態の事前確認が可能
- 複数の認証方法に対応可能
- 最適なユーザー体験

**実装構成:**
```
/api/iiif/probe     - Probe Service
/api/iiif/access    - Access Service  
/api/iiif/token     - Token Service
```

### パターン2: 最小実装（Active）

```
Client → Image Request → 401 with Access Service
  ↓
Client → Token Service → Redirect to Login
  ↓
Client → Access Service → Get Token
  ↓
Token Service → postMessage → Client
  ↓
Client → Image Request with Token → Success
```

**メリット:**
- シンプルな実装
- Probe Serviceの実装が不要

**デメリット:**
- 認証状態の事前確認ができない
- 常に401エラーから開始

**実装構成:**
```
/api/iiif/access    - Access Service
/api/iiif/token     - Token Service
```

### パターン3: Kioskモード

```
Client → Image Request → 401 with Access Service
  ↓
Client → Access Service (kiosk) → Get Token
  ↓
Client → Image Request with Token → Success
```

**メリット:**
- 最もシンプル
- Token Serviceが不要
- ユーザー操作が最小限

**デメリット:**
- セキュリティレベルが低い
- パスワード保護なし

**実装構成:**
```
/api/iiif/access    - Access Service (kiosk profile)
```

## 選択の指針

### フル実装を選ぶべき場合
- 本格的なデジタルアーカイブシステム
- 複数の認証方法をサポートする必要がある
- 最適なユーザー体験を提供したい
- 将来の拡張性を確保したい

### 最小実装を選ぶべき場合
- プロトタイプや概念実証
- シンプルな認証で十分
- 開発リソースが限られている

### Kioskモードを選ぶべき場合
- 公開端末での利用
- 認証は必要だがパスワードは不要
- 最もシンプルな実装が求められる

## セキュリティ考慮事項

### 1. Token Service使用時
- postMessageの送信先originを必ず検証
- メッセージIDで通信を識別
- HTTPSの使用を強制

### 2. Probe Service使用時
- 認証状態の情報漏洩に注意
- 必要最小限の情報のみ返す

### 3. Access Service使用時
- ブルートフォース攻撃対策
- レート制限の実装
- セキュアなトークン生成

## まとめ

IIIF Authentication API 2.0における3つのサービスの関係：

1. **Access Service**: 必須 - 認証の中核
2. **Token Service**: Active profileでは必須 - 安全なトークン配信
3. **Probe Service**: 推奨 - より良いユーザー体験

実装する際は、システムの要件とユーザー体験のバランスを考慮して、適切なパターンを選択することが重要です。完全な実装により、セキュアで使いやすい認証システムを構築できます。