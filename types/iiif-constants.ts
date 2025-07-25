// IIIF API Constants
export const IIIF_AUTH_TYPES = {
  PROBE_RESULT: 'AuthProbeResult2',
  ACCESS_TOKEN: 'AuthAccessToken2',
  ACCESS_TOKEN_ERROR: 'AuthAccessTokenError2',
  PROBE_SERVICE: 'AuthProbeService2',
  ACCESS_SERVICE: 'AuthAccessService2',
  ACCESS_TOKEN_SERVICE: 'AuthAccessTokenService2',
  LOGOUT_SERVICE: 'AuthLogoutService2',
} as const;

export const IIIF_IMAGE_TYPES = {
  IMAGE_SERVICE: 'ImageService3',
} as const;

export const IIIF_PRESENTATION_TYPES = {
  MANIFEST: 'Manifest',
  CANVAS: 'Canvas',
  ANNOTATION: 'Annotation',
} as const;

export const IIIF_CONTEXTS = {
  AUTH_2: 'http://iiif.io/api/auth/2/context.json',
  PRESENTATION_3: 'http://iiif.io/api/presentation/3/context.json',
  IMAGE_3: 'http://iiif.io/api/image/3/context.json',
} as const;

export const IIIF_PROFILES = {
  AUTH_INTERACTIVE: 'interactive',
  AUTH_KIOSK: 'kiosk',
  AUTH_EXTERNAL: 'external',
  IMAGE_LEVEL2: 'level2',
} as const;

// Type helpers
export type IIIFAuthType = typeof IIIF_AUTH_TYPES[keyof typeof IIIF_AUTH_TYPES];
export type IIIFImageType = typeof IIIF_IMAGE_TYPES[keyof typeof IIIF_IMAGE_TYPES];
export type IIIFPresentationType = typeof IIIF_PRESENTATION_TYPES[keyof typeof IIIF_PRESENTATION_TYPES];
export type IIIFContext = typeof IIIF_CONTEXTS[keyof typeof IIIF_CONTEXTS];
export type IIIFAuthProfile = typeof IIIF_PROFILES[keyof typeof IIIF_PROFILES];