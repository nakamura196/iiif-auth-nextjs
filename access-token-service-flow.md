# Access Service と Token Service のアクセス順序

## 正しいアクセス順序

クライアントは **Token Service を最初に呼び出します**。

```
1. Token Service → 2. Access Service（必要な場合）
```

## フローの詳細

### 1. Token Service への最初のアクセス

**クライアント側のコード：**
```javascript
// Probe Service のレスポンスから情報を取得
const authService = probeResult.service[0];     // Access Service
const tokenService = authService.service[0];    // Token Service

// Token Service のURLを構築
const tokenUrl = new URL(tokenService.id);
tokenUrl.searchParams.set('messageId', messageId);
tokenUrl.searchParams.set('origin', window.location.origin);

// ポップアップウィンドウで Token Service を開く
const authWindow = window.open(tokenUrl.toString(), 'auth', 'width=600,height=600');
```

### 2. Token Service の処理

Token Service は以下のいずれかを行います：

#### A. 既に有効なトークンがある場合
```typescript
// token/route.ts
if (accessToken && await verifyToken(accessToken)) {
  // postMessage でトークンを返すHTMLを返す
  return new NextResponse(`
    <script>
      window.opener.postMessage({
        messageId: "${messageId}",
        accessToken: "${accessToken}"
      }, "${origin}");
      window.close();
    </script>
  `, { headers: { 'Content-Type': 'text/html' } });
}
```

#### B. トークンがない/無効な場合
```typescript
// Access Service (ログインページ) へリダイレクト
const authUrl = new URL('/auth', request.url);
authUrl.searchParams.set('origin', origin);
authUrl.searchParams.set('messageId', messageId);

return NextResponse.redirect(authUrl);
```

### 3. Access Service での認証

Token Service からリダイレクトされた場合のみ Access Service にアクセスします：

```typescript
// auth/page.tsx (ログインフォーム)
const handleSubmit = async (e) => {
  // Access Service にPOST
  const response = await fetch('/api/iiif/access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    // トークンを取得して postMessage で送信
    window.opener?.postMessage({
      messageId,
      accessToken: data.accessToken
    }, origin);
    window.close();
  }
};
```

## なぜこの順序なのか？

### 1. セッション継続性
- ユーザーが既にログイン済みの場合、Token Service は即座にトークンを返せる
- 不要な再ログインを防ぐ

### 2. セキュリティ
- Token Service は認証状態の確認のみ
- Access Service は認証情報（パスワード）を扱う
- 段階的なアクセスでセキュリティを確保

### 3. ユーザー体験
- 既にログイン済みなら、ログイン画面を見せずに済む
- シームレスな認証体験を提供

## 実装での具体例

```javascript
// 1. Probe Service → 401 with services
// 2. Token Service を開く
const tokenUrl = new URL(tokenService.id);
tokenUrl.searchParams.set('messageId', messageId);
tokenUrl.searchParams.set('origin', origin);

window.open(tokenUrl.toString(), 'auth');

// 3. Token Service の処理
//    - トークンあり → postMessage で返す
//    - トークンなし → Access Service へリダイレクト

// 4. Access Service（必要な場合のみ）
//    - ログインフォーム表示
//    - 認証成功 → トークン発行 → postMessage
```

## まとめ

1. **常に Token Service が最初**
2. Token Service がトークンの有無を確認
3. トークンがない場合のみ Access Service へリダイレクト
4. Access Service で認証後、Token Service 経由でトークンを配信

この順序により、既存のセッションを活用し、不要な再認証を避けることができます。