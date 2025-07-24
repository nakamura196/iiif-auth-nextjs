'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import AuthStatus from '@/components/AuthStatus';

declare global {
  interface Window {
    Mirador: any;
  }
}

export default function ViewerPage() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [authStatus, setAuthStatus] = useState<string>('');
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  // Handle auth changes from AuthStatus component
  const handleAuthChange = (token: string | null) => {
    setCurrentToken(token);
    if (token) {
      setAuthStatus('Authenticated');
    } else {
      setAuthStatus('Not authenticated - images may not load');
    }
  };


  useEffect(() => {
    if (viewerReady && viewerRef.current) {
      const manifestUrl = `${window.location.origin}/api/iiif/manifest/sample`;
      
      try {
        const config = {
          id: viewerRef.current.id,
          windows: [{
            manifestId: manifestUrl,
          }],
          window: {
            allowClose: false,
            allowFullscreen: true,
            defaultView: 'single',
          },
          // Simpler request configuration
          requests: {
            preprocessors: [
              (url: string, options: any = {}) => {
                const token = localStorage.getItem('iiif_access_token');
                if (token) {
                  // Add token as query parameter for image requests
                  if (url.includes('/api/iiif/image/') && !url.includes('token=')) {
                    const separator = url.includes('?') ? '&' : '?';
                    url = `${url}${separator}token=${token}`;
                  }
                  // Add Authorization header for other requests
                  if (!options.headers) {
                    options.headers = {};
                  }
                  options.headers['Authorization'] = `Bearer ${token}`;
                }
                return { url, options };
              }
            ]
          }
        };
        
        // Initialize Mirador
        const miradorInstance = window.Mirador.viewer(config);
        
      } catch (error) {
        console.error('Error initializing Mirador:', error);
      }
    }
  }, [viewerReady]);

  // Listen for authentication events from Mirador
  useEffect(() => {
    if (viewerReady) {
      // Listen for postMessage from auth window
      const handleMessage = (event: MessageEvent) => {
        if (event.data.messageId && event.data.accessToken) {
          localStorage.setItem('iiif_access_token', event.data.accessToken);
          setCurrentToken(event.data.accessToken);
          setAuthStatus('Authenticated! Reloading viewer...');
          
          // Dispatch custom event for header update
          window.dispatchEvent(new Event('auth-changed'));
          
          // Reload to refresh Mirador with new token
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      };
      
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [viewerReady]);


  return (
    <div style={{ padding: '2rem' }}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/mirador@latest/dist/mirador.min.css"
      />
      <Script
        src="https://unpkg.com/mirador@latest/dist/mirador.min.js"
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
          <h1 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>Mirador IIIF Viewer</h1>
          
          <AuthStatus onAuthChange={handleAuthChange} />
          
        {authStatus && authStatus !== 'Authenticated' && authStatus !== 'Not authenticated - images may not load' && (
          <div style={{ 
            marginTop: '0.5rem', 
            padding: '0.5rem', 
            backgroundColor: '#d1ecf1',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}>
            {authStatus}
          </div>
        )}
        </div>
        
        <div 
          id="mirador-viewer"
          ref={viewerRef} 
          style={{ height: '700px', position: 'relative' }}
        />
      </div>
    </div>
  );
}