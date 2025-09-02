import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
	isLoggedIn?: boolean;
	userInfo?: {
		sub: string;
		name?: string;
		email?: string;
		email_verified?: boolean;
	};
	access_token?: string;
	id_token?: string;
	refresh_token?: string;
}

export const defaultSession: SessionData = {
	isLoggedIn: false,
};

export async function getSession(): Promise<SessionData | null> {
	try {
		const session = await getIronSession<SessionData>(cookies(), {
			password: process.env.SESSION_SECRET || 'supersecretkey-must-be-at-least-32-characters-long',
			cookieName: 'oidc-session',
			cookieOptions: {
				secure: process.env.NODE_ENV === 'production',
				maxAge: 24 * 60 * 60, // 24 hours
				httpOnly: true,
				sameSite: 'lax',
			},
		});

		return session;
	} catch (error) {
		console.error('Error getting session:', error);
		return null;
	}
}

export async function saveSession(sessionData: SessionData): Promise<void> {
	try {
		const session = await getIronSession<SessionData>(cookies(), {
			password: process.env.SESSION_SECRET || 'supersecretkey-must-be-at-least-32-characters-long',
			cookieName: 'oidc-session',
			cookieOptions: {
				secure: process.env.NODE_ENV === 'production',
				maxAge: 24 * 60 * 60, // 24 hours
				httpOnly: true,
				sameSite: 'lax',
			},
		});

		Object.assign(session, sessionData);
		await session.save();
	} catch (error) {
		console.error('Error saving session:', error);
		throw error;
	}
}

export async function clearSession(): Promise<void> {
	try {
		const session = await getIronSession<SessionData>(cookies(), {
			password: process.env.SESSION_SECRET || 'supersecretkey-must-be-at-least-32-characters-long',
			cookieName: 'oidc-session',
			cookieOptions: {
				secure: process.env.NODE_ENV === 'production',
				maxAge: 24 * 60 * 60, // 24 hours
				httpOnly: true,
				sameSite: 'lax',
			},
		});

		session.destroy();
	} catch (error) {
		console.error('Error clearing session:', error);
		throw error;
	}
}
