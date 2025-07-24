import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/iiif/jwt-auth';
import { IIIF_AUTH_TYPES, IIIF_IMAGE_TYPES, IIIF_CONTEXTS, IIIF_PROFILES } from '@/types/iiif-constants';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');
  
  // Also check for token in query params
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
  
  // Return IIIF Image API info.json
  const info = {
    "@context": IIIF_CONTEXTS.IMAGE_3,
    "id": `${request.nextUrl.origin}/api/iiif/image/${params.id}`,
    "type": IIIF_IMAGE_TYPES.IMAGE_SERVICE,
    "protocol": "http://iiif.io/api/image",
    "profile": IIIF_PROFILES.IMAGE_LEVEL2,
    "width": 750,
    "height": 1000,
    "service": [
      {
        "@context": IIIF_CONTEXTS.AUTH_2,
        "id": `${request.nextUrl.origin}/api/iiif/probe`,
        "type": IIIF_AUTH_TYPES.PROBE_SERVICE
      }
    ]
  };
  
  return NextResponse.json(info, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    }
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