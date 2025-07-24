'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import AuthStatus from '@/components/AuthStatus';
import { ImageInfo } from '@/types/common';

export default function InfoJsonDebugPage() {
  const t = useTranslations();
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [rawJson, setRawJson] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [imageId, setImageId] = useState<string>('sample');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 600);
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
  };

  const loadImageInfo = async () => {
    setLoading(true);
    setError('');
    setImageInfo(null);
    setRawJson('');

    try {
      const infoUrl = `/api/iiif/image/${imageId}/info.json`;
      const headers: HeadersInit = {};
      
      if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
      }

      const response = await fetch(infoUrl, { headers });
      const text = await response.text();
      
      if (response.ok) {
        const data = JSON.parse(text);
        setImageInfo(data);
        setRawJson(JSON.stringify(data, null, 2));
      } else {
        setError(`HTTP ${response.status}: ${response.statusText}`);
        
        // Try to parse and display error response
        try {
          const errorData = JSON.parse(text);
          setRawJson(JSON.stringify(errorData, null, 2));
        } catch {
          setRawJson(text);
        }
      }
    } catch (err) {
      setError(`${t('common.error')}: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderValue = (value: any): JSX.Element => {
    if (Array.isArray(value)) {
      return (
        <div style={{ marginLeft: '1rem' }}>
          [
          {value.map((item, index) => (
            <div key={index} style={{ marginLeft: '1rem' }}>
              {typeof item === 'object' ? (
                <div>{renderObject(item)}</div>
              ) : (
                <span>&quot;{item}&quot;{index < value.length - 1 ? ',' : ''}</span>
              )}
            </div>
          ))}
          ]
        </div>
      );
    } else if (typeof value === 'object' && value !== null) {
      return <div style={{ marginLeft: '1rem' }}>{renderObject(value)}</div>;
    } else if (typeof value === 'string') {
      return <span>&quot;{value}&quot;</span>;
    } else {
      return <span>{String(value)}</span>;
    }
  };

  const renderObject = (obj: any): JSX.Element => {
    return (
      <div>
        {'{'}
        {Object.entries(obj).map(([key, value], index, array) => (
          <div key={key} style={{ marginLeft: '1rem' }}>
            <span style={{ color: '#0969da' }}>&quot;{key}&quot;</span>: {renderValue(value)}
            {index < array.length - 1 ? ',' : ''}
          </div>
        ))}
        {'}'}
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
          {t('infoJsonDebug.title')}
        </h1>
        
        <AuthStatus onAuthChange={handleAuthChange} />

        <div style={{ marginTop: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: '1rem', 
            alignItems: isMobile ? 'stretch' : 'center' 
          }}>
            <label htmlFor="imageId" style={{ 
              fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)',
              minWidth: 'fit-content'
            }}>
              {t('infoJsonDebug.imageId')}:
            </label>
            <input
              id="imageId"
              type="text"
              value={imageId}
              onChange={(e) => setImageId(e.target.value)}
              placeholder={t('infoJsonDebug.enterImageId')}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)',
                flex: isMobile ? '1' : '0 1 200px',
                minWidth: 0
              }}
            />
            <button
              onClick={loadImageInfo}
              disabled={loading || !imageId}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || !imageId ? 'not-allowed' : 'pointer',
                fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)',
                whiteSpace: 'nowrap'
              }}
            >
              {loading ? t('common.loading') : t('infoJsonDebug.loadInfoJson')}
            </button>
          </div>
          
          <div style={{ 
            marginTop: '0.5rem', 
            fontSize: 'clamp(0.7rem, 1.2vw, 0.75rem)', 
            color: '#6c757d',
            wordBreak: 'break-all'
          }}>
            {t('infoJsonDebug.endpoint')}: /api/iiif/image/{'{imageId}'}/info.json
          </div>
        </div>

        {error && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: '#f8d7da', 
            color: '#721c24',
            borderRadius: '4px',
            fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)'
          }}>
            {error}
          </div>
        )}

        {rawJson && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ 
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
              marginBottom: '1rem' 
            }}>
              {t('infoJsonDebug.response')}
            </h2>
            
            {/* Formatted View */}
            {imageInfo && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: 'clamp(0.9rem, 1.8vw, 1rem)', 
                  marginBottom: '0.5rem', 
                  color: '#6c757d' 
                }}>
                  {t('infoJsonDebug.formattedView')}
                </h3>
                <div style={{ 
                  padding: 'clamp(0.5rem, 2vw, 1rem)', 
                  backgroundColor: '#f8f9fa', 
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
                      <tr>
                        <td style={{ 
                          padding: '0.5rem', 
                          borderBottom: '1px solid #dee2e6', 
                          fontWeight: 'bold',
                          minWidth: '100px'
                        }}>
                          {t('infoJsonDebug.context')}
                        </td>
                        <td style={{ 
                          padding: '0.5rem', 
                          borderBottom: '1px solid #dee2e6',
                          wordBreak: 'break-word'
                        }}>
                          {Array.isArray(imageInfo['@context']) 
                            ? imageInfo['@context'].join(', ') 
                            : imageInfo['@context']}
                        </td>
                      </tr>
                      {imageInfo.id && (
                        <tr>
                          <td style={{ 
                            padding: '0.5rem', 
                            borderBottom: '1px solid #dee2e6', 
                            fontWeight: 'bold' 
                          }}>
                            ID
                          </td>
                          <td style={{ 
                            padding: '0.5rem', 
                            borderBottom: '1px solid #dee2e6', 
                            fontFamily: 'monospace', 
                            fontSize: 'clamp(0.7rem, 1.3vw, 0.875rem)',
                            wordBreak: 'break-all'
                          }}>
                            {imageInfo.id}
                          </td>
                        </tr>
                      )}
                      {imageInfo.type && (
                        <tr>
                          <td style={{ 
                            padding: '0.5rem', 
                            borderBottom: '1px solid #dee2e6', 
                            fontWeight: 'bold' 
                          }}>
                            Type
                          </td>
                          <td style={{ 
                            padding: '0.5rem', 
                            borderBottom: '1px solid #dee2e6' 
                          }}>
                            {imageInfo.type}
                          </td>
                        </tr>
                      )}
                      {imageInfo.profile && (
                        <tr>
                          <td style={{ 
                            padding: '0.5rem', 
                            borderBottom: '1px solid #dee2e6', 
                            fontWeight: 'bold' 
                          }}>
                            Profile
                          </td>
                          <td style={{ 
                            padding: '0.5rem', 
                            borderBottom: '1px solid #dee2e6',
                            wordBreak: 'break-word'
                          }}>
                            {typeof imageInfo.profile === 'string' ? imageInfo.profile : JSON.stringify(imageInfo.profile)}
                          </td>
                        </tr>
                      )}
                      {imageInfo.width !== undefined && (
                        <tr>
                          <td style={{ 
                            padding: '0.5rem', 
                            borderBottom: '1px solid #dee2e6', 
                            fontWeight: 'bold' 
                          }}>
                            {t('infoJsonDebug.dimensions')}
                          </td>
                          <td style={{ 
                            padding: '0.5rem', 
                            borderBottom: '1px solid #dee2e6' 
                          }}>
                            {t('infoJsonDebug.pixels', { 
                              width: imageInfo.width, 
                              height: imageInfo.height 
                            })}
                          </td>
                        </tr>
                      )}
                      {imageInfo.service && imageInfo.service.length > 0 && (
                        <tr>
                          <td style={{ 
                            padding: '0.5rem', 
                            borderBottom: '1px solid #dee2e6', 
                            fontWeight: 'bold', 
                            verticalAlign: 'top' 
                          }}>
                            {t('infoJsonDebug.services')}
                          </td>
                          <td style={{ 
                            padding: '0.5rem', 
                            borderBottom: '1px solid #dee2e6' 
                          }}>
                            {imageInfo.service.map((service, index) => (
                              <div key={index} style={{ 
                                marginBottom: index < imageInfo.service!.length - 1 ? '0.5rem' : '0',
                                padding: 'clamp(0.3rem, 1vw, 0.5rem)',
                                backgroundColor: '#e9ecef',
                                borderRadius: '4px',
                                fontSize: 'clamp(0.7rem, 1.3vw, 0.875rem)'
                              }}>
                                <strong>{t('infoJsonDebug.service')} {index + 1}:</strong>
                                <div style={{ 
                                  marginLeft: 'clamp(0.5rem, 2vw, 1rem)', 
                                  marginTop: '0.25rem' 
                                }}>
                                  {service['@context'] && (
                                    <div style={{ wordBreak: 'break-word' }}>
                                      {t('infoJsonDebug.context')}: {service['@context']}
                                    </div>
                                  )}
                                  {(service as any).id && (
                                    <div style={{ wordBreak: 'break-all' }}>
                                      ID: <code>{(service as any).id}</code>
                                    </div>
                                  )}
                                  {service.type && (
                                    <div>Type: {service.type}</div>
                                  )}
                                  {service.profile && (
                                    <div style={{ wordBreak: 'break-word' }}>
                                      Profile: {service.profile}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Raw JSON */}
            <div>
              <h3 style={{ 
                fontSize: 'clamp(0.9rem, 1.8vw, 1rem)', 
                marginBottom: '0.5rem', 
                color: '#6c757d' 
              }}>
                {t('infoJsonDebug.rawJson')}
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
                {rawJson}
              </pre>
            </div>

            {/* Syntax Highlighted View */}
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ 
                fontSize: 'clamp(0.9rem, 1.8vw, 1rem)', 
                marginBottom: '0.5rem', 
                color: '#6c757d' 
              }}>
                {t('infoJsonDebug.syntaxHighlighted')}
              </h3>
              <div style={{ 
                padding: 'clamp(0.5rem, 2vw, 1rem)', 
                backgroundColor: '#282c34', 
                color: '#abb2bf',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: 'clamp(0.7rem, 1.3vw, 0.875rem)',
                overflow: 'auto',
                maxHeight: '400px'
              }}>
                {imageInfo && renderObject(imageInfo)}
              </div>
            </div>
          </div>
        )}

        {!loading && !rawJson && (
          <div style={{ 
            marginTop: '2rem',
            padding: 'clamp(1rem, 3vw, 2rem)',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            textAlign: 'center',
            color: '#6c757d',
            fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)'
          }}>
            {t('infoJsonDebug.enterImageIdMessage')}
          </div>
        )}
      </div>
    </div>
  );
}