import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/iiif/jwt-auth';
import fs from 'fs';
import path from 'path';
import { IIIF_AUTH_TYPES, IIIF_CONTEXTS } from '@/types/iiif-constants';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; params: string[] } }
) {
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');
  
  // Also check for token in query params (for image tags)
  if (!token) {
    token = request.nextUrl.searchParams.get('token') || '';
  }
  
  // Check authentication
  const isValid = token ? await verifyToken(token) : null;
  if (!isValid) {
    return NextResponse.json({
      error: 'Authentication required',
      service: [{
        "@context": IIIF_CONTEXTS.AUTH_2,
        "id": `${request.nextUrl.origin}/api/iiif/probe`,
        "type": IIIF_AUTH_TYPES.PROBE_SERVICE
      }]
    }, { 
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      }
    });
  }
  
  // For demo, return a placeholder image
  // In production, this would serve actual IIIF images
  const imagePath = path.join(process.cwd(), 'public', 'placeholder.jpg');
  
  // Create a simple placeholder if it doesn't exist
  if (!fs.existsSync(imagePath)) {
    // Create a simple SVG placeholder
    const svg = `
<svg width="750" height="1000" xmlns="http://www.w3.org/2000/svg">
  <rect width="750" height="1000" fill="#f0f0f0"/>
  <text x="375" y="500" font-family="Arial" font-size="48" text-anchor="middle" fill="#333">
    Protected Image
  </text>
  <text x="375" y="560" font-family="Arial" font-size="24" text-anchor="middle" fill="#666">
    Authenticated Access Only
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
  
  const imageBuffer = fs.readFileSync(imagePath);
  
  return new NextResponse(imageBuffer, {
    headers: {
      'Content-Type': 'image/jpeg',
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