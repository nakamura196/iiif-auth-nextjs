'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import AuthStatus from '@/components/AuthStatus';
import { TokenServiceTest } from '@/types/common';

export default function TokenDebugPage() {
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [testConfig, setTestConfig] = useState<TokenServiceTest>({
    messageId: '',
    origin: ''
  });
  const [tokenUrl, setTokenUrl] = useState<string>('');
  const [receivedMessage, setReceivedMessage] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [listening, setListening] = useState(false);
  const t = useTranslations();

  // Handle auth changes from AuthStatus component
  const handleAuthChange = (token: string | null) => {
    setCurrentToken(token);
  };

  // Initialize with current origin
  useEffect(() => {
    setTestConfig({
      messageId: crypto.randomUUID(),
      origin: window.location.origin
    });
  }, []);

  // Setup message listener
  useEffect(() => {
    if (!listening) return;

    const handleMessage = (event: MessageEvent) => {
      
      // Verify origin
      if (event.origin !== window.location.origin) {
        console.warn('Message from unexpected origin:', event.origin);
        return;
      }

      // Check if this is our message
      if (event.data.messageId === testConfig.messageId) {
        setReceivedMessage(event.data);
        setListening(false);
        
        // Close the popup if it exists
        if (testConfig.windowRef && !testConfig.windowRef.closed) {
          testConfig.windowRef.close();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [listening, testConfig]);

  const generateTokenUrl = () => {
    const url = new URL('/api/iiif/token', window.location.origin);
    url.searchParams.set('messageId', testConfig.messageId);
    url.searchParams.set('origin', testConfig.origin);
    
    if (currentToken) {
      url.searchParams.set('accessToken', currentToken);
    }
    
    setTokenUrl(url.toString());
    return url.toString();
  };

  const openTokenService = () => {
    setError('');
    setReceivedMessage(null);
    
    const url = generateTokenUrl();
    
    try {
      // Start listening for messages
      setListening(true);
      
      // Open popup window
      const authWindow = window.open(url, 'token-debug', 'width=600,height=600');
      
      if (!authWindow) {
        setError(t('tokenDebug.popupBlocked'));
        setListening(false);
        return;
      }
      
      setTestConfig({ ...testConfig, windowRef: authWindow });
      
      // Set timeout for response
      setTimeout(() => {
        if (listening) {
          setError(t('tokenDebug.timeout'));
          setListening(false);
          if (authWindow && !authWindow.closed) {
            authWindow.close();
          }
        }
      }, 30000); // 30 second timeout
      
    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
      setListening(false);
    }
  };

  const directFetch = async () => {
    setError('');
    setReceivedMessage(null);
    
    const url = generateTokenUrl();
    
    try {
      const response = await fetch(url, {
        redirect: 'manual' // Don't follow redirects automatically
      });
      
      // Check if it's a redirect (302)
      if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 0) {
        setError(t('tokenDebug.redirected'));
        return;
      }
      
      const text = await response.text();
      
      // Extract the postMessage data from HTML response
      const messageMatch = text.match(/window\.opener\.postMessage\((\{[\s\S]*?\})\s*,\s*"[^"]*"\)/);
      if (messageMatch) {
        try {
          // Parse the JSON object from the postMessage call
          const messageData = messageMatch[1]
            .replace(/messageId:\s*"([^"]*)"/, '"messageId": "$1"')
            .replace(/accessToken:\s*"([^"]*)"/, '"accessToken": "$1"')
            .replace(/expiresIn:\s*(\d+)/, '"expiresIn": $1');
          
          const parsed = JSON.parse(messageData);
          setReceivedMessage(parsed);
        } catch (e) {
          console.error('Parse error:', e);
          setError(t('tokenDebug.parseError'));
          
          // Show the raw match for debugging
        }
      } else {
        setError(t('tokenDebug.noPostMessage'));
      }
    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
      console.error('Fetch error:', err);
    }
  };

  return (
    <div style={{ padding: '0.5rem' }}>
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>{t('tokenDebug.title')}</h1>
        
        <AuthStatus onAuthChange={handleAuthChange} />

        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', marginBottom: '1rem' }}>{t('tokenDebug.testConfiguration')}</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
              {t('tokenDebug.messageId')}
            </label>
            <input
              type="text"
              value={testConfig.messageId}
              onChange={(e) => setTestConfig({ ...testConfig, messageId: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
              }}
            />
            <button
              onClick={() => setTestConfig({ ...testConfig, messageId: crypto.randomUUID() })}
              style={{
                marginTop: '0.25rem',
                padding: '0.25rem 0.5rem',
                fontSize: 'clamp(0.6875rem, 1.5vw, 0.75rem)',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {t('tokenDebug.generateNewId')}
            </button>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
              {t('tokenDebug.origin')}
            </label>
            <input
              type="text"
              value={testConfig.origin}
              onChange={(e) => setTestConfig({ ...testConfig, origin: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
              {t('tokenDebug.generatedUrl')}
            </label>
            <div style={{ 
              padding: '0.5rem', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              fontFamily: 'monospace',
              fontSize: 'clamp(0.6875rem, 1.5vw, 0.75rem)',
              wordBreak: 'break-all'
            }}>
              {tokenUrl || t('tokenDebug.clickGenerate')}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => generateTokenUrl()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
              }}
            >
              {t('tokenDebug.generateUrl')}
            </button>
            
            <button
              onClick={openTokenService}
              disabled={listening}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: listening ? 'not-allowed' : 'pointer',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
              }}
            >
              {listening ? t('tokenDebug.waitingForResponse') : t('tokenDebug.openTokenService')}
            </button>

            <button
              onClick={directFetch}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
              }}
            >
              {t('tokenDebug.directFetch')}
            </button>
          </div>
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

        {listening && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: '#fff3cd', 
            color: '#856404',
            borderRadius: '4px' 
          }}>
            {t('tokenDebug.waitingPostMessage')}
          </div>
        )}

        {receivedMessage && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', marginBottom: '1rem' }}>{t('tokenDebug.receivedMessage')}</h2>
            
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#d4edda', 
              color: '#155724',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}>
              ✅ {t('tokenDebug.successMessage')}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong>{t('tokenDebug.messageId')}:</strong> {receivedMessage.messageId}
            </div>
            
            {receivedMessage.accessToken && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>{t('tokenDebug.accessToken')}:</strong>
                <div style={{ 
                  marginTop: '0.25rem',
                  padding: '0.5rem', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: 'clamp(0.6875rem, 1.5vw, 0.75rem)',
                  wordBreak: 'break-all'
                }}>
                  {receivedMessage.accessToken}
                </div>
              </div>
            )}

            {receivedMessage.expiresIn && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>{t('tokenDebug.expiresIn')}:</strong> {receivedMessage.expiresIn} {t('tokenDebug.seconds', { seconds: receivedMessage.expiresIn })}
              </div>
            )}

            <div>
              <strong>{t('tokenDebug.rawMessageData')}:</strong>
              <pre style={{ 
                marginTop: '0.25rem',
                padding: '1rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                overflow: 'auto'
              }}>
                {JSON.stringify(receivedMessage, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div style={{ 
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{t('tokenDebug.howItWorks')}:</h3>
          <ol style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
            <li>{t('tokenDebug.step1')}</li>
            <li>{t('tokenDebug.step2')}
              <ul>
                <li>{t('tokenDebug.step2a')}</li>
                <li>{t('tokenDebug.step2b')}</li>
              </ul>
            </li>
            <li>{t('tokenDebug.step3')}</li>
            <li>{t('tokenDebug.step4')}</li>
          </ol>
        </div>
      </div>
    </div>
  );
}