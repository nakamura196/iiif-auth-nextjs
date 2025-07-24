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
  const token = authHeader?.replace('Bearer ', '');
  
  const resourceId = request.nextUrl.searchParams.get('resource') || 'https://example.org/image/1';
  
  const baseResponse: ProbeServiceResponse = {
    "@context": IIIF_CONTEXTS.AUTH_2,
    id: resourceId,
    type: IIIF_AUTH_TYPES.PROBE_RESULT,
    status: 401,
  };
  
  if (token) {
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
      id: `${request.nextUrl.origin}/api/iiif/access`,
      type: IIIF_AUTH_TYPES.ACCESS_SERVICE,
      profile: "active",
      label: "Login to Example Institution",
      service: [{
        id: `${request.nextUrl.origin}/api/iiif/token`,
        type: IIIF_AUTH_TYPES.ACCESS_TOKEN_SERVICE
      }]
    }]
  }, { 
    status: 401,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    }
  });
}