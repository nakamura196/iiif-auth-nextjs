# IIIF Authentication API 2.0 の技術的詳解：リクエストフローの完全ガイド

## 概要

本記事では、IIIF Authentication API 2.0 の認証フローを、実際のHTTPリクエスト/レスポンスのレベルで詳細に解説します。各ステップでどのようなリクエストが送信され、どのようなレスポンスが返されるのかを追跡していきます。

## アーキテクチャ概要

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│ IIIF Server │────▶│Auth Service │
│  (Browser)  │◀────│             │◀────│             │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 認証フローの詳細

### Step 1: 初回の画像情報リクエスト（未認証）

**リクエスト:**
```http
GET /api/iiif/image/sample/info.json HTTP/1.1
Host: localhost:3001
Accept: application/json
```

**処理フロー（サーバー側）:**
```typescript
// app/api/iiif/image/[id]/info.json/route.ts
export async function GET(request: NextRequest) {
  // 1. Authorizationヘッダーを確認
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');
  
  // 2. クエリパラメータもチェック（フォールバック）
  if (!token) {
    token = request.nextUrl.searchParams.get('token') || '';
  }
  
  // 3. トークンの検証
  const isValid = token ? await verifyToken(token) : null;
  
  // 4. 未認証の場合は401を返す
  if (!isValid) {
    return NextResponse.json({
      error: 'Authentication required',
      service: [{
        "@context": "http://iiif.io/api/auth/2/context.json",
        "id": `${request.nextUrl.origin}/api/iiif/probe`,
        "type": "AuthProbeService2"
      }]
    }, { status: 401 });
  }
}
```

**レスポンス:**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json
Access-Control-Allow-Origin: *

{
  "error": "Authentication required",
  "service": [{
    "@context": "http://iiif.io/api/auth/2/context.json",
    "id": "http://localhost:3001/api/iiif/probe",
    "type": "AuthProbeService2"
  }]
}
```

### Step 2: Probe Service へのリクエスト

クライアントは401レスポンスから`AuthProbeService2`のURLを取得し、認証状態を確認します。

**リクエスト:**
```http
GET /api/iiif/probe HTTP/1.1
Host: localhost:3001
Accept: application/json
```

**処理フロー（サーバー側）:**
```typescript
// app/api/iiif/probe/route.ts
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      // 認証済みの場合
      return NextResponse.json({
        "@context": "http://iiif.io/api/auth/2/context.json",
        "type": "AuthProbeResult2",
        "status": 200,
        "location": {
          "id": `${request.nextUrl.origin}/api/iiif/image/sample/info.json`,
          "type": "Image"
        }
      });
    }
  }
  
  // 未認証の場合
  return NextResponse.json({
    "@context": "http://iiif.io/api/auth/2/context.json",
    "type": "AuthProbeResult2", 
    "status": 401,
    "service": [{
      "@context": "http://iiif.io/api/auth/2/context.json",
      "id": `${request.nextUrl.origin}/api/iiif/access`,
      "type": "AuthAccessService2",
      "profile": "active",
      "label": "Login to IIIF Auth Demo",
      "service": [{
        "@context": "http://iiif.io/api/auth/2/context.json",
        "id": `${request.nextUrl.origin}/api/iiif/token`,
        "type": "AuthAccessTokenService2"
      }]
    }]
  }, { status: 401 });
}
```

**レスポンス（未認証）:**
```json
{
  "@context": "http://iiif.io/api/auth/2/context.json",
  "type": "AuthProbeResult2",
  "status": 401,
  "service": [{
    "@context": "http://iiif.io/api/auth/2/context.json",
    "id": "http://localhost:3001/api/iiif/access",
    "type": "AuthAccessService2",
    "profile": "active",
    "label": "Login to IIIF Auth Demo",
    "service": [{
      "@context": "http://iiif.io/api/auth/2/context.json",
      "id": "http://localhost:3001/api/iiif/token",
      "type": "AuthAccessTokenService2"
    }]
  }]
}
```

### Step 3: 認証ウィンドウの開始

クライアントはProbe Serviceのレスポンスから`AuthAccessTokenService2`のURLを取得し、ポップアップウィンドウを開きます。

**クライアント側の処理:**
```javascript
// 認証サービス情報の取得
const authService = probeResult.service[0];
const tokenService = authService.service[0];

// メッセージIDの生成（レスポンスの識別用）
const messageId = crypto.randomUUID();

// トークンサービスURLの構築
const tokenUrl = new URL(tokenService.id);
tokenUrl.searchParams.set('messageId', messageId);
tokenUrl.searchParams.set('origin', window.location.origin);

