'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Script from 'next/script';
import { useTranslations } from 'next-intl';
import AuthStatus from '@/components/AuthStatus';

declare global {
  interface Window {
    OpenSeadragon: any;
  }
}

export default function OpenSeadragonViewerPage() {
  const t = useTranslations();
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [authStatus, setAuthStatus] = useState<string>('');
  const [viewer, setViewer] = useState<any>(null);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  // Handle auth changes from AuthStatus component
  const handleAuthChange = (token: string | null) => {
    setCurrentToken(token);
    if (token) {
      setAuthStatus(t('openSeadragonViewer.readyToLoad'));
    } else {
      setAuthStatus(t('common.notAuthenticated'));
    }
  };

  const loadImage = useCallback(async () => {
    if (!viewerReady || !viewerRef.current) return;

    const token = localStorage.getItem('iiif_access_token');
    const imageServiceUrl = `${window.location.origin}/api/iiif/image/sample`;
    
    try {
      // First try to get the info.json
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
        
        if (!viewer) {
          // For authenticated IIIF in OpenSeadragon, we'll use a simple image
          // OpenSeadragon has issues with IIIF authentication in tile requests
          const simpleImageUrl = (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') 
            ? `${imageServiceUrl}/full/max/0/default.jpg?token=${token}`
            : `${imageServiceUrl}/full/max/0/default.jpg`;
          
          const newViewer = window.OpenSeadragon({
            id: 'openseadragon-viewer',
            prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@4/build/openseadragon/images/',
            tileSources: {
              type: 'image',
              url: simpleImageUrl,
              buildPyramid: false
            }
          });
          
          setViewer(newViewer);
          setAuthStatus(t('viewers.imageLoadedSimple'));
        }
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
  }, [viewerReady, viewer]);

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
          setCurrentToken(event.data.accessToken);
          setAuthStatus(t('miradorViewer.reloading'));
          
          // Dispatch custom event for same-tab updates
          window.dispatchEvent(new Event('auth-changed'));
          
          authWindow?.close();
          window.removeEventListener('message', handleMessage);
          
          // Reload the image
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      };
      
      window.addEventListener('message', handleMessage);
    }
  };

  useEffect(() => {
    if (viewerReady) {
      // Initial load when viewer is ready
      loadImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerReady]); // Intentionally exclude loadImage to prevent re-renders

  // Check if OpenSeadragon is already loaded
  useEffect(() => {
    if (window.OpenSeadragon) {
      setViewerReady(true);
    }
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <Script
        src="https://cdn.jsdelivr.net/npm/openseadragon@4/build/openseadragon/openseadragon.min.js"
        onLoad={() => setViewerReady(true)}
      />
      
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '1200px',
        margin: '0 auto',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '2rem' }}>
          <h1 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>{t('openSeadragonViewer.title')}</h1>
          
          <AuthStatus onAuthChange={handleAuthChange} />
          
          {authStatus && authStatus !== t('openSeadragonViewer.readyToLoad') && authStatus !== t('common.notAuthenticated') && (
            <div style={{ 
              marginTop: '0.5rem', 
              padding: '0.5rem', 
              backgroundColor: authStatus.includes('required') ? '#fff3cd' : '#d1ecf1',
              borderRadius: '4px',
              fontSize: '0.875rem',
              color: authStatus.includes('required') ? '#856404' : '#004085'
            }}>
              {authStatus}
              {authStatus === t('common.authenticationRequired') && ` - ${t('openSeadragonViewer.authRequiredMessage')}`}
            </div>
          )}
          
        </div>
        
        <div 
          id="openseadragon-viewer"
          ref={viewerRef}
          style={{ height: '600px', backgroundColor: '#000' }}
        />
      </div>
    </div>
  );
}