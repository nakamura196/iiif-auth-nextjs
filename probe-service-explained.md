# Probe Service のレスポンス詳解

## Probe Service の役割

Probe Service (`AuthProbeService2`) は、クライアントが保護されたリソースにアクセスする前に認証状態を確認するためのエンドポイントです。認証状態に応じて異なる情報を返します。

## レスポンスパターン

### 1. 認証成功時（OK の場合）

**条件**: 有効なアクセストークンを持っている

**レスポンス例**:
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

**返される情報**:
- `status: 200` - アクセス可能
- `location` - アクセス可能なリソースの情報
  - `id` - リソースのURL
  - `type` - リソースのタイプ（Image, Manifest など）

### 2. 認証失敗時（NG の場合）

**条件**: アクセストークンがない、または無効

**レスポンス例**:
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
    "label": "Login to access this resource",
    "service": [{
      "@context": "http://iiif.io/api/auth/2/context.json",
      "id": "https://example.org/auth/token",
      "type": "AuthAccessTokenService2"
    }]
  }]
}
```

**返される情報**:
- `status: 401` - 認証が必要
- `service` - 利用可能な認証サービス
  - **Access Service** の情報
    - `id` - Access Service のURL
    - `type` - "AuthAccessService2"
    - `profile` - 認証方式（active/kiosk/external）
    - `label` - ユーザーに表示するラベル
  - **Token Service** の情報（Access Service の子要素として）
    - `id` - Token Service のURL
    - `type` - "AuthAccessTokenService2"

## 実装例での動作

### コード実装（probe/route.ts）

```typescript
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      // ✅ 認証OK - リソース情報を返す
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
  
  // ❌ 認証NG - Access/Token Service の情報を返す
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

## クライアント側での処理フロー

### 1. Probe Service へのリクエスト

```javascript
const probeResponse = await fetch(probeService.id, {
  headers: token ? { 'Authorization': `Bearer ${token}` } : {}
});
const probeResult = await probeResponse.json();
```

### 2. レスポンスに基づく処理

```javascript
if (probeResult.status === 200) {
  // ✅ 認証OK - リソースに直接アクセス
  const resourceUrl = probeResult.location.id;
  const resource = await fetch(resourceUrl, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
} else if (probeResult.status === 401) {
  // ❌ 認証NG - 認証フローを開始
  const authService = probeResult.service[0];
  const tokenService = authService.service[0];
  
  // Token Service 経由で認証ウィンドウを開く
  const tokenUrl = new URL(tokenService.id);
  tokenUrl.searchParams.set('messageId', messageId);
  tokenUrl.searchParams.set('origin', window.location.origin);
  
  window.open(tokenUrl.toString(), 'auth', 'width=600,height=600');
}
```

## Probe Service の利点

### 1. 効率的な認証確認
- リソースにアクセスする前に認証状態を確認
- 不要な401エラーを回避

### 2. 認証方法の発見
- 利用可能な認証サービスを動的に発見
- 複数の認証方法がある場合の選択肢を提供

### 3. 段階的な情報開示
- 認証済み：アクセス可能なリソース情報
- 未認証：認証に必要なサービス情報

## まとめ

Probe Service は認証状態に応じて適切な情報を返します：

- **認証OK** → `location` でリソース情報を提供
- **認証NG** → `service` で Access Service と Token Service の情報を提供

これにより、クライアントは現在の状態に応じて適切な次のアクションを決定できます。