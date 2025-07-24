import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
 
// Can be imported from a shared config
const locales = ['en', 'ja'];
 
export default getRequestConfig(async (params) => {
  // Use the new requestLocale API
  const requestLocale = await params.requestLocale;
  const locale = requestLocale || 'en';
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});