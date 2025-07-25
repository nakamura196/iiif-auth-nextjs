import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Clear the authentication by returning a response that tells the client to clear the token
  const origin = request.headers.get('origin') || request.nextUrl.origin;
  
  // Return HTML that clears the token and closes the window
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Logout</title>
    </head>
    <body>
      <script>
        // Clear the access token from localStorage
        localStorage.removeItem('iiif_access_token');
        
        // Notify parent window if this was opened in a popup
        if (window.opener) {
          window.opener.postMessage({
            type: 'logout',
            '@context': 'http://iiif.io/api/auth/2/context.json'
          }, '${origin}');
          
          // Close the popup
          setTimeout(() => {
            window.close();
          }, 100);
        } else {
          // If not in popup, redirect to home
          window.location.href = '/';
        }
      </script>
      <p>Logging out...</p>
    </body>
    </html>
  `;
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  });
}