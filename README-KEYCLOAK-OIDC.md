# Keycloak OIDC Configuration Guide

This document explains how to set up and configure Keycloak OIDC authentication for this application.

## Overview

This implementation uses Keycloak as an OIDC provider for authentication. The authentication flow supports both frontend (client-side) and backend (server-side) authentication patterns.

## Prerequisites

1. A running Keycloak server
2. A configured realm in Keycloak
3. A client configured in the Keycloak realm

## Keycloak Setup

### 1. Create a Realm

1. Log into your Keycloak admin console
2. Create a new realm or use an existing one
3. Note the realm name for configuration

### 2. Create a Client

1. Navigate to Clients in your realm
2. Create a new client with the following settings:

   - **Client ID**: Choose a unique identifier (e.g., `gtra-app`)
   - **Client Protocol**: `openid-connect`
   - **Access Type**: `confidential` (for server-side) or `public` (for client-side only)
   - **Standard Flow Enabled**: `ON`
   - **Direct Access Grants Enabled**: `ON` (optional)
   - **Service Accounts Enabled**: `ON` (if using confidential client)

3. Configure Valid Redirect URIs:

   - `http://localhost:3333/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)

4. Configure Valid Post Logout Redirect URIs:

   - `http://localhost:3333` (development)
   - `https://your-domain.com` (production)

5. Configure Web Origins:
   - `http://localhost:3333` (development)
   - `https://your-domain.com` (production)

### 3. Client Credentials

If using a confidential client:

1. Go to the Credentials tab
2. Note the Client Secret for configuration

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3333
NEXT_PUBLIC_ENV=DEVELOPMENT

# Session Configuration
SESSION_SECRET=your-secure-session-secret-must-be-at-least-32-characters-long

# Keycloak OIDC Configuration
NEXT_PUBLIC_KEYCLOAK_URL=https://your-keycloak-server.com
NEXT_PUBLIC_KEYCLOAK_REALM=your-realm-name
NEXT_PUBLIC_OIDC_CLIENT_ID=your-client-id
NEXT_PUBLIC_OIDC_CLIENT_SECRET=your-client-secret

# OIDC Scope (optional, defaults to 'openid profile email')
NEXT_PUBLIC_SCOPE=openid profile email
```

### Required Variables

- `NEXT_PUBLIC_KEYCLOAK_URL`: Your Keycloak server URL (without `/auth`)
- `NEXT_PUBLIC_KEYCLOAK_REALM`: The realm name in Keycloak
- `NEXT_PUBLIC_OIDC_CLIENT_ID`: The client ID from Keycloak
- `NEXT_PUBLIC_OIDC_CLIENT_SECRET`: The client secret (for confidential clients)
- `SESSION_SECRET`: A secure secret for session encryption (minimum 32 characters)

### Optional Variables

- `NEXT_PUBLIC_SCOPE`: OIDC scopes to request (default: "openid profile email")
- `NEXT_PUBLIC_APP_URL`: Your application URL (default: current origin)

## Authentication Flow

### Frontend Flow (Client-Side)

1. User navigates to `/auth/login`
2. Application redirects to Keycloak login page
3. User authenticates with Keycloak
4. Keycloak redirects to `/auth/callback` with authorization code
5. Frontend exchanges code for tokens using OIDC client
6. User is redirected to dashboard

### Backend Flow (Server-Side)

1. User navigates to `/api/node/oidc/login`
2. Backend redirects to Keycloak login page
3. User authenticates with Keycloak
4. Keycloak redirects to `/api/node/oidc/callback`
5. Backend exchanges code for tokens and stores in session
6. User is redirected to dashboard

## Available Endpoints

### Frontend Routes

- `/auth/login` - Initiate login flow
- `/auth/logout` - Initiate logout flow
- `/auth/callback` - Handle authentication callback
- `/auth/silent-callback` - Handle silent token renewal

### Backend API Routes

- `/api/node/oidc/login` - Server-side login initiation
- `/api/node/oidc/logout` - Server-side logout
- `/api/node/oidc/callback` - Server-side callback handling
- `/api/node/oidc/refresh` - Token refresh
- `/api/node/oidc/userinfo` - Get user information
- `/api/node/oidc/health` - Health check and configuration status

## Token Management

### Automatic Token Renewal

The frontend implementation includes automatic silent token renewal:

- Tokens are automatically renewed before expiration
- Silent renewal uses a hidden iframe to `/auth/silent-callback`
- Renewal happens every 10 seconds by default

### Manual Token Refresh

For backend sessions, use the refresh endpoint:

```javascript
const response = await fetch('/api/node/oidc/refresh');
const result = await response.json();
```

## User Information

### Frontend

```javascript
import { getUser } from '@/app/lib/oidc/auth-helpers';

const user = await getUser();
if (user && !user.expired) {
	console.log('User profile:', user.profile);
	console.log('Access token:', user.access_token);
}
```

### Backend

```javascript
// In your API route
if (req.session.isLoggedIn && req.session.userInfo) {
	const userInfo = req.session.userInfo;
	// Use user information
}
```

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**

   - Check that all required environment variables are set
   - Verify variable names match exactly (case-sensitive)

2. **Redirect URI Mismatch**

   - Ensure redirect URIs in Keycloak match your application URLs
   - Check for trailing slashes and protocol mismatches

3. **CORS Issues**

   - Configure Web Origins in Keycloak client settings
   - Ensure your application domain is allowed

4. **Token Expiration**
   - Check token lifetime settings in Keycloak
   - Verify automatic renewal is working

### Debug Information

Use the health check endpoint to verify configuration:

```bash
curl http://localhost:3333/api/node/oidc/health
```

### Logs

Check browser console and server logs for detailed error messages:

- Frontend errors appear in browser console
- Backend errors appear in server logs
- Keycloak errors appear in Keycloak server logs

## Security Considerations

1. **Client Secrets**: Never expose client secrets in frontend code
2. **HTTPS**: Always use HTTPS in production
3. **Session Security**: Use secure session configuration
4. **Token Storage**: Store tokens securely (httpOnly cookies for backend)
5. **CORS**: Configure CORS properly to prevent unauthorized access

## Migration from Other Auth Systems

If migrating from Auth0 or other systems:

1. Update environment variables to use Keycloak configuration
2. Update middleware to use OIDC session instead of Auth0
3. Test authentication flow thoroughly
4. Update user information mapping if needed

## Support

For issues with this implementation:

1. Check the troubleshooting section above
2. Verify Keycloak configuration
3. Check application logs for detailed error messages
4. Consult Keycloak documentation for server-side issues
