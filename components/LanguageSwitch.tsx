'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    // Remove the current locale from the pathname
    const segments = pathname.split('/');
    segments[1] = newLocale; // Replace locale segment
    const newPath = segments.join('/');
    
    router.push(newPath);
  };

  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
      marginRight: '1rem'
    }}>
      <button
        onClick={() => switchLanguage('en')}
        style={{
          padding: '0.25rem 0.5rem',
          backgroundColor: locale === 'en' ? '#4CAF50' : 'transparent',
          color: locale === 'en' ? 'white' : '#999',
          border: '1px solid #444',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.875rem',
          transition: 'all 0.2s'
        }}
      >
        EN
      </button>
      <button
        onClick={() => switchLanguage('ja')}
        style={{
          padding: '0.25rem 0.5rem',
          backgroundColor: locale === 'ja' ? '#4CAF50' : 'transparent',
          color: locale === 'ja' ? 'white' : '#999',
          border: '1px solid #444',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.875rem',
          transition: 'all 0.2s'
        }}
      >
        日本語
      </button>
    </div>
  );
}