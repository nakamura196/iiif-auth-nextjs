'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import AuthStatus from '@/components/AuthStatus';

export default function SimpleViewerPage() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const t = useTranslations();

  // Handle auth changes from AuthStatus component
  const handleAuthChange = (token: string | null) => {
    setCurrentToken(token);
  };

  useEffect(() => {
    // Cleanup blob URL on unmount
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const loadProtectedImage = async () => {
    setLoading(true);
    setError('');
    setAuthRequired(false);
    
    try {
      const token = localStorage.getItem('iiif_access_token');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(`/api/iiif/image/sample/full/max/0/default.jpg?t=${timestamp}`, {
        headers,
        cache: 'no-store'
      });
      
      if (response.ok) {
        // Revoke previous blob URL to free memory
        if (imageUrl) {
          URL.revokeObjectURL(imageUrl);
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      } else if (response.status === 401) {
        setAuthRequired(true);
        const data = await response.json();
        if (data.service?.[0]) {
          handleAuth(data.service[0]);
        }
      } else {
        setError(t('viewers.failedToLoadImage'));
      }
    } catch (err) {
      setError(t('viewers.errorLoadingImage'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (probeService: any) => {
    // First, probe the resource
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
          
          // Dispatch custom event for same-tab updates
          window.dispatchEvent(new Event('auth-changed'));
          
          authWindow?.close();
          window.removeEventListener('message', handleMessage);
          
          // Reload the image
          loadProtectedImage();
        }
      };
      
      window.addEventListener('message', handleMessage);
    }
  };

  // Auth clearing is now handled by AuthStatus component

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>{t('simpleViewer.title')}</h1>
        
        <AuthStatus onAuthChange={handleAuthChange} />
      
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={loadProtectedImage}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '1rem'
          }}
        >
          {loading ? t('common.loading') : t('viewers.loadProtectedImage')}
        </button>
      </div>
      
      {error && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          borderRadius: '4px' 
        }}>
          {error}
        </div>
      )}
      
      {authRequired && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#fff3cd', 
          color: '#856404',
          borderRadius: '4px' 
        }}>
          {t('viewers.authRequired')}
          <br />
          {t('viewers.useCredentials')}
        </div>
      )}
      
      {imageUrl && (
        <div style={{ marginTop: '2rem' }}>
          <h2>{t('viewers.protectedImage')}:</h2>
          <img 
            src={imageUrl} 
            alt="Protected IIIF Image" 
            style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd' }}
          />
        </div>
      )}
      </div>
    </div>
  );
}