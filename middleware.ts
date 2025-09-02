import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { isSnowmanAccount } from './app/helpers/isSnowmanAccount';

export async function middleware(request: NextRequest) {
	const response = NextResponse.next();

	const currentSessionCookie = request.cookies.get('auth-session');
	const currentSession = currentSessionCookie ? JSON.parse(currentSessionCookie.value) : null;
	const auth0Session = await getSession(request, response);

	const isDashboardPath = request.nextUrl.pathname.startsWith('/dashboard');
	const isAuthPath = request.nextUrl.pathname.startsWith('/auth');

	// Redirect to external tracking site for `/newtracking`
	if (request.nextUrl.pathname.startsWith('/newtracking')) {
		return NextResponse.redirect('https://gtrac.in/trackingyatayaat/');
	}

	// If `auth-session` exists but `auth0Session` is missing, clear cookies and redirect to home
	if (currentSession && isSnowmanAccount({ userId: currentSession.data[0]?.userid }) && !auth0Session && !isDashboardPath) {
		const newResponse = NextResponse.redirect(new URL('/', request.url));
		newResponse.cookies.set('auth-session', '', { path: '/', expires: new Date(0) });
		newResponse.cookies.set('username-password', '', { path: '/', expires: new Date(0) });
		newResponse.cookies.set('appSession', '', { path: '/', expires: new Date(0) });

		return newResponse;
	}

	// Handle redirects based on session presence and path
	if (currentSession && !isDashboardPath && !isAuthPath) {
		if (auth0Session) {
			return NextResponse.redirect(new URL('/dashboard', request.url));
		} else if (currentSession.data[0]?.userid === 87205) {
			return NextResponse.redirect(new URL('/dashboard/all-reports/trip-report', request.url));
		} else {
			return NextResponse.redirect(new URL('/dashboard', request.url));
		}
	}

	// Redirect unauthenticated users accessing dashboard paths to home
	if (!currentSession && isDashboardPath) {
		return NextResponse.redirect(new URL('/', request.url));
	}

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
