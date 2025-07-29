'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitch from './LanguageSwitch';

export default function ResponsiveHeader() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    { href: '/mirador.html', label: t('navigation.mirador'), isStatic: true },
    { href: '/viewer-kiosk', label: t('navigation.kioskViewer') },
  ];

  const debugLinks = [
    { href: '/jwt-debug', label: t('navigation.jwtDebug') },
    { href: '/info-json-debug', label: t('navigation.infoJsonDebug') },
    { href: '/probe-debug', label: t('navigation.probeDebug') },
    { href: '/token-debug', label: t('navigation.tokenDebug') },
  ];

  const allLinks = [...navLinks, ...debugLinks];

  const renderLink = (link: any, index: number) => {
    const href = link.isStatic ? link.href : `/${locale}${link.href}`;
    const isActive = pathname === href || (link.isStatic && pathname.includes(link.href));
    
    if (link.isStatic) {
      return (
        <a
          key={index}
          href={`${href}?locale=${locale}`}
          onClick={() => setMobileMenuOpen(false)}
          style={{
            color: isActive ? '#4CAF50' : 'white',
            textDecoration: 'none',
            padding: '0.75rem 1rem',
            display: 'block',
            borderBottom: '1px solid #333',
            backgroundColor: isActive ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {link.label}
        </a>
      );
    }
    
    return (
      <Link
        key={index}
        href={href}
        onClick={() => setMobileMenuOpen(false)}
        style={{
          color: isActive ? '#4CAF50' : 'white',
          textDecoration: 'none',
          padding: '0.75rem 1rem',
          display: 'block',
          borderBottom: '1px solid #333',
          backgroundColor: isActive ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <>
      <header style={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '0.75rem 1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Logo */}
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
              cursor: 'pointer'
            }}>
              IIIF Auth Demo
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav style={{
            display: 'none',
            gap: '1rem',
            alignItems: 'center'
          }} className="desktop-nav">
            {navLinks.map((link, index) => {
              const href = link.isStatic ? link.href : `/${locale}${link.href}`;
              const isActive = pathname === href || (link.isStatic && pathname.includes(link.href));
              
              if (link.isStatic) {
                return (
                  <a
                    key={index}
                    href={`${href}?locale=${locale}`}
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
                  </a>
                );
              }
              
              return (
                <Link
                  key={index}
                  href={href}
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
            
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem',
              borderLeft: '1px solid #444',
              paddingLeft: '1rem',
              marginLeft: '0.5rem'
            }}>
              {debugLinks.map((link, index) => {
                const localizedHref = `/${locale}${link.href}`;
                const isActive = pathname === localizedHref;
                
                return (
                  <Link
                    key={index}
                    href={localizedHref}
                    style={{
                      color: isActive ? '#4CAF50' : '#999',
                      textDecoration: 'none',
                      fontSize: '0.75rem',
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'block',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
            className="mobile-menu-button"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#1a1a1a',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000
          }}>
            {allLinks.map((link, index) => renderLink(link, index))}
            
            <div style={{ 
              padding: '1rem',
              borderBottom: '1px solid #333'
            }}>
              <LanguageSwitch />
            </div>
            
            <div style={{ padding: '1rem' }}>
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
                    width: '100%'
                  }}
                >
                  {t('common.logout')}
                </button>
              ) : (
                <button
                  onClick={() => {
                    window.location.href = `/${locale}/auth`;
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    width: '100%'
                  }}
                >
                  {t('common.login')}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* CSS for media queries */}
      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-button {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-button {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}