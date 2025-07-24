const createNextIntlPlugin = require('next-intl/plugin');
 
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Suppress next-intl warning
  env: {
    _next_intl_trailing_slash: ''
  }
}

module.exports = withNextIntl(nextConfig)