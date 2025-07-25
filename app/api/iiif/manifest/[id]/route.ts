import { NextRequest, NextResponse } from 'next/server';
import { IIIF_PRESENTATION_TYPES, IIIF_IMAGE_TYPES, IIIF_AUTH_TYPES, IIIF_CONTEXTS, IIIF_PROFILES } from '@/types/iiif-constants';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const baseUrl = request.nextUrl.origin;
  
  const manifest = {
    "@context": IIIF_CONTEXTS.PRESENTATION_3,
    "id": `${baseUrl}/api/iiif/manifest/${params.id}`,
    "type": IIIF_PRESENTATION_TYPES.MANIFEST,
    "label": {
      "en": ["Sample Manifest"]
    },
    "metadata": [
      {
        "label": { "en": ["Description"] },
        "value": { "en": ["This is a sample IIIF manifest"] }
      }
    ],
    "items": [
      {
        "id": `${baseUrl}/api/iiif/manifest/${params.id}/canvas/1`,
        "type": IIIF_PRESENTATION_TYPES.CANVAS,
        "label": {
          "en": ["Protected Image"]
        },
        "height": 1000,
        "width": 750,
        "items": [
          {
            "id": `${baseUrl}/api/iiif/manifest/${params.id}/canvas/1/page`,
            "type": "AnnotationPage",
            "items": [
              {
                "id": `${baseUrl}/api/iiif/manifest/${params.id}/canvas/1/annotation`,
                "type": IIIF_PRESENTATION_TYPES.ANNOTATION,
                "motivation": "painting",
                "body": {
                  "id": `${baseUrl}/api/iiif/image/${params.id}/full/max/0/default.jpg`,
                  "type": "Image",
                  "format": "image/jpeg",
                  "service": [
                    {
                      "@context": IIIF_CONTEXTS.IMAGE_3,
                      "@id": `${baseUrl}/api/iiif/image/${params.id}`,
                      "id": `${baseUrl}/api/iiif/image/${params.id}`,
                      "type": IIIF_IMAGE_TYPES.IMAGE_SERVICE,
                      "profile": IIIF_PROFILES.IMAGE_LEVEL2
                    }
                  ],
                  "height": 1000,
                  "width": 750
                },
                "target": `${baseUrl}/api/iiif/manifest/${params.id}/canvas/1`
              }
            ]
          }
        ]
      }
    ]
  };
  
  return NextResponse.json(manifest, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}