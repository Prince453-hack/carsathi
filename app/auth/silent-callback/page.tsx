'use client';

import { useEffect } from 'react';
import { getUserManager } from '@/app/lib/oidc/oidcClient';

export default function SilentCallbackPage() {
	useEffect(() => {
		const handleSilentCallback = async () => {
			try {
				const userManager = getUserManager();
				await userManager.signinSilentCallback();
				console.log('Silent token renewal completed');
			} catch (error) {
				console.error('Silent callback error:', error);
			}
		};

		handleSilentCallback();
	}, []);

	return <div style={{ display: 'none' }}>Silent callback processing...</div>;
}
