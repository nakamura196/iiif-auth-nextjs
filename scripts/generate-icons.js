/**
 * Script to generate favicon and OGP images
 * This creates placeholder images for the IIIF Authentication Demo
 */

const fs = require('fs');
const path = require('path');

// Create a simple PNG favicon (32x32)
const createFavicon = () => {
  // This is a 32x32 blue square with "IIIF" text - base64 encoded PNG
  const faviconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKoSURBVFiFtZfPaxNBFMc/s5ts0qRJG0trbUGtCIL4A0QPBQ+CePDkwYMHL/4Bnrx48uRBEDx48iAePHgQxIMHL4IHQfAgCCKCWn+AtbW1TZomTbLZ3dkZD7vZZJNsEqvvZWDfzrz3/bz3ZnYGVlhhhaX0tPs8Ho/H4+n+Vvvv8Xg8nv8BoNPp+Hw+n8/nA8AwDMMwDKBP/38AAHRd13Vd7wZwOp1Op9MJYFmWZVlWJ4DT6XQ6nc5ugP8GAOByuVwul6sbwDAMwzCMbgCHw+FwOBydAC6Xy+VyuboB/hsAgMvlcrlcrnYAwzAMwzC6ARwOh8PhcLQDuN1ut9vtbgXo9gc7AT4C8HE58HK5XC6Xy9UJsFxf0KvP7Xa73W530+d2u91ut7sdoJfeH4AtW7Zs2bKl1pKamppKS0tLs2VZliRJkiQJwDRN0zRNgFKpVCqVSlWey+VyuVwuA6SlpKSkpKT6/f7Y2NjY2Fh9frm23t7e3t7emveZTCaTyWQALMuyLMtqBVjTbQH19va2AGzbNjY2NtaUUSqVSqVSadPS0qanp6e7D0CgfNkNsFDuVACXy+VyuVxVAADZbDabzWaB5gCV8kVHR0dHR0frAEzTNE3TbAdYjD8wDMO4ePEicP78+fPnzwM4HA6Hw+Fo63Ecx3Ecl52QJEmSJEGz8mu9RKPRaDQaXQTg9/v9fr8fyOVyuVwuB2BZlmVZVl2ZrusrPICGvz83Nzc3NzcHsFhfqtGKAQr379+/f/8+AKZpGqZpwuLKb8uv1kqlUqlUKrUDZAG+AXxramrqyJEjR44cAbBarValUinQcDabzZ47d+7cuXNAJpPJZDIZoJOVXakvANi3b9++ffsAVq9evXr16lWgmAZAEZgHvgPfgO9LS0tLS0sLc8uK/y8A/gA+tfLVAMsOhQAAAABJRU5ErkJggg==';
  
  const faviconBuffer = Buffer.from(faviconBase64, 'base64');
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), faviconBuffer);
  
  // Also create PNG versions
  fs.writeFileSync(path.join(__dirname, '../public/favicon-32x32.png'), faviconBuffer);
  fs.writeFileSync(path.join(__dirname, '../public/favicon-16x16.png'), faviconBuffer);
  
  console.log('✓ Created favicon files');
};

// Create OGP image (1200x630)
const createOGPImage = () => {
  // Create a simple OGP image - this is a placeholder blue rectangle with text
  // In production, you would use a proper image generation library
  const ogpSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <text x="600" y="280" font-family="Arial, sans-serif" font-size="72" font-weight="bold" text-anchor="middle" fill="white">IIIF Authentication API 2.0</text>
    <text x="600" y="350" font-family="Arial, sans-serif" font-size="32" text-anchor="middle" fill="white" opacity="0.9">Secure Image Delivery Demo</text>
    <g transform="translate(600, 450)">
      <rect x="-200" y="-30" width="400" height="60" rx="30" fill="white" opacity="0.2"/>
      <text x="0" y="8" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="white">Multiple Viewers • JWT Auth • Debug Tools</text>
    </g>
  </svg>`;
  
  fs.writeFileSync(path.join(__dirname, '../public/ogp-image.svg'), ogpSvg);
  
  // Note: In production, you would convert this SVG to PNG using a library like sharp or canvas
  // For now, we'll use the SVG directly or you can manually convert it
  console.log('✓ Created OGP image (SVG format - convert to PNG for production)');
};

// Create Apple touch icon
const createAppleTouchIcon = () => {
  // This is a 180x180 icon for Apple devices - using the same base64 as favicon for simplicity
  const iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKoSURBVFiFtZfPaxNBFMc/s5ts0qRJG0trbUGtCIL4A0QPBQ+CePDkwYMHL/4Bnrx48uRBEDx48iAePHgQxIMHL4IHQfAgCCKCWn+AtbW1TZomTbLZ3dkZD7vZZJNsEqvvZWDfzrz3/bz3ZnYGVlhhhaX0tPs8Ho/H4+n+Vvvv8Xg8nv8BoNPp+Hw+n8/nA8AwDMMwDKBP/38AAHRd13Vd7wZwOp1Op9MJYFmWZVlWJ4DT6XQ6nc5ugP8GAOByuVwul6sbwDAMwzCMbgCHw+FwOBydAC6Xy+VyuboB/hsAgMvlcrlcrnYAwzAMwzC6ARwOh8PhcLQDuN1ut9vtbgXo9gc7AT4C8HE58HK5XC6Xy9UJsFxf0KvP7Xa73W530+d2u91ut7sdoJfeH4AtW7Zs2bKl1pKamppKS0tLs2VZliRJkiQJwDRN0zRNgFKpVCqVSlWey+VyuVwuA6SlpKSkpKT6/f7Y2NjY2Fh9frm23t7e3t7emveZTCaTyWQALMuyLMtqBVjTbQH19va2AGzbNjY2NtaUUSqVSqVSadPS0qanp6e7D0CgfNkNsFDuVACXy+VyuVxVAADZbDabzWaB5gCV8kVHR0dHR0frAEzTNE3TbAdYjD8wDMO4ePEicP78+fPnzwM4HA6Hw+Fo63Ecx3Ecl52QJEmSJEGz8mu9RKPRaDQaXQTg9/v9fr8fyOVyuVwuB2BZlmVZVl2ZrusrPICGvz83Nzc3NzcHsFhfqtGKAQr379+/f/8+AKZpGqZpwuLKb8uv1kqlUqlUKrUDZAG+AXxramrqyJEjR44cAbBarValUinQcDabzZ47d+7cuXNAJpPJZDIZoJOVXakvANi3b9++ffsAVq9evXr16lWgmAZAEZgHvgPfgO9LS0tLS0sLc8uK/y8A/gA+tfLVAMsOhQAAAABJRU5ErkJggg==';
  
  const iconBuffer = Buffer.from(iconBase64, 'base64');
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), iconBuffer);
  
  console.log('✓ Created Apple touch icon');
};

// Run all generators
const generateAll = () => {
  console.log('Generating icons and images...\n');
  
  createFavicon();
  createOGPImage();
  createAppleTouchIcon();
  
  console.log('\n✅ All icons generated successfully!');
  console.log('\nNote: The OGP image is in SVG format. For production use, convert it to PNG format.');
};

generateAll();