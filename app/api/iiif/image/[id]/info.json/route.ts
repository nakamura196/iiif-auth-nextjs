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
  
  // Check authentication - ensure token is valid string and not null/empty
  const isValid = (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') 
    ? await verifyToken(token) 
    : null;
  
  // Return IIIF Image API info.json
  const info: any = {
    "@context": IIIF_CONTEXTS.IMAGE_3,
    "@id": `${request.nextUrl.origin}/api/iiif/image/${params.id}`,
    "id": `${request.nextUrl.origin}/api/iiif/image/${params.id}`,
    "type": IIIF_IMAGE_TYPES.IMAGE_SERVICE,
    "protocol": "http://iiif.io/api/image",
    "profile": IIIF_PROFILES.IMAGE_LEVEL2,
    "width": 750,
    "height": 1000
  };
  
  // Add auth service if not authenticated
  if (!isValid) {
    info.service = [{
      "@context": IIIF_CONTEXTS.AUTH_2,
      "@id": `${request.nextUrl.origin}/api/iiif/access`,
      "id": `${request.nextUrl.origin}/api/iiif/access`,
      "type": IIIF_AUTH_TYPES.ACCESS_SERVICE,
      "profile": "http://iiif.io/api/auth/2/interactive",
      "label": "Login to IIIF Auth Demo",
      "header": "Please Log In",
      "description": "Use demo credentials: user/pass",
      "confirmLabel": "Login",
      "failureHeader": "Authentication Failed",
      "failureDescription": "The credentials you provided were incorrect",
      "service": [
        {
          "@id": `${request.nextUrl.origin}/api/iiif/token`,
          "id": `${request.nextUrl.origin}/api/iiif/token`,
          "type": IIIF_AUTH_TYPES.ACCESS_TOKEN_SERVICE,
          "profile": "http://iiif.io/api/auth/2/token"
        },
        {
          "@id": `${request.nextUrl.origin}/api/iiif/logout`,
          "id": `${request.nextUrl.origin}/api/iiif/logout`,
          "type": IIIF_AUTH_TYPES.LOGOUT_SERVICE,
          "profile": "http://iiif.io/api/auth/2/logout",
          "label": "Logout"
        }
      ]
    }];
  }
  
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