'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import AuthStatus from '@/components/AuthStatus';
import { JWTDebugPayload } from '@/types/common';

export default function JWTDebugPage() {
  const t = useTranslations();
  const [token, setToken] = useState<string | null>(null);
  const [decodedHeader, setDecodedHeader] = useState<JWTDebugPayload | null>(null);
  const [decodedPayload, setDecodedPayload] = useState<JWTDebugPayload | null>(null);
  const [error, setError] = useState<string>('');
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
  const handleAuthChange = (newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      decodeToken(newToken);
    } else {
      setDecodedHeader(null);
      setDecodedPayload(null);
      setError('');
    }
  };

  const decodeToken = (jwtToken: string) => {
    try {
      const parts = jwtToken.split('.');
      if (parts.length !== 3) {
        setError('Invalid JWT format');
        return;
      }

      // Decode header
      const header = JSON.parse(atob(parts[0]));
      setDecodedHeader(header);

      // Decode payload
      const payload = JSON.parse(atob(parts[1]));
      setDecodedPayload(payload);

      setError('');
    } catch (err) {
      setError(`${t('common.error')}: ${(err as Error).message}`);
      setDecodedHeader(null);
      setDecodedPayload(null);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const renderValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const getExpiryMinutes = (exp: number) => {
    return Math.floor((new Date(exp * 1000).getTime() - new Date().getTime()) / 1000 / 60);
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
          {t('jwtDebug.title')}
        </h1>
        
        <AuthStatus onAuthChange={handleAuthChange} />

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

        {token && !error && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <h2 style={{ 
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
                margin: 0
              }}>
                {t('jwtDebug.components')}
              </h2>
              <a
                href={`https://jwt.io/#debugger-io?token=${encodeURIComponent(token)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0051cc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0070f3'}
              >
                {t('jwtDebug.viewOnJwtIo')}
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>

            {/* jwt.io note */}
            <div style={{
              padding: 'clamp(0.5rem, 2vw, 1rem)',
              backgroundColor: '#fff3cd',
              color: '#856404',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
              fontStyle: 'italic'
            }}>
              {t('jwtDebug.jwtIoNote')}
            </div>
            
            {/* Raw Token */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                fontSize: 'clamp(0.9rem, 1.8vw, 1rem)', 
                marginBottom: '0.5rem', 
                color: '#6c757d' 
              }}>
                {t('jwtDebug.rawToken')}
              </h3>
              <div style={{ 
                padding: 'clamp(0.5rem, 2vw, 1rem)', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: 'clamp(0.7rem, 1.3vw, 0.875rem)',
                wordBreak: 'break-all',
                border: '1px solid #dee2e6',
                overflowX: 'auto'
              }}>
                {token}
              </div>
            </div>

            {/* Header */}
            {decodedHeader && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: 'clamp(0.9rem, 1.8vw, 1rem)', 
                  marginBottom: '0.5rem', 
                  color: '#6c757d' 
                }}>
                  {t('jwtDebug.header')}
                </h3>
                <div style={{ 
                  padding: 'clamp(0.5rem, 2vw, 1rem)', 
                  backgroundColor: '#e9ecef', 
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                  overflowX: 'auto'
                }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)'
                  }}>
                    <tbody>
                      {Object.entries(decodedHeader).map(([key, value]) => (
                        <tr key={key}>
                          <td style={{ 
                            padding: '0.5rem', 
                            borderBottom: '1px solid #dee2e6',
                            fontWeight: 'bold',
                            width: isMobile ? '100px' : '200px',
                            verticalAlign: 'top'
                          }}>
                            {key}
                          </td>
                          <td style={{ 
                            padding: '0.5rem', 
                            borderBottom: '1px solid #dee2e6',
                            fontFamily: 'monospace',
                            fontSize: 'clamp(0.7rem, 1.3vw, 0.875rem)',
                            wordBreak: 'break-word'
                          }}>
                            {renderValue(value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payload */}
            {decodedPayload && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: 'clamp(0.9rem, 1.8vw, 1rem)', 
                  marginBottom: '0.5rem', 
                  color: '#6c757d' 
                }}>
                  {t('jwtDebug.payload')}
                </h3>
                <div style={{ 
                  padding: 'clamp(0.5rem, 2vw, 1rem)', 
                  backgroundColor: '#e9ecef', 
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                  overflowX: 'auto'
                }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)'
                  }}>
                    <tbody>
                      {Object.entries(decodedPayload).map(([key, value]) => (
                        <tr key={key}>
                          <td style={{ 
                            padding: '0.5rem', 
                            borderBottom: '1px solid #dee2e6',
                            fontWeight: 'bold',
                            width: isMobile ? '100px' : '200px',
                            verticalAlign: 'top'
                          }}>
                            {key}
                          </td>
                          <td style={{ 
                            padding: '0.5rem', 
                            borderBottom: '1px solid #dee2e6',
                            fontFamily: 'monospace',
                            fontSize: 'clamp(0.7rem, 1.3vw, 0.875rem)',
                            wordBreak: 'break-word'
                          }}>
                            {/* Special handling for timestamps */}
                            {(key === 'iat' || key === 'exp' || key === 'nbf') && typeof value === 'number'
                              ? (
                                <div>
                                  <div>{value}</div>
                                  <div style={{ 
                                    fontSize: 'clamp(0.65rem, 1.2vw, 0.75rem)', 
                                    color: '#6c757d' 
                                  }}>
                                    {formatTimestamp(value)}
                                  </div>
                                </div>
                              )
                              : renderValue(value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Token validity info */}
                  {decodedPayload.exp && (
                    <div style={{ 
                      marginTop: '1rem',
                      padding: 'clamp(0.4rem, 1vw, 0.5rem)',
                      backgroundColor: new Date(decodedPayload.exp * 1000) > new Date() ? '#d4edda' : '#f8d7da',
                      color: new Date(decodedPayload.exp * 1000) > new Date() ? '#155724' : '#721c24',
                      borderRadius: '4px',
                      fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)'
                    }}>
                      {new Date(decodedPayload.exp * 1000) > new Date() 
                        ? t('jwtDebug.tokenValid')
                        : t('jwtDebug.tokenExpired')}
                      {new Date(decodedPayload.exp * 1000) > new Date() && 
                        ` ${t('jwtDebug.expiresIn', { minutes: getExpiryMinutes(decodedPayload.exp) })}`
                      }
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Signature */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                fontSize: 'clamp(0.9rem, 1.8vw, 1rem)', 
                marginBottom: '0.5rem', 
                color: '#6c757d' 
              }}>
                {t('jwtDebug.signature')}
              </h3>
              <div style={{ 
                padding: 'clamp(0.5rem, 2vw, 1rem)', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: 'clamp(0.7rem, 1.3vw, 0.875rem)',
                wordBreak: 'break-all',
                border: '1px solid #dee2e6',
                overflowX: 'auto'
              }}>
                {token.split('.')[2]}
              </div>
              <div style={{ 
                marginTop: '0.5rem',
                fontSize: 'clamp(0.7rem, 1.2vw, 0.75rem)',
                color: '#6c757d',
                fontStyle: 'italic'
              }}>
                {t('jwtDebug.signatureNote')}
              </div>
            </div>
          </div>
        )}

        {!token && (
          <div style={{ 
            marginTop: '2rem',
            padding: 'clamp(1rem, 3vw, 2rem)',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            textAlign: 'center',
            color: '#6c757d',
            fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)'
          }}>
            {t('jwtDebug.noToken')}
          </div>
        )}
      </div>
    </div>
  );
}