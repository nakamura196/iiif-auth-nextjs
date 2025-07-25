import { NextRequest, NextResponse } from 'next/server';

// This is an alias for the access service, supporting Auth 1.0 clients
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