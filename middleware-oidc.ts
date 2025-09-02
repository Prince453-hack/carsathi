import { NextResponse, type NextRequest } from 'next/server';
import { isSnowmanAccount } from './app/helpers/isSnowmanAccount';

export async function middleware(request: NextRequest) {
	const response = NextResponse.next();

	const currentSessionCookie = request.cookies.get('auth-session');
	const oidcSessionCookie = request.cookies.get('oidc-session');
	const currentSession = currentSessionCookie ? JSON.parse(currentSessionCookie.value) : null;

	const isDashboardPath = request.nextUrl.pathname.startsWith('/dashboard');
	const isAuthPath = request.nextUrl.pathname.startsWith('/auth');
	const isApiPath = request.nextUrl.pathname.startsWith('/api');

	// Redirect to external tracking site for `/newtracking`
	if (request.nextUrl.pathname.startsWith('/newtracking')) {
		return NextResponse.redirect('https://gtrac.in/trackingyatayaat/');
	}

	// Handle OIDC authentication for Snowman accounts
	if (currentSession && isSnowmanAccount({ userId: currentSession.data[0]?.userid })) {
		// Check if OIDC session exists
		if (!oidcSessionCookie && !isDashboardPath && !isAuthPath) {
			// Redirect to OIDC login
			return NextResponse.redirect(new URL('/auth/login', request.url));
		}

		// If accessing dashboard without OIDC session, redirect to login
		if (isDashboardPath && !oidcSessionCookie) {
			return NextResponse.redirect(new URL('/auth/login', request.url));
		}
	}

	// Handle redirects based on session presence and path
	if (currentSession && !isDashboardPath && !isAuthPath && !isApiPath) {
		if (oidcSessionCookie || !isSnowmanAccount({ userId: currentSession.data[0]?.userid })) {
			// Redirect to appropriate dashboard based on user
			if (currentSession.data[0]?.userid === 87205) {
				return NextResponse.redirect(new URL('/dashboard/all-reports/trip-report', request.url));
			} else {
				return NextResponse.redirect(new URL('/dashboard', request.url));
			}
		}
	}

	// Redirect unauthenticated users accessing dashboard paths to home
	if (!currentSession && isDashboardPath) {
		return NextResponse.redirect(new URL('/', request.url));
	}

	// Handle OIDC logout cleanup
	if (request.nextUrl.pathname === '/auth/logout') {
		const newResponse = NextResponse.next();
		newResponse.cookies.set('oidc-session', '', { path: '/', expires: new Date(0) });
		return newResponse;
	}

	// Set CORS headers
	response.headers.append('Access-Control-Allow-Credentials', 'true');
	response.headers.append('Access-Control-Allow-Origin', 'https://gtrac:8080.in');
	response.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
	response.headers.append(
		'Access-Control-Allow-Headers',
		'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
	);

	// Default: proceed with the request
	return response;
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
