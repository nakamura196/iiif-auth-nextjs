'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    Tify: any;
  }
}

export default function TifyViewerPage() {
  const [viewerReady, setViewerReady] = useState(false);
  const [authStatus, setAuthStatus] = useState<string>('');
  const [tifyInstance, setTifyInstance] = useState<any>(null);

  useEffect(() => {
    if (viewerReady && !tifyInstance) {
      const manifestUrl = `${window.location.origin}/api/iiif/manifest/sample`;
      
      // Override fetch to add auth headers
      const originalFetch = window.fetch;
      window.fetch = function(url: string | Request | URL, options?: RequestInit) {
        const token = localStorage.getItem('iiif_access_token');
        
        if (token && typeof url === 'string' && url.includes('/api/iiif/')) {
          options = options || {};
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
          };
        }
        
        return originalFetch(url as RequestInfo, options).then(response => {
          if (response.status === 401 && typeof url === 'string' && url.includes('/api/iiif/')) {
            handleAuthRequired();
          }
          return response;
        });
      };

      try {
        const tify = new window.Tify({
          container: document.getElementById('tify-container'),
          manifestUrl: manifestUrl,
          language: 'en'
        });
        
        setTifyInstance(tify);
        setAuthStatus('Viewer initialized');
      } catch (error) {
        console.error('Failed to initialize Tify:', error);
        setAuthStatus('Failed to initialize viewer');
      }
    }
  }, [viewerReady, tifyInstance]);

  const handleAuthRequired = async () => {
    setAuthStatus('Authentication required. Opening login window...');
    
    try {
      // First probe to get auth service info
      const probeResponse = await fetch(`${window.location.origin}/api/iiif/probe`);
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
            setAuthStatus('Authenticated! Reloading...');
            authWindow?.close();
            window.removeEventListener('message', handleMessage);
            
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        };
        
        window.addEventListener('message', handleMessage);
      }
    } catch (error) {
      console.error('Auth handling failed:', error);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('iiif_access_token');
    setAuthStatus('Authentication cleared. Reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/tify@0.28.1/dist/tify.css"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/tify@0.28.1/dist/tify.js"
        onLoad={() => setViewerReady(true)}
      />
      
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Tify IIIF Viewer with Auth</h1>
        {authStatus && (
          <div style={{ 
            marginTop: '0.5rem', 
            padding: '0.5rem', 
            backgroundColor: authStatus.includes('required') ? '#fff3cd' : '#d1ecf1',
            borderRadius: '4px',
            fontSize: '0.875rem',
            color: authStatus.includes('required') ? '#856404' : '#004085'
          }}>
            {authStatus}
          </div>
        )}
        <button
          onClick={clearAuth}
          style={{
            marginTop: '0.5rem',
            padding: '0.25rem 0.5rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Clear Authentication
        </button>
      </div>
      
      <div id="tify-container" style={{ flex: 1, backgroundColor: '#000' }} />
    </div>
  );
}