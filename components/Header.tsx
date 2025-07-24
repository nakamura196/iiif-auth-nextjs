'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitch from './LanguageSwitch';

export default function Header() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const t = useTranslations();
  const locale = useLocale();

  // Check authentication status
  const checkAuth = () => {
    const token = localStorage.getItem('iiif_access_token');
    setIsAuthenticated(!!token);
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

    // Check on route changes
    checkAuth();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('iiif_access_token');
    setIsAuthenticated(false);
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('auth-changed'));
    
    window.location.href = `/${locale}`;
  };

  const navLinks = [
    { href: '/viewer-simple', label: t('navigation.simpleViewer') },
    { href: '/viewer-openseadragon', label: t('navigation.openSeadragon') },
    { href: '/viewer-leaflet', label: t('navigation.leafletIIIF') },
    { href: '/viewer', label: t('navigation.mirador') },
  ];

  const debugLinks = [
    { href: '/jwt-debug', label: t('navigation.jwtDebug') },
    { href: '/info-json-debug', label: t('navigation.infoJsonDebug') },
    { href: '/probe-debug', label: t('navigation.probeDebug') },
    { href: '/token-debug', label: t('navigation.tokenDebug') },
  ];

  return (
    <header style={{
      backgroundColor: '#1a1a1a',
      color: 'white',
      padding: '0.75rem 2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <Link 
            href={`/${locale}`}
            style={{
              textDecoration: 'none',
              color: 'white'
            }}
          >
            <h1 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            >
              IIIF Auth Demo
            </h1>
          </Link>
        </div>
        
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, marginLeft: '3rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {navLinks.map(link => {
              const localizedHref = `/${locale}${link.href}`;
              const isActive = pathname === localizedHref || pathname === `/${locale}` && link.href === '/';
              
              return (
                <Link
                  key={link.href}
                  href={localizedHref}
                  style={{
                    color: isActive ? '#4CAF50' : 'white',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#81C784';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginLeft: 'auto',
            borderLeft: '1px solid #444',
            paddingLeft: '1rem'
          }}>
            {debugLinks.map(link => {
              const localizedHref = `/${locale}${link.href}`;
              const isActive = pathname === localizedHref;
              
              return (
                <Link
                  key={link.href}
                  href={localizedHref}
                  style={{
                    color: isActive ? '#4CAF50' : '#999',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#ccc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#999';
                    }
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          
          <LanguageSwitch />
          
          <div style={{
            paddingLeft: '1rem',
            borderLeft: '1px solid #444'
          }}>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d32f2f';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f44336';
                }}
              >
                {t('common.logout')}
              </button>
            ) : (
              <button
                onClick={() => window.location.href = `/${locale}/auth`}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#45a049';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#4CAF50';
                }}
              >
                {t('common.login')}
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}