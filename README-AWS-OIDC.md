# AWS Federated Identity SSO Implementation

This document explains how to set up and configure the AWS Federated Identity SSO (Single Sign-On) implementation for this application.

## Overview

This implementation uses AWS Federated Identity as an OIDC provider for authentication. The authentication flow is handled in the Node.js backend, and the frontend Next.js application redirects to the appropriate endpoints.

## Setup Instructions

### 1. AWS Federated Identity Configuration

1. Set up AWS IAM Identity Center (successor to AWS Single Sign-On)
2. Configure your OIDC identity provider in the AWS console
3. Create an identity provider application with the following settings:
   - Enable OIDC flows
   - Configure callback URLs: `https://your-app-domain/api/node/oidc/callback`
   - Configure sign-out URLs: `https://your-app-domain`
   - Enable authorization code grant flow
   - Configure scopes (at minimum: `openid`, `profile`, `email`)
4. Note your client ID, client secret, and identity provider endpoint URL

### 2. Environment Variables

Copy the `.env.example` file to `.env.local` and fill in the appropriate values:

```
NEXT_PUBLIC_APP_URL=https://your-app-domain
NEXT_PUBLIC_API_URL=https://your-aws-federated-idp-endpoint.com
NEXT_PUBLIC_CLIENT_ID=your-client-id
NEXT_PUBLIC_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_SCOPE="openid profile email"

# Optional AWS Federated Identity Parameters
AWS_IDENTITY_PROVIDER=your-identity-provider-name
AWS_IDP_IDENTIFIER=your-idp-identifier

SESSION_SECRET=your-secure-session-secret
```

### 3. Backend Integration

The backend integration is already set up in:

- `backend/oidc-service.js`: Contains the OIDC client implementation
- `backend/index.js`: Mounts the OIDC service
- `server.js`: Configures session management

### 4. Frontend Integration

The frontend integration is set up in:

- `app/auth/login/route.ts`: Redirects to the backend login endpoint
- `app/auth/logout/route.ts`: Redirects to the backend logout endpoint

## Authentication Flow

1. User clicks login button, which navigates to `/auth/login`
2. The login route redirects to `/api/node/oidc/login`
3. The backend initiates OIDC authentication with AWS Federated Identity
4. User is redirected to the configured identity provider login page
5. After successful authentication, the identity provider redirects to `/api/node/oidc/callback`
6. The callback endpoint exchanges the authorization code for tokens
7. User information is stored in the session
8. User is redirected to the application's home page

## Token Refresh

The implementation includes a token refresh endpoint at `/api/node/oidc/refresh` that can be used to refresh the access token using the refresh token stored in the session.

## Accessing User Information

User information can be accessed through:

- Backend API: `GET /api/node/oidc/userinfo`
- Session data in Express middleware

## Logout Flow

1. User clicks logout button, which navigates to `/auth/logout`
2. The logout route redirects to `/api/node/oidc/logout`
3. The backend clears the session and redirects to the identity provider's logout endpoint
4. After logout, user is redirected to the application's home page
