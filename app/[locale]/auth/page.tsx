'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('pass');
  const [error, setError] = useState('');
  
  const origin = searchParams.get('origin');
  const messageId = searchParams.get('messageId');
  
  // Debug information
  useEffect(() => {
    console.log('Auth page loaded with:', {
      origin,
      messageId,
      opener: !!window.opener,
      referrer: document.referrer
    });
  }, [origin, messageId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('/api/iiif/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Store token in localStorage
        localStorage.setItem('iiif_access_token', data.accessToken);
        
        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new Event('auth-changed'));
        
        if (window.opener && origin) {
          // IIIF popup flow
          console.log('Sending postMessage to opener:', {
            messageId,
            accessToken: data.accessToken,
            origin
          });
          
          // Try to send message to opener
          try {
            window.opener.postMessage({
              messageId: messageId || data.messageId,
              accessToken: data.accessToken,
              expiresIn: data.expiresIn,
              '@context': 'http://iiif.io/api/auth/2/context.json',
              type: 'AuthAccessToken2'
            }, origin);
            
            // Give time for message to be received
            setTimeout(() => {
              window.close();
            }, 100);
          } catch (err) {
            console.error('Failed to send postMessage:', err);
            setError('Failed to communicate with parent window');
          }
        } else if (window.opener) {
          // If we have opener but no origin, try using referrer
          const fallbackOrigin = document.referrer ? new URL(document.referrer).origin : window.location.origin;
          console.log('Using fallback origin:', fallbackOrigin);
          
          try {
            window.opener.postMessage({
              messageId: messageId || data.messageId,
              accessToken: data.accessToken,
              expiresIn: data.expiresIn,
              '@context': 'http://iiif.io/api/auth/2/context.json',
              type: 'AuthAccessToken2'
            }, fallbackOrigin);
            
            setTimeout(() => {
              window.close();
            }, 100);
          } catch (err) {
            console.error('Failed to send postMessage with fallback:', err);
            // Fallback to redirect
            window.location.href = '/';
          }
        } else {
          // Direct login flow - redirect to home
          window.location.href = '/';
        }
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Authentication failed');
    }
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '2rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fff'
      }}>
        <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          IIIF Authentication Demo
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
              required
            />
          </div>
          
          {error && (
            <div style={{ 
              color: 'red', 
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Log In
          </button>
        </form>
        
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
          Demo credentials: user/pass
        </p>
      </div>
    </div>
  );
}