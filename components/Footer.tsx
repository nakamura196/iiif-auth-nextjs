'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations();
  
  return (
    <footer style={{
      backgroundColor: '#2c2c2c',
      color: '#ccc',
      padding: '2rem 1rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            fontSize: 'clamp(1rem, 2vw, 1.1rem)',
            color: 'white'
          }}>
            {t('footer.title')}
          </h3>
          <p style={{
            margin: '0.5rem auto',
            fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)',
            lineHeight: '1.5',
            maxWidth: '600px'
          }}>
            {t('footer.description')}
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 'clamp(1rem, 3vw, 2rem)',
          marginBottom: '1.5rem',
          fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)'
        }}>
          <a
            href="https://iiif.io/api/auth/2.0/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#81C784',
              textDecoration: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(129, 199, 132, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {t('footer.authSpec')}
          </a>
          <a
            href="https://iiif.io/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#81C784',
              textDecoration: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(129, 199, 132, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {t('footer.iiifWebsite')}
          </a>
          <a
            href="/api/iiif/manifest/sample"
            target="_blank"
            style={{
              color: '#81C784',
              textDecoration: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(129, 199, 132, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {t('footer.sampleManifest')}
          </a>
        </div>
        
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid #444',
          fontSize: 'clamp(0.7rem, 1.2vw, 0.75rem)',
          color: '#999'
        }}>
          <p style={{ 
            margin: '0 0 0.5rem 0',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span>{t('footer.builtWith')}</span>
            <span>•</span>
            <span>{t('footer.demoCredentials')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}