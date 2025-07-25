import { NextRequest, NextResponse } from 'next/server';
import { ProbeServiceResponse } from '@/types/iiif-auth';
import { verifyToken } from '@/lib/iiif/jwt-auth';
import { IIIF_AUTH_TYPES, IIIF_CONTEXTS } from '@/types/iiif-constants';

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

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');
  
  // Also check for token in query params
  if (!token) {
    token = request.nextUrl.searchParams.get('token') || '';
  }
  
  const resourceId = request.nextUrl.searchParams.get('resource') || 'https://example.org/image/1';
  
  const baseResponse: ProbeServiceResponse = {
    "@context": IIIF_CONTEXTS.AUTH_2,
    id: resourceId,
    type: IIIF_AUTH_TYPES.PROBE_RESULT,
    status: 401,
  };
  
  // Check authentication - ensure token is valid string and not null/empty
  if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
    const payload = await verifyToken(token);
    if (payload) {
      return NextResponse.json({
        ...baseResponse,
        status: 200,
        location: {
          id: resourceId,
          type: "Image"
        }
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        }
      });
    }
  }
  
  return NextResponse.json({
    ...baseResponse,
    heading: {
      en: ["Authentication Required"]
    },
    note: {
      en: ["Please log in to access this resource"]
    },
    service: [{
      "@context": IIIF_CONTEXTS.AUTH_2,
      "@id": `${request.nextUrl.origin}/api/iiif/access`,
      id: `${request.nextUrl.origin}/api/iiif/access`,
      type: IIIF_AUTH_TYPES.ACCESS_SERVICE,
      profile: "http://iiif.io/api/auth/2/interactive",
      label: {
        en: ["Login to IIIF Auth Demo"]
      },
      heading: {
        en: ["Please Log In"]
      },
      note: {
        en: ["Use demo credentials: user/pass"]
      },
      confirmLabel: {
        en: ["Login"]
      },
      failureHeader: {
        en: ["Authentication Failed"]
      },
      failureDescription: {
        en: ["The credentials you provided were incorrect"]
      },
      service: [
        {
          "@id": `${request.nextUrl.origin}/api/iiif/token`,
          id: `${request.nextUrl.origin}/api/iiif/token`,
          type: IIIF_AUTH_TYPES.ACCESS_TOKEN_SERVICE,
          profile: "http://iiif.io/api/auth/2/token"
        },
        {
          "@id": `${request.nextUrl.origin}/api/iiif/logout`,
          id: `${request.nextUrl.origin}/api/iiif/logout`,
          type: IIIF_AUTH_TYPES.LOGOUT_SERVICE,
          profile: "http://iiif.io/api/auth/2/logout",
          label: {
            en: ["Logout"]
          }
        }
      ]
    }]
  }, { 
    status: 401,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    }
  });
}