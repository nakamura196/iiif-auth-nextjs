'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useTranslations } from 'next-intl';
import AuthStatus from '@/components/AuthStatus';

declare global {
  interface Window {
    L: any;
  }
}

export default function LeafletIIIFViewerPage() {
  const t = useTranslations();
  const [mapReady, setMapReady] = useState(false);
  const [authStatus, setAuthStatus] = useState<string>('');
  const [map, setMap] = useState<any>(null);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Handle auth changes from AuthStatus component
  const handleAuthChange = (token: string | null) => {
    setCurrentToken(token);
    if (token && !map && mapReady) {
      loadIIIFImage();
    }
  };

  useEffect(() => {
    if (mapReady && !map) {
      loadIIIFImage();
    }
  }, [mapReady, map]);

  // Check if Leaflet is already loaded
  useEffect(() => {
    if (window.L && window.L.tileLayer && window.L.tileLayer.iiif) {
      setMapReady(true);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [map]);

  const loadIIIFImage = async () => {
    const token = localStorage.getItem('iiif_access_token');
    const imageServiceUrl = `${window.location.origin}/api/iiif/image/sample`;
    
    try {
      // Get image info with auth
      const response = await fetch(`${imageServiceUrl}/info.json`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const imageInfo = await response.json();
        
        // Check if authentication is required (service array contains auth service)
        if (imageInfo.service && imageInfo.service.length > 0) {
          // Authentication required - handle auth
          setAuthStatus(t('common.authenticationRequired'));
          handleAuth(imageInfo.service[0]);
          return;
        }
        
        // Clean up existing map if it exists
        if (map) {
          map.remove();
          setMap(null);
        }
        
        // Check if the container already has a map instance
        const container = document.getElementById('leaflet-map');
        if (container && (container as any)._leaflet_id) {
          // Remove the existing Leaflet instance
          delete (container as any)._leaflet_id;
        }
        
        // Initialize Leaflet map
        const leafletMap = window.L.map('leaflet-map', {
          center: [0, 0],
          crs: window.L.CRS.Simple,
          zoom: 0
        });

        // For authenticated IIIF with Leaflet, we'll use a simpler approach
        // Use a single full-size image instead of tiles to avoid complex tile URL issues
        if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
          // Use simple image overlay for authenticated images
          const imageBounds = window.L.latLngBounds(
            [-(imageInfo.height / 2), -(imageInfo.width / 2)],
            [imageInfo.height / 2, imageInfo.width / 2]
          );
          
          const imageUrl = `${imageServiceUrl}/full/max/0/default.jpg?token=${token}`;
          window.L.imageOverlay(imageUrl, imageBounds).addTo(leafletMap);
          
          leafletMap.fitBounds(imageBounds);
          leafletMap.setMaxBounds(imageBounds.pad(0.1));
        } else {
          // For non-authenticated, use regular IIIF tiles
          const iiifLayer = window.L.tileLayer.iiif(`${imageServiceUrl}/info.json`, {
            fitBounds: true,
            setMaxBounds: true
          });
          iiifLayer.addTo(leafletMap);
        }

        setMap(leafletMap);
        setAuthStatus(t('viewers.imageLoaded'));
      } else if (response.status === 401) {
        setAuthStatus(t('common.authenticationRequired'));
        const data = await response.json();
        if (data.service?.[0]) {
          handleAuth(data.service[0]);
        }
      }
    } catch (error) {
      console.error('Error loading image:', error);
      setAuthStatus(t('viewers.errorLoadingImage'));
    }
  };

  const handleAuth = async (probeService: any) => {
    const probeResponse = await fetch(probeService.id);
    const probeResult = await probeResponse.json();
    
    if (probeResult.service?.[0]) {
      const authService = probeResult.service[0];
      const tokenService = authService.service[0];
      
      const messageId = crypto.randomUUID();
      const tokenUrl = new URL(tokenService.id);
      tokenUrl.searchParams.set('messageId', messageId);
      tokenUrl.searchParams.set('origin', window.location.origin);
      
      const authWindow = window.open(tokenUrl.toString(), 'iiif-auth', 'width=600,height=600');
      
      const handleMessage = (event: MessageEvent) => {
        if (event.data.messageId === messageId) {
          localStorage.setItem('iiif_access_token', event.data.accessToken);
          setAuthStatus(t('miradorViewer.reloading'));
          
          // Dispatch custom event for same-tab updates
          window.dispatchEvent(new Event('auth-changed'));
          
          authWindow?.close();
          window.removeEventListener('message', handleMessage);
          
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      };
      
      window.addEventListener('message', handleMessage);
    }
  };


  return (
    <div style={{ padding: 'clamp(1rem, 3vw, 2rem)' }}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        onLoad={() => {
          // Load Leaflet-IIIF plugin after Leaflet
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/leaflet-iiif@3.0.0/leaflet-iiif.js';
          script.onload = () => setMapReady(true);
          document.head.appendChild(script);
        }}
      />
      
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '1200px',
        margin: '0 auto',
        overflow: 'hidden'
      }}>
        <div style={{ padding: 'clamp(1rem, 3vw, 2rem)' }}>
          <h1 style={{ 
            margin: '0 0 1rem 0', 
            fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
            wordBreak: 'break-word'
          }}>
            {t('leafletViewer.title')}
          </h1>
          
          <AuthStatus onAuthChange={handleAuthChange} />
          
          {authStatus && authStatus !== t('common.authenticationRequired') && (
            <div style={{ 
              marginTop: '0.5rem', 
              padding: 'clamp(0.4rem, 1vw, 0.5rem)', 
              backgroundColor: authStatus === t('common.authenticationRequired') ? '#fff3cd' : '#d1ecf1',
              borderRadius: '4px',
              fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)',
              color: authStatus === t('common.authenticationRequired') ? '#856404' : '#004085'
            }}>
              {authStatus}
              {authStatus === t('common.authenticationRequired') && ` - ${t('openSeadragonViewer.authRequiredMessage')}`}
            </div>
          )}
        </div>
        
        <div 
          id="leaflet-map" 
          style={{ 
            height: isMobile ? '400px' : '600px',
            touchAction: 'none'
          }} 
        />
      </div>
      
      <style jsx global>{`
        .leaflet-container {
          font-size: clamp(0.8rem, 1.5vw, 1rem);
        }
        
        .leaflet-control-zoom a {
          width: clamp(26px, 4vw, 32px);
          height: clamp(26px, 4vw, 32px);
          line-height: clamp(26px, 4vw, 32px);
          font-size: clamp(16px, 2.5vw, 20px);
        }
        
        /* Ensure Leaflet controls stay below the header menu */
        .leaflet-top,
        .leaflet-bottom {
          z-index: 900 !important;
        }
        
        .leaflet-control {
          z-index: 900 !important;
        }
        
        @media (max-width: 768px) {
          .leaflet-control-container .leaflet-top,
          .leaflet-control-container .leaflet-bottom {
            margin: 5px;
          }
        }
      `}</style>
    </div>
  );
}