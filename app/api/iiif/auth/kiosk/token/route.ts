import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const messageId = request.nextUrl.searchParams.get('messageId');
  const origin = request.nextUrl.searchParams.get('origin');
  const kioskToken = request.nextUrl.searchParams.get('kioskToken');
  
  if (!kioskToken || !messageId || !origin) {
    return new NextResponse('Missing parameters', { status: 400 });
  }
  
  // In a real implementation, you might want to:
  // 1. Store the kiosk token in a session or temporary storage
  // 2. Set an expiration time
  // 3. Track usage
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Kiosk Access Granted</title>
  <script>
    // Send the kiosk token back to the opener
    if (window.opener) {
      window.opener.postMessage({
        messageId: '${messageId}',
        accessToken: '${kioskToken}',
        expiresIn: 3600 // 1 hour in seconds
      }, '${origin}');
    }
    
    // Close the window
    setTimeout(() => {
      window.close();
    }, 100);
  </script>
</head>
<body>
  <p>Access granted. This window will close automatically...</p>
</body>
</html>
  `;
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  });
}