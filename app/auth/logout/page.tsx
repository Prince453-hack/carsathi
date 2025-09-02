// app/auth/logout/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { logout } from '../../lib/oidc/auth-helpers';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const handleLogout = async () => {
			try {
				// Clear any stored user data
				sessionStorage.removeItem('oidc_user');
				sessionStorage.removeItem('oidc_return_url');
				localStorage.removeItem('auth-session');

				// Initiate logout flow
				await logout();
			} catch (error) {
				console.error('Logout error:', error);
				setError(error instanceof Error ? error.message : 'Logout failed');
				setLoading(false);

				// Fallback: redirect to home page after a delay
				setTimeout(() => {
					router.replace('/');
				}, 3000);
			}
		};

		handleLogout();
	}, [router]);

	const handleRetry = async () => {
		setError(null);
		setLoading(true);

		try {
			await logout();
		} catch (error) {
			console.error('Retry logout error:', error);
			setError(error instanceof Error ? error.message : 'Logout failed');
			setLoading(false);
		}
	};

	const handleGoHome = () => {
		router.replace('/');
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
					<p className='text-gray-600'>Signing you out...</p>
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
					<h2 className='text-xl font-semibold text-gray-900 mb-2'>Logout Error</h2>
					<p className='text-gray-600 mb-4'>{error}</p>
					<div className='space-x-4'>
						<button onClick={handleRetry} className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors'>
							Try Again
						</button>
						<button onClick={handleGoHome} className='bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors'>
							Go Home
						</button>
					</div>
				</div>
			</div>
		);
	}

	return null;
}
