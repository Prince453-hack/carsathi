// lib/oidcCookieStorage.ts
import Cookies from 'universal-cookie';
import { WebStorageStateStore } from 'oidc-client-ts';

export class CookieStorage implements Storage {
	private _cookies: Cookies;

	constructor(cookieHeader?: string | string[]) {
		this._cookies = new Cookies(cookieHeader);
	}

	get length(): number {
		return Object.keys(this._cookies.getAll()).length;
	}

	key(index: number): string | null {
		const keys = Object.keys(this._cookies.getAll());
		return keys[index] || null;
	}

	clear(): void {
		const allCookies = Object.keys(this._cookies.getAll());
		allCookies.forEach((key) => {
			this._cookies.remove(key, { path: '/' });
		});
	}

	getItem(key: string): string | null {
		return this._cookies.get(encodeURIComponent(key), { doNotParse: true });
	}

	setItem(key: string, value: string): void {
		this._cookies.set(encodeURIComponent(key), value, {
			path: '/', // Make cookie accessible site-wide
			maxAge: 3600, // 1 hour, adjust as needed
			secure: process.env.NODE_ENV === 'production', // Secure in production
			sameSite: 'lax', // Reasonable default for same-site redirects
		});
	}

	removeItem(key: string): void {
		this._cookies.remove(encodeURIComponent(key), { path: '/' });
	}
}

export function config(cookieHeaders?: string | string[]) {
	const cookieStorage = new CookieStorage(cookieHeaders);
	return {
		userStore: new WebStorageStateStore({ store: cookieStorage }),
		stateStore: new WebStorageStateStore({ store: cookieStorage }),
	};
}
