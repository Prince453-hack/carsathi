// app/auth/login/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getUser, login } from '../../lib/oidc/auth-helpers';
import { useRouter } from 'next/navigation';
import type { User } from 'oidc-client-ts';

export default function LoginPage() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const checkUserAndRedirect = async () => {
			try {
				const currentUser = await getUser();

				if (currentUser && !currentUser.expired) {
					console.log('User already authenticated:', currentUser.profile);
					setUser(currentUser);

					// Store return URL if provided
					const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
					if (returnUrl) {
						sessionStorage.setItem('oidc_return_url', returnUrl);
					}

					// Redirect to dashboard
					router.replace('/dashboard');
				} else {
					// Store return URL before redirecting to login
					const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
					if (returnUrl) {
						sessionStorage.setItem('oidc_return_url', returnUrl);
					}

					// Initiate login flow
					await login();
				}
			} catch (error) {
				console.error('Login initialization error:', error);
				setError(error instanceof Error ? error.message : 'Failed to initialize login');
				setLoading(false);
			}
		};

		checkUserAndRedirect();
	}, [router]);

	const handleRetry = async () => {
		setError(null);
		setLoading(true);

		try {
			await login();
		} catch (error) {
			console.error('Retry login error:', error);
			setError(error instanceof Error ? error.message : 'Failed to start login');
			setLoading(false);
		}
	};

	if (user) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-center'>
					<div className='text-green-600 mb-4'>
						<svg className='w-12 h-12 mx-auto mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
						</svg>
					</div>
					<p className='text-gray-600'>Already logged in. Redirecting...</p>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
					<p className='text-gray-600'>Redirecting to login...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-center max-w-md mx-auto p-6'>
					<div className='text-red-600 mb-4'>
						<svg className='w-12 h-12 mx-auto mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z'
							/>
						</svg>
					</div>
					<h2 className='text-xl font-semibold text-gray-900 mb-2'>Login Error</h2>
					<p className='text-gray-600 mb-4'>{error}</p>
					<button onClick={handleRetry} className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors'>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return null;
}
