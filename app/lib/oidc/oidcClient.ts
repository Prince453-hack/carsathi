// lib/oidcClient.ts
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';
// import { config } from './oidcCookieStorage';

// const oidcConfig = {
// 	authority: process.env.NEXT_PUBLIC_API_URL ?? '',
// 	client_id: process.env.NEXT_PUBLIC_CLIENT_ID ?? '',
// 	redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/openiddict`,
// 	post_logout_redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}`,
// 	response_type: 'code',
// 	scope: 'openid profile email',
// 	...config(),
// };
// const userManager = new UserManager(oidcConfig);

// Validate required environment variables
const validateConfig = () => {
	const requiredVars = {
		NEXT_PUBLIC_KEYCLOAK_URL: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
		NEXT_PUBLIC_KEYCLOAK_REALM: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
		NEXT_PUBLIC_OIDC_CLIENT_ID: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID,
	};

	const missing = Object.entries(requiredVars)
		.filter(([, value]) => !value)
		.map(([key]) => key);

	if (missing.length > 0) {
		console.error('Missing required environment variables for Keycloak OIDC:', missing);
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
	}

	return requiredVars;
};

// Create OIDC configuration
const createOidcConfig = () => {
	try {
		const config = validateConfig();

		// Ensure we're in browser environment for window object
		if (typeof window === 'undefined') {
			throw new Error('OIDC client can only be initialized in browser environment');
		}

		return {
			authority: `${config.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${config.NEXT_PUBLIC_KEYCLOAK_REALM}`,
			client_id: config.NEXT_PUBLIC_OIDC_CLIENT_ID!,
			redirect_uri: `${window.location.origin}/auth/callback`,
			post_logout_redirect_uri: window.location.origin,
			response_type: 'code',
			scope: 'openid profile email',
			automaticSilentRenew: true,
			silent_redirect_uri: `${window.location.origin}/auth/silent-callback`,
			userStore: new WebStorageStateStore({ store: window.localStorage }),
			stateStore: new WebStorageStateStore({ store: window.sessionStorage }),
			// Additional Keycloak specific settings
			loadUserInfo: true,
			checkSessionInterval: 10000, // Check session every 10 seconds
			revokeAccessTokenOnSignout: true,
		};
	} catch (error) {
		console.error('Failed to create OIDC configuration:', error);
		throw error;
	}
};

// Initialize UserManager with error handling
let userManager: UserManager | null = null;

const initializeUserManager = () => {
	if (userManager) return userManager;

	try {
		const config = createOidcConfig();
		userManager = new UserManager(config);

		// Set up event handlers
		userManager.events.addUserLoaded((user) => {
			console.log('User loaded:', user.profile);
		});

		userManager.events.addUserUnloaded(() => {
			console.log('User unloaded');
		});

		userManager.events.addAccessTokenExpiring(() => {
			console.log('Access token expiring');
		});

		userManager.events.addAccessTokenExpired(() => {
			console.log('Access token expired');
		});

		userManager.events.addSilentRenewError((error) => {
			console.error('Silent renew error:', error);
		});

		return userManager;
	} catch (error) {
		console.error('Failed to initialize UserManager:', error);
		throw error;
	}
};

// Export a function that returns the UserManager instance
export const getUserManager = (): UserManager => {
	if (!userManager) {
		userManager = initializeUserManager();
	}
	return userManager;
};

// For backward compatibility
export { getUserManager as userManager };
export default getUserManager;
