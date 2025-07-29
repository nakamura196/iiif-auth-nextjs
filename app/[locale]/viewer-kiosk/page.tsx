'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import AuthStatus from '@/components/AuthStatus';

export default function KioskViewerPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [infoJson, setInfoJson] = useState<any>(null);

  const handleConfirm = async () => {
    setShowConfirmation(false);
    
    // Kiosk mode doesn't require authentication, but needs confirmation
    const kioskToken = 'kiosk-confirmed-' + Date.now();
    sessionStorage.setItem('iiif_kiosk_token', kioskToken);
    
    // Load the image with kiosk token
    const imageServiceUrl = `${window.location.origin}/api/iiif/image/kiosk`;
    const url = `${imageServiceUrl}/full/max/0/default.jpg?kiosk=${kioskToken}`;
    setImageUrl(url);
  };

  const handleDecline = () => {
    setError(t('kioskViewer.accessDenied'));
    setShowConfirmation(false);
  };

  // Fetch info.json on component mount
  useEffect(() => {
    const fetchInfoJson = async () => {
      try {
        const response = await fetch(`/api/iiif/image/kiosk/info.json?locale=${locale}`);
        if (response.ok) {
          const data = await response.json();
          setInfoJson(data);
        }
      } catch (err) {
        console.error('Failed to fetch info.json:', err);
      }
    };
    
    fetchInfoJson();
  }, [locale]);

  // Get the auth service details from info.json
  const authService = infoJson?.service?.[0];
  const getLocalizedText = (field: any) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (Array.isArray(field[locale])) return field[locale][0];
    if (Array.isArray(field.en)) return field.en[0];
    return '';
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '800px',
        margin: '0 auto',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '2rem' }}>
          <h1 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>{t('kioskViewer.title')}</h1>
          
          {showConfirmation && (
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: '2rem',
              borderRadius: '8px',
              textAlign: 'center',
              marginTop: '2rem'
            }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                marginBottom: '1rem',
                color: '#333'
              }}>
                {authService ? getLocalizedText(authService.heading) : t('kioskViewer.confirmationTitle')}
              </h2>
              
              <p style={{ 
                marginBottom: '1.5rem',
                lineHeight: '1.6',
                color: '#666'
              }}>
                {authService ? getLocalizedText(authService.note) : t('kioskViewer.confirmationMessage')}
              </p>
              
              <div style={{
                backgroundColor: '#fff',
                padding: '1rem',
                borderRadius: '4px',
                marginBottom: '1.5rem',
                border: '1px solid #ddd'
              }}>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  {t('kioskViewer.termsText')}
                </p>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                justifyContent: 'center'
              }}>
                <button
                  onClick={handleConfirm}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 2rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#45a049';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#4CAF50';
                  }}
                >
                  {authService ? getLocalizedText(authService.confirmLabel) : t('kioskViewer.acceptButton')}
                </button>
                
                <button
                  onClick={handleDecline}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 2rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#d32f2f';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f44336';
                  }}
                >
                  {t('kioskViewer.declineButton')}
                </button>
              </div>
            </div>
          )}
          
          {!showConfirmation && !error && imageUrl && (
            <div>
              <p style={{ 
                marginBottom: '1rem',
                color: '#4CAF50',
                fontWeight: 'bold'
              }}>
                {t('kioskViewer.accessGranted')}
              </p>
              
              <div style={{
                backgroundColor: '#000',
                borderRadius: '8px',
                overflow: 'hidden',
                marginTop: '1rem'
              }}>
                <img 
                  src={imageUrl} 
                  alt={t('viewers.protectedImage')}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                  onError={() => {
                    setError(t('viewers.errorLoadingImage'));
                    setImageUrl(null);
                  }}
                />
              </div>
              
              <p style={{
                marginTop: '1rem',
                fontSize: '0.875rem',
                color: '#666',
                textAlign: 'center'
              }}>
                {t('kioskViewer.sessionInfo')}
              </p>
            </div>
          )}
          
          {error && (
            <div style={{
              backgroundColor: '#ffebee',
              padding: '1.5rem',
              borderRadius: '8px',
              textAlign: 'center',
              marginTop: '2rem'
            }}>
              <p style={{ 
                margin: 0,
                color: '#c62828',
                fontWeight: 'bold'
              }}>
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div style={{
        maxWidth: '800px',
        margin: '2rem auto',
        padding: '1.5rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>
          {t('kioskViewer.aboutTitle')}
        </h3>
        <p style={{ margin: '0 0 0.5rem 0', lineHeight: '1.6' }}>
          {t('kioskViewer.aboutDescription')}
        </p>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          <li>{t('kioskViewer.feature1')}</li>
          <li>{t('kioskViewer.feature2')}</li>
          <li>{t('kioskViewer.feature3')}</li>
        </ul>
        
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #ddd'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
            {t('kioskViewer.technicalDetails')}
          </h4>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>
            {t('kioskViewer.infoJsonDescription')}
          </p>
          
          {authService && (
            <div style={{
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '4px',
              border: '1px solid #e0e0e0',
              textAlign: 'left'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 'bold' }}>
                {t('kioskViewer.authServiceInfo')}:
              </p>
              <ul style={{ margin: '0', paddingLeft: '1.5rem', fontSize: '0.875rem' }}>
                <li><strong>Profile:</strong> {authService.profile}</li>
                <li><strong>Label:</strong> {getLocalizedText(authService.label)}</li>
                <li><strong>Heading:</strong> {getLocalizedText(authService.heading)}</li>
                <li><strong>Note:</strong> {getLocalizedText(authService.note)}</li>
                <li><strong>Confirm Label:</strong> {getLocalizedText(authService.confirmLabel)}</li>
              </ul>
            </div>
          )}
          
          <a
            href="/api/iiif/image/kiosk/info.json"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#1976d2',
              textDecoration: 'none',
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            /api/iiif/image/kiosk/info.json
            <span style={{ fontSize: '0.75rem' }}>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}