// ポップアップウィンドウを開く
const authWindow = window.open(
  tokenUrl.toString(), 
  'iiif-auth', 
  'width=600,height=600'
);
```

**生成されるURL:**
```
http://localhost:3001/api/iiif/token?messageId=60f4420d-52c1-48ae-a24f-c3bb948fa0dc&origin=http://localhost:3001
```

### Step 4: Token Service のリダイレクト処理

**リクエスト:**
```http
GET /api/iiif/token?messageId=60f4420d-52c1-48ae-a24f-c3bb948fa0dc&origin=http://localhost:3001 HTTP/1.1
Host: localhost:3001
```

**処理フロー（サーバー側）:**
```typescript
// app/api/iiif/token/route.ts
export async function GET(request: NextRequest) {
  const messageId = request.nextUrl.searchParams.get('messageId');
  const origin = request.nextUrl.searchParams.get('origin');
  const accessToken = request.nextUrl.searchParams.get('accessToken');
  
  // 既にトークンがある場合は検証
  if (accessToken) {
    const payload = await verifyToken(accessToken);
    if (payload) {
      // postMessageでトークンを返すHTMLを返す
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
  }
  
  // トークンがない場合はログインページへリダイレクト
  const authUrl = new URL('/auth', request.url);
  authUrl.searchParams.set('origin', origin);
  authUrl.searchParams.set('messageId', messageId);
  
  return NextResponse.redirect(authUrl);
}
```

**レスポンス:**
```http
HTTP/1.1 302 Found
Location: /auth?origin=http://localhost:3001&messageId=60f4420d-52c1-48ae-a24f-c3bb948fa0dc
```

### Step 5: ログインページでの認証

**ログインフォーム送信:**
```http
POST /api/iiif/access HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "username": "user",
  "password": "pass"
}
```

**処理フロー（サーバー側）:**
```typescript
// app/api/iiif/access/route.ts
export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  
  // 認証情報の検証（デモ用の固定値）
  if (username === 'user' && password === 'pass') {
    // JWTトークンの生成
    const token = await createToken(username);
    
    return NextResponse.json({
      accessToken: token,
      expiresIn: 3600
    });
  }
  
  return NextResponse.json(
    { error: 'Invalid credentials' }, 
    { status: 401 }
  );
}
```

**JWT生成の詳細:**
```typescript
// lib/iiif/jwt-auth.ts
export async function createToken(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
    
  return token;
}
```

**レスポンス:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ1c2VyIiwiaWF0IjoxNzA2MDAwMDAwLCJleHAiOjE3MDYwMDM2MDB9.xxxxx",
  "expiresIn": 3600
}
```

### Step 6: トークンの伝達（postMessage）

ログイン成功後、クライアント側でトークンを受け取り、Token Service経由で元のウィンドウに送信します。

**クライアント側（auth/page.tsx）:**
```javascript
// ログイン成功後の処理
localStorage.setItem('iiif_access_token', data.accessToken);
window.dispatchEvent(new Event('auth-changed'));

if (origin && messageId) {
  // IIIFポップアップフロー
  window.opener?.postMessage({
    messageId,
    accessToken: data.accessToken,
    expiresIn: data.expiresIn,
  }, origin);
  
  window.close();
} else {
  // 直接ログインフロー
  window.location.href = '/';
}
```

### Step 7: 元のウィンドウでのトークン受信

**クライアント側（メインウィンドウ）:**
```javascript
// postMessageリスナーの設定
const handleMessage = (event: MessageEvent) => {
  // メッセージIDの検証
  if (event.data.messageId === messageId) {
    // トークンの保存
    localStorage.setItem('iiif_access_token', event.data.accessToken);
    
    // UIの更新通知
    window.dispatchEvent(new Event('auth-changed'));
    
    // ポップアップを閉じる
    authWindow?.close();
    window.removeEventListener('message', handleMessage);
    
    // 画像の再読み込み
    loadProtectedImage();
  }
};

window.addEventListener('message', handleMessage);
```

### Step 8: 認証済みでの画像リクエスト

**リクエスト:**
```http
GET /api/iiif/image/sample/info.json HTTP/1.1
Host: localhost:3001
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ1c2VyIiwiaWF0IjoxNzA2MDAwMDAwLCJleHAiOjE3MDYwMDM2MDB9.xxxxx
Accept: application/json
```

**処理フロー（サーバー側）:**
```typescript
// トークンの検証
const payload = await verifyToken(token);

if (payload) {
  // 認証成功 - 画像情報を返す
  const info = {
    "@context": "http://iiif.io/api/image/3/context.json",
    "id": `${request.nextUrl.origin}/api/iiif/image/${params.id}`,
    "type": "ImageService3",
    "protocol": "http://iiif.io/api/image",
    "profile": "level2",
    "width": 750,
    "height": 1000,
    "service": [{
      "@context": "http://iiif.io/api/auth/2/context.json",
      "id": `${request.nextUrl.origin}/api/iiif/probe`,
      "type": "AuthProbeService2"
    }]
  };
  
  return NextResponse.json(info);
}
```

