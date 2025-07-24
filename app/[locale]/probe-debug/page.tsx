'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import AuthStatus from '@/components/AuthStatus';
import { ProbeServiceResponse } from '@/types/iiif-auth';

export default function ProbeDebugPage() {
  const t = useTranslations();
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [probeResponse, setProbeResponse] = useState<ProbeServiceResponse | null>(null);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [includeAuth, setIncludeAuth] = useState(true);

  // Handle auth changes from AuthStatus component
  const handleAuthChange = (token: string | null) => {
    setCurrentToken(token);
  };

  const callProbeService = async () => {
    setLoading(true);
    setError('');
    setProbeResponse(null);
    setRawResponse('');

    try {
      const probeUrl = '/api/iiif/probe';
      const headers: HeadersInit = {};
      
      if (includeAuth && currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
      }


      const response = await fetch(probeUrl, { headers });
      const text = await response.text();
      
      setRawResponse(text);
      
      try {
        const data = JSON.parse(text);
        setProbeResponse(data);
      } catch {
        setError('Invalid JSON response');
      }
      
      if (!response.ok && response.status !== 401) {
        setError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setError(`${t('common.error')}: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderProbeResult = () => {
    if (!probeResponse) return null;

    return (
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ 
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
          marginBottom: '1rem' 
        }}>
          {t('probeDebug.probeResponseAnalysis')}
        </h2>
        
        {/* Status */}
        <div style={{ 
          padding: 'clamp(0.5rem, 2vw, 1rem)', 
          backgroundColor: probeResponse.status === 200 ? '#d4edda' : '#f8d7da',
          color: probeResponse.status === 200 ? '#155724' : '#721c24',
          borderRadius: '4px',
          marginBottom: '1rem',
          fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)'
        }}>
          <strong>{t('probeDebug.status')}: {probeResponse.status}</strong>
          {probeResponse.status === 200 
            ? ` - ${t('probeDebug.authSuccessful')}` 
            : ` - ${t('probeDebug.authRequired')}`}
        </div>

        {/* Location (for 200 status) */}
        {probeResponse.location && (
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ 
              fontSize: 'clamp(0.9rem, 1.8vw, 1rem)', 
              marginBottom: '0.5rem', 
              color: '#6c757d' 
            }}>
              {t('probeDebug.accessibleResource')}
            </h3>
            <div style={{ 
              padding: 'clamp(0.5rem, 2vw, 1rem)', 
              backgroundColor: '#e9ecef', 
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: 'clamp(0.7rem, 1.3vw, 0.875rem)',
              overflowX: 'auto'
            }}>
              <div style={{ wordBreak: 'break-all' }}>
                <strong>ID:</strong> {probeResponse.location.id}
              </div>
              <div><strong>{t('probeDebug.type')}:</strong> {probeResponse.location.type}</div>
            </div>
          </div>
        )}

        {/* Services (for 401 status) */}
        {probeResponse.service && probeResponse.service.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ 
              fontSize: 'clamp(0.9rem, 1.8vw, 1rem)', 
              marginBottom: '0.5rem', 
              color: '#6c757d' 
            }}>
              {t('probeDebug.availableAuthServices')}
            </h3>
            {probeResponse.service.map((service, index) => (
              <div key={index} style={{ 
                padding: 'clamp(0.5rem, 2vw, 1rem)', 
                backgroundColor: '#e9ecef', 
                borderRadius: '4px',
                marginBottom: '0.5rem',
                fontSize: 'clamp(0.7rem, 1.3vw, 0.875rem)'
              }}>
                <div><strong>{t('probeDebug.type')}:</strong> {service.type}</div>
                <div style={{ wordBreak: 'break-all' }}>
                  <strong>ID:</strong> <code style={{ fontSize: 'clamp(0.65rem, 1.2vw, 0.75rem)' }}>{service.id}</code>
                </div>
                {service.profile && (
                  <div><strong>{t('probeDebug.profile')}:</strong> {service.profile}</div>
                )}
                {service.label && (
                  <div><strong>{t('probeDebug.label')}:</strong> {service.label}</div>
                )}
                
                {/* Nested Token Service */}
                {service.service && service.service.length > 0 && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    marginLeft: 'clamp(0.5rem, 2vw, 1rem)' 
                  }}>
                    <strong>{t('probeDebug.tokenService')}:</strong>
                    {service.service.map((tokenService: any, idx: number) => (
                      <div key={idx} style={{ marginTop: '0.25rem' }}>
                        <div>{t('probeDebug.type')}: {tokenService.type}</div>
                        <div style={{ wordBreak: 'break-all' }}>
                          ID: <code style={{ fontSize: 'clamp(0.65rem, 1.2vw, 0.75rem)' }}>{tokenService.id}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Raw JSON */}
        <div>
          <h3 style={{ 
            fontSize: 'clamp(0.9rem, 1.8vw, 1rem)', 
            marginBottom: '0.5rem', 
            color: '#6c757d' 
          }}>
            {t('probeDebug.rawJsonResponse')}
          </h3>
          <pre style={{ 
            padding: 'clamp(0.5rem, 2vw, 1rem)', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            border: '1px solid #dee2e6',
            fontFamily: 'monospace',
            fontSize: 'clamp(0.7rem, 1.3vw, 0.875rem)',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(probeResponse, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 'clamp(1rem, 3vw, 2rem)' }}>
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: 'clamp(1rem, 3vw, 2rem)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{ 
          margin: '0 0 1rem 0', 
          fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
          wordBreak: 'break-word'
        }}>
          {t('probeDebug.title')}
        </h1>
        
        <AuthStatus onAuthChange={handleAuthChange} />

        <div style={{ marginTop: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={includeAuth}
                onChange={(e) => setIncludeAuth(e.target.checked)}
                style={{
                  width: 'clamp(16px, 2.5vw, 20px)',
                  height: 'clamp(16px, 2.5vw, 20px)',
                  cursor: 'pointer'
                }}
              />
              {t('probeDebug.includeToken')}
            </label>
          </div>

          <button
            onClick={callProbeService}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)'
            }}
          >
            {loading ? t('common.loading') : t('probeDebug.callProbeService')}
          </button>
          
          <div style={{ 
            marginTop: '0.5rem', 
            fontSize: 'clamp(0.7rem, 1.2vw, 0.75rem)', 
            color: '#6c757d' 
          }}>
            {t('probeDebug.endpoint')}: /api/iiif/probe
          </div>
        </div>

        {error && (
          <div style={{ 
            marginTop: '1rem', 
            padding: 'clamp(0.5rem, 2vw, 1rem)', 
            backgroundColor: '#f8d7da', 
            color: '#721c24',
            borderRadius: '4px',
            fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)'
          }}>
            {error}
          </div>
        )}

        {renderProbeResult()}

        {!loading && !probeResponse && (
          <div style={{ 
            marginTop: '2rem',
            padding: 'clamp(1rem, 3vw, 2rem)',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            textAlign: 'center',
            color: '#6c757d',
            fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)'
          }}>
            {t('probeDebug.clickToTest')}
          </div>
        )}
      </div>
    </div>
  );
}