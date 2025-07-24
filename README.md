# IIIF Authentication API 2.0 Demo with Next.js

This is a demo implementation of the IIIF Authentication API 2.0 specification using Next.js.

## Features

- **Probe Service**: Check access status for protected resources
- **Access Service**: Handle user authentication with login UI
- **Token Service**: Issue and validate access tokens
- **IIIF Viewer Integration**: Mirador viewer with authentication support
- **CORS Support**: Proper cross-origin resource sharing for IIIF clients

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open http://localhost:3001 in your browser

## Usage

### Viewing Protected IIIF Content

1. Navigate to http://localhost:3001/viewer to open the IIIF viewer
2. The viewer will attempt to load a protected manifest
3. When prompted, authenticate using:
   - Username: `user`
   - Password: `pass`
4. After authentication, the protected content will be displayed

### API Endpoints

- **Manifest**: `GET /api/iiif/manifest/{id}`
- **Probe Service**: `GET /api/iiif/probe`
- **Access Service**: `POST /api/iiif/access`
- **Token Service**: `GET /api/iiif/token`
- **Image Service**: `GET /api/iiif/image/{id}/{region}/{size}/{rotation}/{quality}.{format}`

### Testing the Authentication Flow

1. **Direct API Test**: Visit http://localhost:3001 and use the probe interface
2. **Viewer Test**: Visit http://localhost:3001/viewer to see the full integration

## Architecture

- **Next.js App Router**: Modern React server components
- **In-Memory Auth Store**: Simple token storage (use database in production)
- **CORS Headers**: Properly configured for cross-origin IIIF requests
- **PostMessage Communication**: Secure cross-domain authentication flow

## Security Notes

This is a demo implementation. For production use:
- Implement proper user database and authentication
- Use secure session management
- Add rate limiting and security headers
- Use HTTPS for all endpoints
- Implement proper token expiration and refresh