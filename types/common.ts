// Common types used across the application

// JWT related types
export interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

// Generic JWT payload for debugging
export interface JWTDebugPayload {
  [key: string]: any;
}

// Auth session types
export interface AuthSession {
  userId: string;
  accessToken: string;
  expiresAt: number;
}

// Component prop types
export interface AuthStatusProps {
  onAuthChange?: (token: string | null) => void;
}

// Token service test configuration
export interface TokenServiceTest {
  messageId: string;
  origin: string;
  accessToken?: string;
  windowRef?: Window | null;
}

// IIIF Image API types
export interface ImageInfo {
  '@context': string;
  id: string;
  type: string;
  protocol: string;
  width: number;
  height: number;
  profile: string[];
  service?: Array<{
    '@context': string;
    '@id': string;
    type: string;
    profile: string;
  }>;
  tiles?: Array<{
    width: number;
    height?: number;
    scaleFactors: number[];
  }>;
  sizes?: Array<{
    width: number;
    height: number;
  }>;
}

// Error types
export interface APIError {
  error: string;
  message: string;
  status?: number;
}