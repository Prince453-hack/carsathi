// lib/auth.ts
import { getUserManager } from './oidcClient';

export async function login() {
	try {
		const userManager = getUserManager();
		return await userManager.signinRedirect();
	} catch (error) {
		console.error('Login error:', error);
		throw error;
	}
}

export async function logout() {
	try {
		const userManager = getUserManager();
		return await userManager.signoutRedirect();
	} catch (error) {
		console.error('Logout error:', error);
		throw error;
	}
}

export async function getUser() {
	try {
		const userManager = getUserManager();
		return await userManager.getUser();
	} catch (error) {
		console.error('Get user error:', error);
		return null;
	}
}

export async function renewToken() {
	try {
		const userManager = getUserManager();
		return await userManager.signinSilent();
	} catch (error) {
		console.error('Token renewal error:', error);
		throw error;
	}
}
