import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { params: string[] } }
) {
  // Check for kiosk token
  const kioskToken = request.nextUrl.searchParams.get('kiosk');
  
  if (!kioskToken || !kioskToken.startsWith('kiosk-confirmed-')) {
    // Return 401 with kiosk auth service
    return NextResponse.json({
      error: 'Kiosk confirmation required',
      service: [{
        "@context": "http://iiif.io/api/auth/2/context.json",
        "id": `${request.nextUrl.origin}/api/iiif/auth/kiosk`,
        "type": "AuthAccessService2",
        "profile": "kiosk",
        "label": { "en": ["Kiosk Authentication Required"] }
      }]
    }, { 
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      }
    });
  }
  
  // Kiosk mode - return the image
  const svg = `
<svg width="750" height="1000" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#e3f2fd;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#bbdefb;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="750" height="1000" fill="url(#bg)"/>
  
  <g transform="translate(375, 300)">
    <rect x="-150" y="-50" width="300" height="100" fill="#2196F3" rx="8"/>
    <text x="0" y="10" font-family="Arial" font-size="24" text-anchor="middle" fill="white" font-weight="bold">
      KIOSK MODE
    </text>
  </g>
  
  <text x="375" y="450" font-family="Arial" font-size="36" text-anchor="middle" fill="#1565C0" font-weight="bold">
    Demo Content
  </text>
  
  <text x="375" y="500" font-family="Arial" font-size="18" text-anchor="middle" fill="#424242">
    This image is available through
  </text>
  <text x="375" y="530" font-family="Arial" font-size="18" text-anchor="middle" fill="#424242">
    IIIF Kiosk Authentication Pattern
  </text>
  
  <g transform="translate(375, 600)">
    <rect x="-200" y="-30" width="400" height="180" fill="white" stroke="#e0e0e0" rx="4"/>
    <text x="0" y="0" font-family="Arial" font-size="16" text-anchor="middle" fill="#757575">
      Access Details:
    </text>
    <text x="0" y="30" font-family="Arial" font-size="14" text-anchor="middle" fill="#616161">
      • No login required
    </text>
    <text x="0" y="55" font-family="Arial" font-size="14" text-anchor="middle" fill="#616161">
      • Terms acceptance only
    </text>
    <text x="0" y="80" font-family="Arial" font-size="14" text-anchor="middle" fill="#616161">
      • Session-based access
    </text>
    <text x="0" y="110" font-family="Arial" font-size="12" text-anchor="middle" fill="#9e9e9e">
      Token: ${kioskToken.substring(0, 25)}...
    </text>
  </g>
  
  <text x="375" y="850" font-family="Arial" font-size="14" text-anchor="middle" fill="#757575">
    IIIF Authentication API 2.0 Demo
  </text>
  <text x="375" y="870" font-family="Arial" font-size="12" text-anchor="middle" fill="#9e9e9e">
    Kiosk Pattern Implementation
  </text>
</svg>`;
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}