import { useState, useEffect, useCallback } from 'react';
import { getUser, login, logout, renewToken } from '@/app/lib/oidc/auth-helpers';
import type { User } from 'oidc-client-ts';

interface UseOidcAuthReturn {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	error: string | null;
	login: () => Promise<void>;
	logout: () => Promise<void>;
	renewToken: () => Promise<void>;
	clearError: () => void;
}

export function useOidcAuth(): UseOidcAuthReturn {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	const checkUser = useCallback(async () => {
		try {
			setIsLoading(true);
			const currentUser = await getUser();

			if (currentUser && !currentUser.expired) {
				setUser(currentUser);
			} else {
				setUser(null);
			}
		} catch (err) {
			console.error('Error checking user:', err);
			setError(err instanceof Error ? err.message : 'Failed to check user');
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const handleLogin = useCallback(async () => {
		try {
			setError(null);
			setIsLoading(true);
			await login();
		} catch (err) {
			console.error('Login error:', err);
			setError(err instanceof Error ? err.message : 'Login failed');
			setIsLoading(false);
		}
	}, []);

	const handleLogout = useCallback(async () => {
		try {
			setError(null);
			setIsLoading(true);
			await logout();
			setUser(null);
		} catch (err) {
			console.error('Logout error:', err);
			setError(err instanceof Error ? err.message : 'Logout failed');
			setIsLoading(false);
		}
	}, []);

	const handleRenewToken = useCallback(async () => {
		try {
			setError(null);
			const renewedUser = await renewToken();
			if (renewedUser) {
				setUser(renewedUser);
			}
		} catch (err) {
			console.error('Token renewal error:', err);
			setError(err instanceof Error ? err.message : 'Token renewal failed');
		}
	}, []);

	useEffect(() => {
		checkUser();
	}, [checkUser]);

	// Set up automatic token renewal
	useEffect(() => {
		if (!user || user.expired) return;

		const checkTokenExpiry = () => {
			if (user.expires_at) {
				const expiresAt = user.expires_at * 1000; // Convert to milliseconds
				const now = Date.now();
				const timeUntilExpiry = expiresAt - now;

				// Renew token 5 minutes before expiry
				if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
					handleRenewToken();
				}
			}
		};

		const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
		return () => clearInterval(interval);
	}, [user, handleRenewToken]);

	return {
		user,
		isLoading,
		isAuthenticated: !!user && !user.expired,
		error,
		login: handleLogin,
		logout: handleLogout,
		renewToken: handleRenewToken,
		clearError,
	};
}
