'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AuthStatusProps } from '@/types/common';

export default function AuthStatus({ onAuthChange }: AuthStatusProps = {}) {
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const t = useTranslations();

  const checkAuth = () => {
    const token = localStorage.getItem('iiif_access_token');
    setCurrentToken(token);
    if (onAuthChange) {
      onAuthChange(token);
    }
  };

  useEffect(() => {
    // Initial check
    checkAuth();

    // Listen for storage events (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'iiif_access_token') {
        checkAuth();
      }
    };

    // Listen for custom events (from same tab)
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('iiif_access_token');
    setCurrentToken(null);
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('auth-changed'));
    
    // Reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div>
      <div style={{
        marginBottom: '1rem',
        padding: '0.5rem',
        backgroundColor: currentToken ? '#d4edda' : '#f8d7da',
        color: currentToken ? '#155724' : '#721c24',
        borderRadius: '4px',
        fontSize: '0.875rem'
      }}>
        {t('authStatus.status')}: {currentToken ? t('authStatus.authenticated') : t('authStatus.notAuthenticated')}
        {currentToken && (
          <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', opacity: 0.7 }}>
            {t('authStatus.tokenPrefix')}: {currentToken.substring(0, 20)}...
          </div>
        )}
      </div>
      
      <button
        onClick={clearAuth}
        style={{
          padding: '0.25rem 0.5rem',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        {t('common.clearAuthentication')}
      </button>
    </div>
  );
}