import { SignJWT, jwtVerify } from 'jose';
import { JWTPayload } from '@/types/common';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function createToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
  
  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    // Ensure the payload has the required fields
    if (payload && typeof payload.userId === 'string') {
      return {
        userId: payload.userId,
        exp: payload.exp,
        iat: payload.iat
      } as JWTPayload;
    }
    return null;
  } catch (error) {
    return null;
  }
}