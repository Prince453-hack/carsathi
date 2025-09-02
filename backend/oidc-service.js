const express = require('express');
const router = express.Router();
const session = require('express-session');

// Client configuration for Keycloak
const clientConfig = {
	authority: process.env.NEXT_PUBLIC_KEYCLOAK_URL
		? `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}`
		: process.env.NEXT_PUBLIC_API_URL, // Fallback for backward compatibility
	client_id: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID || process.env.NEXT_PUBLIC_CLIENT_ID,
	client_secret: process.env.NEXT_PUBLIC_OIDC_CLIENT_SECRET || process.env.NEXT_PUBLIC_CLIENT_SECRET,
	scope: process.env.NEXT_PUBLIC_SCOPE || 'openid profile email',
	redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
	post_logout_redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}`,
	response_type: 'code',
	grant_type: 'authorization_code',
	post_login_route: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
	code_challenge_method: 'S256',
};

// Validate configuration
const validateConfig = () => {
	const required = ['authority', 'client_id', 'redirect_uri'];
	const missing = required.filter((key) => !clientConfig[key]);

	if (missing.length > 0) {
		throw new Error(`Missing required OIDC configuration: ${missing.join(', ')}`);
	}
};

// Cache the client to avoid rediscovery on every request
let cachedClient = null;
let openidClient = null;

// Initialize the openid-client module
async function initializeOpenidClient() {
	if (!openidClient) {
		const { Issuer, generators } = await import('openid-client');
		openidClient = { Issuer, generators };
	}
	return openidClient;
}

// Get OIDC client from discovery
async function getClient() {
	if (cachedClient) return cachedClient;

	try {
		validateConfig();

		const { Issuer } = await initializeOpenidClient();
		console.log('Discovering OIDC issuer:', clientConfig.authority);

		const issuer = await Issuer.discover(clientConfig.authority);
		console.log('Discovered issuer:', issuer.issuer);

		const clientMetadata = {
			client_id: clientConfig.client_id,
			redirect_uris: [clientConfig.redirect_uri],
			response_types: [clientConfig.response_type],
		};

		// Add client secret if available (for confidential clients)
		if (clientConfig.client_secret) {
			clientMetadata.client_secret = clientConfig.client_secret;
		}

		const client = new issuer.Client(clientMetadata);

		cachedClient = client;
		return client;
	} catch (error) {
		console.error('Error discovering OIDC issuer:', error);
		throw error;
	}
}

// Login route
router.get('/login', async (req, res) => {
	try {
		const client = await getClient();
		const { generators } = await initializeOpenidClient();
		const code_verifier = generators.codeVerifier();
		const code_challenge = generators.codeChallenge(code_verifier);

		// Store the PKCE values in session
		req.session.code_verifier = code_verifier;
		req.session.oidc_state = generators.state();

		const authParams = {
			scope: clientConfig.scope,
			code_challenge,
			code_challenge_method: clientConfig.code_challenge_method,
			state: req.session.oidc_state,
		};

		// Remove undefined values
		Object.keys(authParams).forEach((key) => authParams[key] === undefined && delete authParams[key]);

		const authUrl = client.authorizationUrl(authParams);
		console.log('Redirecting to authorization URL:', authUrl);
		res.redirect(authUrl);
	} catch (error) {
		console.error('Error initiating login:', error);
		res.status(500).json({
			error: 'Failed to initiate login',
			details: error.message,
			config: {
				authority: clientConfig.authority,
				client_id: clientConfig.client_id ? 'configured' : 'missing',
				redirect_uri: clientConfig.redirect_uri,
			},
		});
	}
});

// Callback route
router.get('/callback', async (req, res) => {
	try {
		const client = await getClient();
		const params = client.callbackParams(req);

		console.log('Callback params:', { ...params, code: params.code ? '[REDACTED]' : 'missing' });

		const tokenSet = await client.callback(clientConfig.redirect_uri, params, {
			code_verifier: req.session.code_verifier,
			state: req.session.oidc_state,
		});

		console.log('Token exchange successful');

		// Store tokens in session
		req.session.isLoggedIn = true;
		req.session.access_token = tokenSet.access_token;
		req.session.id_token = tokenSet.id_token;
		req.session.refresh_token = tokenSet.refresh_token;

		// Get user info from token if available
		if (tokenSet.claims) {
			const claims = tokenSet.claims();
			req.session.userInfo = {
				sub: claims.sub,
				name: claims.name || claims.given_name || claims.preferred_username,
				email: claims.email,
				email_verified: claims.email_verified,
				preferred_username: claims.preferred_username,
			};
			console.log('User info from token claims:', req.session.userInfo);
			res.redirect(clientConfig.post_login_route);
		} else {
			// Otherwise fetch from userinfo endpoint
			try {
				const userinfo = await client.userinfo(tokenSet);
				req.session.userInfo = {
					sub: userinfo.sub,
					name: userinfo.name || userinfo.given_name || userinfo.preferred_username,
					email: userinfo.email,
					email_verified: userinfo.email_verified,
					preferred_username: userinfo.preferred_username,
				};
				console.log('User info from userinfo endpoint:', req.session.userInfo);
				res.redirect(clientConfig.post_login_route);
			} catch (userinfoError) {
				console.error('Error fetching userinfo:', userinfoError);
				// Still consider login successful even if userinfo fails
				req.session.userInfo = {
					sub: 'unknown',
					name: 'Unknown User',
				};
				res.redirect(clientConfig.post_login_route);
			}
		}
	} catch (error) {
		console.error('Error processing callback:', error);
		res.status(500).json({
			error: 'Authentication failed',
			details: error.message,
			session: {
				hasCodeVerifier: !!req.session.code_verifier,
				hasState: !!req.session.oidc_state,
			},
		});
	}
});

// Logout route
router.get('/logout', async (req, res) => {
	try {
		const client = await getClient();
		const idToken = req.session?.id_token;

		// Clear session first
		req.session.destroy((err) => {
			if (err) {
				console.error('Error destroying session:', err);
			}

			try {
				// Try to redirect to IdP's end session endpoint if available
				if (idToken && client.endSessionUrl) {
					const logoutUrl = client.endSessionUrl({
						id_token_hint: idToken,
						post_logout_redirect_uri: clientConfig.post_logout_redirect_uri,
					});
					console.log('Redirecting to logout URL:', logoutUrl);
					res.redirect(logoutUrl);
				} else {
					// Fallback to local logout
					console.log('Performing local logout, redirecting to:', clientConfig.post_logout_redirect_uri);
					res.redirect(clientConfig.post_logout_redirect_uri);
				}
			} catch (endSessionError) {
				console.error('Error building end session URL:', endSessionError);
				res.redirect(clientConfig.post_logout_redirect_uri);
			}
		});
	} catch (error) {
		console.error('Error during logout:', error);
		res.redirect(clientConfig.post_logout_redirect_uri);
	}
});

// Token refresh route
router.get('/refresh', async (req, res) => {
	if (!req.session.refresh_token) {
		return res.status(401).json({ error: 'No refresh token' });
	}

	try {
		const client = await getClient();
		const tokenSet = await client.refresh(req.session.refresh_token);

		// Update tokens in session
		req.session.access_token = tokenSet.access_token;
		if (tokenSet.id_token) req.session.id_token = tokenSet.id_token;
		if (tokenSet.refresh_token) req.session.refresh_token = tokenSet.refresh_token;

		console.log('Token refresh successful');
		res.json({ success: true, expires_in: tokenSet.expires_in });
	} catch (error) {
		console.error('Error refreshing token:', error);
		res.status(500).json({ error: 'Failed to refresh token', details: error.message });
	}
});

// User info route
router.get('/userinfo', (req, res) => {
	if (req.session.isLoggedIn && req.session.userInfo) {
		res.json(req.session.userInfo);
	} else {
		res.status(401).json({ error: 'Not authenticated' });
	}
});

// Health check route
router.get('/health', (req, res) => {
	res.json({
		status: 'ok',
		config: {
			authority: clientConfig.authority,
			client_id: clientConfig.client_id ? 'configured' : 'missing',
			redirect_uri: clientConfig.redirect_uri,
			hasSession: !!req.session,
			isLoggedIn: !!req.session?.isLoggedIn,
		},
	});
});

module.exports = router;
