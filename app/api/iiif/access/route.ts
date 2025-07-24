import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/iiif/jwt-auth';
import { IIIF_AUTH_TYPES, IIIF_CONTEXTS } from '@/types/iiif-constants';

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