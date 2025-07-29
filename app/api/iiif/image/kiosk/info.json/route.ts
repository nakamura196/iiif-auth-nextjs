import { NextRequest, NextResponse } from 'next/server';
import { IIIF_AUTH_TYPES, IIIF_CONTEXTS } from '@/types/iiif-constants';

export async function GET(request: NextRequest) {
  // Kiosk mode info.json - returns auth service for kiosk pattern
  const baseUrl = request.nextUrl.origin;
  
  // Get locale from cookie, query parameter, or Accept-Language header
  const localeCookie = request.cookies.get('locale')?.value;
  const localeParam = request.nextUrl.searchParams.get('locale');
  const acceptLanguage = request.headers.get('accept-language') || '';
  
  // Determine if we should use Japanese
  const locale = localeCookie || localeParam || 
    (acceptLanguage.toLowerCase().includes('ja') ? 'ja' : 'en');
  const isJapanese = locale === 'ja';
  
  const imageInfo = {
    "@context": "http://iiif.io/api/image/3/context.json",
    "id": `${baseUrl}/api/iiif/image/kiosk`,
    "type": "ImageService3",
    "protocol": "http://iiif.io/api/image",
    "profile": "level2",
    "width": 750,
    "height": 1000,
    "sizes": [
      { "width": 150, "height": 200 },
      { "width": 375, "height": 500 },
      { "width": 750, "height": 1000 }
    ],
    "tiles": [{
      "width": 512,
      "height": 512,
      "scaleFactors": [1, 2, 4, 8]
    }],
    "service": [{
      "@context": IIIF_CONTEXTS.AUTH_2,
      "id": `${baseUrl}/api/iiif/auth/kiosk`,
      "type": "AuthAccessService2",
      "profile": "kiosk",
      "label": { 
        "en": ["Click-through Kiosk Authentication"],
        "ja": ["クリックスルー型キオスク認証"]
      },
      "heading": { 
        "en": ["Terms of Use"],
        "ja": ["利用規約"]
      },
      "note": { 
        "en": ["Please accept the terms to view this content"],
        "ja": ["このコンテンツを表示するには利用規約に同意してください"]
      },
      "confirmLabel": { 
        "en": ["Accept Terms and Continue"],
        "ja": ["規約に同意して続行"]
      },
      "service": [{
        "@context": IIIF_CONTEXTS.AUTH_2,
        "id": `${baseUrl}/api/iiif/auth/kiosk/token`,
        "type": "AuthAccessTokenService2"
      }]
    }]
  };

  return NextResponse.json(imageInfo, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Content-Type': 'application/json',
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