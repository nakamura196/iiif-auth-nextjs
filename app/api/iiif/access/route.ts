import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/iiif/jwt-auth';
import { IIIF_AUTH_TYPES, IIIF_CONTEXTS } from '@/types/iiif-constants';

export async function GET(request: NextRequest) {
  // Extract parameters from query string
  const origin = request.nextUrl.searchParams.get('origin') || request.headers.get('referer') || '';
  let messageId = request.nextUrl.searchParams.get('messageId') || '';
  
  // If messageId looks like a URL (token service), generate a new ID
  if (messageId.startsWith('http')) {
    messageId = crypto.randomUUID();
  }
  
  // Get locale from referer or default to 'en'
  const referer = request.headers.get('referer') || '';
  let locale = 'en';
  if (referer.includes('locale=ja') || referer.includes('/ja/')) {
    locale = 'ja';
  }
  
  // Redirect to the auth page with these parameters
  const authUrl = new URL(`/${locale}/auth`, request.url);
  authUrl.searchParams.set('origin', origin);
  authUrl.searchParams.set('messageId', messageId);
  
  return NextResponse.redirect(authUrl);
}

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  
  // Simple demo authentication - in production, verify against database
  if (username === 'user' && password === 'pass') {
    const token = await createToken(username);
    
    return NextResponse.json({
      "@context": IIIF_CONTEXTS.AUTH_2,
      type: IIIF_AUTH_TYPES.ACCESS_TOKEN,
      accessToken: token,
      expiresIn: 3600,
      messageId: crypto.randomUUID(),
    });
  }
  
  return NextResponse.json({
    "@context": IIIF_CONTEXTS.AUTH_2,
    type: IIIF_AUTH_TYPES.ACCESS_TOKEN_ERROR,
    profile: "invalidCredentials",
    heading: {
      en: ["Invalid Credentials"]
    },
    note: {
      en: ["Please check your username and password"]
    },
    error: "invalidCredentials"
  }, { status: 401 });
}