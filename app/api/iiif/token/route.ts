import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/iiif/jwt-auth';

export async function GET(request: NextRequest) {
  const messageId = request.nextUrl.searchParams.get('messageId');
  const origin = request.nextUrl.searchParams.get('origin');
  const accessToken = request.nextUrl.searchParams.get('accessToken');
  
  if (!messageId || !origin) {
    return new NextResponse('Missing parameters', { status: 400 });
  }
  
  // Validate the token if provided
  if (accessToken) {
    const payload = await verifyToken(accessToken);
    if (payload) {
      // Return HTML that posts message back to the client
      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>IIIF Auth Token</title>
</head>
<body>
  <script>
    window.opener.postMessage({
      messageId: "${messageId}",
      accessToken: "${accessToken}",
      expiresIn: 3600
    }, "${origin}");
    window.close();
  </script>
</body>
</html>`;
      
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }
  }
  
  // If no token or invalid token, redirect to login
  const authUrl = new URL('/auth', request.url);
  authUrl.searchParams.set('origin', origin);
  authUrl.searchParams.set('messageId', messageId);
  
  return NextResponse.redirect(authUrl);
}