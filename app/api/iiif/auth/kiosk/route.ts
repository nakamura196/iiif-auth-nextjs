import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Kiosk auth page - simple HTML with confirmation
  const messageId = request.nextUrl.searchParams.get('messageId');
  const origin = request.nextUrl.searchParams.get('origin');
  
  // Get locale from cookie, query parameter, or Accept-Language header
  const localeCookie = request.cookies.get('locale')?.value;
  const localeParam = request.nextUrl.searchParams.get('locale');
  const acceptLanguage = request.headers.get('accept-language') || '';
  
  // Determine if we should use Japanese
  const locale = localeCookie || localeParam || 
    (acceptLanguage.toLowerCase().includes('ja') ? 'ja' : 'en');
  const isJapanese = locale === 'ja';
  
  // Translations
  const translations = {
    title: isJapanese ? '利用規約' : 'Terms of Use',
    description: isJapanese 
      ? 'このコンテンツは特定の利用規約の下で提供されています。「同意」をクリックすることで、これらの規約を読み、同意したことを確認します。' 
      : 'This content is provided under specific terms and conditions. By clicking "Accept", you acknowledge that you have read and agree to these terms.',
    termsTitle: isJapanese ? 'キオスクアクセス規約：' : 'Kiosk Access Terms:',
    term1: isJapanese 
      ? 'これはIIIF認証API 2.0キオスクパターンのデモンストレーションです' 
      : 'This is a demonstration of IIIF Authentication API 2.0 Kiosk Pattern',
    term2: isJapanese 
      ? 'アクセスは現在のブラウザセッションのみ有効です' 
      : 'Access is granted for this browser session only',
    term3: isJapanese 
      ? 'ログイン認証情報は不要です' 
      : 'No login credentials are required',
    term4: isJapanese 
      ? 'コンテンツはデモンストレーション目的でのみ提供されています' 
      : 'Content is for demonstration purposes only',
    acceptButton: isJapanese ? '同意して続行' : 'Accept and Continue',
    declineButton: isJapanese ? '拒否' : 'Decline'
  };
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Kiosk Access Confirmation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 500px;
      width: 100%;
    }
    h1 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
      color: #333;
    }
    p {
      color: #666;
      line-height: 1.6;
      margin: 1rem 0;
    }
    .terms {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      margin: 1.5rem 0;
      font-size: 0.875rem;
      border: 1px solid #ddd;
    }
    .buttons {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    button {
      flex: 1;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    button:hover {
      opacity: 0.9;
    }
    .accept {
      background: #4CAF50;
      color: white;
    }
    .decline {
      background: #f44336;
      color: white;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${translations.title}</h1>
    <p>${translations.description}</p>
    
    <div class="terms">
      <p><strong>${translations.termsTitle}</strong></p>
      <p>• ${translations.term1}</p>
      <p>• ${translations.term2}</p>
      <p>• ${translations.term3}</p>
      <p>• ${translations.term4}</p>
    </div>
    
    <div class="buttons">
      <button class="accept" onclick="accept()">${translations.acceptButton}</button>
      <button class="decline" onclick="decline()">${translations.declineButton}</button>
    </div>
  </div>
  
  <script>
    const messageId = '${messageId}';
    const origin = '${origin}';
    
    function accept() {
      // Generate kiosk token
      const kioskToken = 'kiosk-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      // Redirect to token endpoint with the kiosk token
      window.location.href = '/api/iiif/auth/kiosk/token?messageId=' + messageId + 
        '&origin=' + encodeURIComponent(origin) + 
        '&kioskToken=' + kioskToken;
    }
    
    function decline() {
      // Send failure message
      if (window.opener && origin) {
        window.opener.postMessage({
          messageId: messageId,
          error: 'User declined terms'
        }, origin);
      }
      window.close();
    }
  </script>
</body>
</html>
  `;
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    }
  });
}