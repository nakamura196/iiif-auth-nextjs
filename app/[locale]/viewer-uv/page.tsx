'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    UV: any;
  }
}

export default function UniversalViewerPage() {
  const [viewerReady, setViewerReady] = useState(false);
  const [authStatus, setAuthStatus] = useState<string>('');

  useEffect(() => {
    if (viewerReady) {
      const manifestUrl = `${window.location.origin}/api/iiif/manifest/sample`;
      
      const urlDataProvider = new window.UV.URLDataProvider();
      
      const uvElement = document.getElementById('uv');
      if (!uvElement) return;

      const uv = window.UV.init('uv', {
        manifestUri: manifestUrl,
        configUri: undefined,
        dataProvider: urlDataProvider,
        config: {
          options: {
            authAPIVersion: 2.0,
            theme: 'uv-en-GB-theme',
            leftPanelEnabled: true,
            rightPanelEnabled: true
          },
          modules: {
            headerPanel: {
              options: {
                localeToggleEnabled: false
              }
            }
          }
        }
      });

      // Handle auth events
      uv.on('authFailed', () => {
        setAuthStatus('Authentication required');
      });

      uv.on('accessTokenReceived', (token: string) => {
        localStorage.setItem('iiif_access_token', token);
        setAuthStatus('Authenticated successfully');
      });

      // Add auth header to requests
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
        
        return originalFetch(url as RequestInfo, options);
      };
    }
  }, [viewerReady]);

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
        href="https://cdn.jsdelivr.net/npm/universalviewer@4/dist/uv.css"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/universalviewer@4/dist/umd/UV.js"
        onLoad={() => setViewerReady(true)}
      />
      
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Universal Viewer with IIIF Auth</h1>
        {authStatus && (
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
      
      <div id="uv" className="uv" style={{ flex: 1 }}></div>
    </div>
  );
}