**レスポンス:**
```json
{
  "@context": "http://iiif.io/api/image/3/context.json",
  "id": "http://localhost:3001/api/iiif/image/sample",
  "type": "ImageService3",
  "protocol": "http://iiif.io/api/image",
  "profile": "level2",
  "width": 750,
  "height": 1000,
  "service": [{
    "@context": "http://iiif.io/api/auth/2/context.json",
    "id": "http://localhost:3001/api/iiif/probe",
    "type": "AuthProbeService2"
  }]
}
```

## トークンの永続化と同期

### localStorage による永続化

```javascript
// トークンの保存
localStorage.setItem('iiif_access_token', token);

// トークンの取得
const token = localStorage.getItem('iiif_access_token');

// トークンの削除
localStorage.removeItem('iiif_access_token');
```

### タブ間の同期

```javascript
// Storage Event（他のタブでの変更を検知）
window.addEventListener('storage', (e) => {
  if (e.key === 'iiif_access_token') {
    // 認証状態の更新
    updateAuthStatus();
  }
});

// Custom Event（同一タブ内での変更通知）
window.addEventListener('auth-changed', () => {
  // 認証状態の更新
  updateAuthStatus();
});
```

## CORS設定

### Image API エンドポイント

```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
}
```

### Probe/Access Service

```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true'
}
```

## エラーハンドリング

### トークン有効期限切れ

```typescript
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    // トークンが無効または期限切れ
    return null;
  }
}
```

### 認証エラーのハンドリング

```javascript
if (response.status === 401) {
  // 認証が必要
  const data = await response.json();
  if (data.service?.[0]) {
    // 認証フローを開始
    handleAuth(data.service[0]);
  }
}
```

## セキュリティ考慮事項

### 1. トークンの署名検証

```typescript
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);
```

### 2. HTTPS の使用（本番環境）

```typescript
// 本番環境ではHTTPSを強制
if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https')) {
  return new Response('HTTPS required', { status: 400 });
}
```

### 3. Origin の検証

```typescript
// postMessageの送信先を制限
window.opener?.postMessage(data, origin); // 特定のoriginのみ
```

## パフォーマンス最適化

### 1. トークンのキャッシング

```typescript
// メモリキャッシュを使用（実装例）
const tokenCache = new Map<string, { payload: JWTPayload; expiry: number }>();

export async function verifyTokenWithCache(token: string): Promise<JWTPayload | null> {
  const cached = tokenCache.get(token);
  if (cached && cached.expiry > Date.now()) {
    return cached.payload;
  }
  
  const payload = await verifyToken(token);
  if (payload) {
    tokenCache.set(token, {
      payload,
      expiry: Date.now() + 60000 // 1分間キャッシュ
    });
  }
  
  return payload;
}
```

### 2. 並列リクエストの処理

```javascript
// 複数の画像を並列で取得
const promises = imageIds.map(id => 
  fetch(`/api/iiif/image/${id}/info.json`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
);

const responses = await Promise.all(promises);
```

## トラブルシューティング

### 1. ポップアップブロッカー

```javascript
// ユーザーアクション内で開く必要がある
button.addEventListener('click', () => {
  const authWindow = window.open(url, 'iiif-auth');
  if (!authWindow) {
    alert('ポップアップがブロックされました');
  }
});
```

### 2. postMessage の受信失敗

```javascript
// タイムアウトの設定
const timeout = setTimeout(() => {
  window.removeEventListener('message', handleMessage);
  alert('認証タイムアウト');
}, 30000); // 30秒

// メッセージ受信時にタイムアウトをクリア
const handleMessage = (event) => {
  clearTimeout(timeout);
  // ...
};
```

## まとめ

IIIF Authentication API 2.0 の実装では、以下の流れでリクエストが処理されます：

1. **初回アクセス** → 401 with Probe Service
2. **Probe Service** → 401 with Access Service  
3. **Token Service** → Login Page redirect
4. **Login** → JWT Token generation
5. **postMessage** → Token delivery to main window
6. **Authenticated Request** → Protected resource access

各ステップで適切なエラーハンドリングとセキュリティ対策を実装することで、安全で使いやすい認証システムを構築できます。

## 参考資料

- [IIIF Authentication API 2.0 Specification](https://iiif.io/api/auth/2.0/)
- [JSON Web Token (JWT) RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)
- [Web Messaging API (postMessage)](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)