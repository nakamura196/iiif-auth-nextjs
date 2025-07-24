const fs = require('fs');
const path = require('path');

// This is a simple 1x1 pixel blue PNG that we'll use as a placeholder
// In production, you should generate a proper 1200x630 image
const ogpPlaceholderBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkiPv/HwAC8AFp2FAkXQAAAABJRU5ErkJggg==';

const ogpBuffer = Buffer.from(ogpPlaceholderBase64, 'base64');
fs.writeFileSync(path.join(__dirname, '../public/ogp-image.png'), ogpBuffer);

console.log('Created placeholder OGP image at public/ogp-image.png');
console.log('Note: This is a placeholder. For production, generate a proper 1200x630 image.');
console.log('You can use the create-ogp-image.html file in the public directory to generate a proper image.');