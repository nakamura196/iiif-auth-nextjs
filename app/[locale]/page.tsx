'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const [probeResult, setProbeResult] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('iiif_access_token');
    if (token) {
      setAccessToken(token);
    }
  }, []);

  const probeResource = async () => {
    setLoading(true);
    try {
      const headers: HeadersInit = {};
      // Use token from state or localStorage
      const token = accessToken || localStorage.getItem('iiif_access_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/iiif/probe?resource=https://example.org/image/1', {
        headers
      });
      const data = await response.json();
      setProbeResult(data);
      
      // If authentication is required and we don't have a token, open auth window
      if (data.status === 401 && data.service && !token) {
        handleAuth(data);
      }
    } catch (error) {
      console.error('Probe failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (authData?: any) => {
    const serviceData = authData || probeResult;
    if (!serviceData?.service?.[0]) return;
    
    const authService = serviceData.service[0];
    const tokenService = authService.service[0];
    
    const messageId = crypto.randomUUID();
    const tokenUrl = new URL(tokenService.id);
    tokenUrl.searchParams.set('messageId', messageId);
    tokenUrl.searchParams.set('origin', window.location.origin);
    
    const authWindow = window.open(tokenUrl.toString(), 'iiif-auth', 'width=600,height=600');
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data.messageId === messageId) {
        setAccessToken(event.data.accessToken);
        
        // Store token in localStorage
        localStorage.setItem('iiif_access_token', event.data.accessToken);
        
        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new Event('auth-changed'));
        
        authWindow?.close();
        window.removeEventListener('message', handleMessage);
        
        // Immediately probe again with the new token
        setTimeout(() => probeResource(), 100);
      }
    };
    
    window.addEventListener('message', handleMessage);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{t('home.title')}</h1>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
          {t('home.description')}
        </p>

        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t('home.features.title')}</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>✅ {t('home.features.auth')}</li>
            <li style={{ marginBottom: '0.5rem' }}>✅ {t('home.features.viewers')}</li>
            <li style={{ marginBottom: '0.5rem' }}>✅ {t('home.features.jwt')}</li>
            <li style={{ marginBottom: '0.5rem' }}>✅ {t('home.features.persistence')}</li>
          </ul>
        </div>

        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '8px' 
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t('home.gettingStarted.title')}</h2>
          <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>{t('home.gettingStarted.step1')}</li>
            <li style={{ marginBottom: '0.5rem' }}>{t('home.gettingStarted.step2')}</li>
            <li style={{ marginBottom: '0.5rem' }}>{t('home.gettingStarted.step3')}</li>
          </ol>
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={probeResource}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {loading ? t('common.loading') : t('home.authenticate')}
          </button>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
            {t('home.authenticateDescription')}
          </p>
        </div>
        
        {probeResult && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f4f4f4', borderRadius: '4px' }}>
            <h3>Probe Result:</h3>
            <pre style={{ overflow: 'auto', fontSize: '0.875rem' }}>{JSON.stringify(probeResult, null, 2)}</pre>
            
            {probeResult.status === 401 && probeResult.service && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: '#fff3cd', 
                  color: '#856404',
                  borderRadius: '4px',
                  marginBottom: '1rem'
                }}>
                  {t('home.authWindow')}
                </div>
              </div>
            )}
          </div>
        )}
        
        {accessToken && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#d4edda', borderRadius: '4px' }}>
            <h3>{t('common.token')}:</h3>
            <code style={{ wordBreak: 'break-all', fontSize: '0.875rem' }}>{accessToken}</code>
          </div>
        )}
      </div>
    </div>
  );
}