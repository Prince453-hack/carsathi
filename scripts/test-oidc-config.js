#!/usr/bin/env node

const { Issuer } = require('openid-client');
require('dotenv').config({ path: '.env.local' });

async function testOidcConfig() {
	console.log('🔍 Testing OIDC Configuration...\n');

	// Check environment variables
	console.log('📋 Environment Variables:');
	const requiredVars = [
		'NEXT_PUBLIC_KEYCLOAK_URL',
		'NEXT_PUBLIC_KEYCLOAK_REALM',
		'NEXT_PUBLIC_OIDC_CLIENT_ID',
		'NEXT_PUBLIC_APP_URL',
		'SESSION_SECRET',
	];

	const optionalVars = ['NEXT_PUBLIC_OIDC_CLIENT_SECRET', 'NEXT_PUBLIC_SCOPE'];

	let hasAllRequired = true;

	requiredVars.forEach((varName) => {
		const value = process.env[varName];
		if (value) {
			console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '[HIDDEN]' : value}`);
		} else {
			console.log(`❌ ${varName}: MISSING`);
			hasAllRequired = false;
		}
	});

	optionalVars.forEach((varName) => {
		const value = process.env[varName];
		if (value) {
			console.log(`🔧 ${varName}: ${varName.includes('SECRET') ? '[HIDDEN]' : value}`);
		} else {
			console.log(`⚪ ${varName}: Not set (optional)`);
		}
	});

	if (!hasAllRequired) {
		console.log('\n❌ Missing required environment variables. Please check your .env.local file.');
		process.exit(1);
	}

	// Test OIDC discovery
	console.log('\n🔍 Testing OIDC Discovery...');

	const authority = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}`;
	console.log(`Authority: ${authority}`);

	try {
		console.log('Discovering OIDC issuer...');
		const issuer = await Issuer.discover(authority);

		console.log('✅ OIDC Discovery successful!');
		console.log(`   Issuer: ${issuer.issuer}`);
		console.log(`   Authorization endpoint: ${issuer.authorization_endpoint}`);
		console.log(`   Token endpoint: ${issuer.token_endpoint}`);
		console.log(`   Userinfo endpoint: ${issuer.userinfo_endpoint}`);
		console.log(`   End session endpoint: ${issuer.end_session_endpoint || 'Not available'}`);

		// Test client configuration
		console.log('\n🔧 Testing Client Configuration...');

		const clientMetadata = {
			client_id: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID,
			redirect_uris: [`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`],
			response_types: ['code'],
		};

		if (process.env.NEXT_PUBLIC_OIDC_CLIENT_SECRET) {
			clientMetadata.client_secret = process.env.NEXT_PUBLIC_OIDC_CLIENT_SECRET;
			console.log('🔐 Using confidential client (with client secret)');
		} else {
			console.log('🔓 Using public client (no client secret)');
		}

		const client = new issuer.Client(clientMetadata);
		console.log('✅ Client configuration successful!');
		console.log(`   Client ID: ${client.client_id}`);
		console.log(`   Redirect URIs: ${client.redirect_uris.join(', ')}`);

		// Test authorization URL generation
		console.log('\n🔗 Testing Authorization URL Generation...');

		const authUrl = client.authorizationUrl({
			scope: process.env.NEXT_PUBLIC_SCOPE || 'openid profile email',
			response_type: 'code',
			state: 'test-state',
		});

		console.log('✅ Authorization URL generated successfully!');
		console.log(`   URL: ${authUrl}`);

		console.log('\n✅ All OIDC configuration tests passed!');
		console.log('\n📝 Next steps:');
		console.log('1. Ensure your Keycloak client is configured with the correct redirect URIs');
		console.log('2. Test the authentication flow by visiting /auth/login');
		console.log('3. Check the health endpoint: /api/node/oidc/health');
	} catch (error) {
		console.log('❌ OIDC Discovery failed!');
		console.error('Error details:', error.message);

		if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
			console.log('\n💡 Troubleshooting tips:');
			console.log('- Check if your Keycloak server is running and accessible');
			console.log('- Verify the NEXT_PUBLIC_KEYCLOAK_URL is correct');
			console.log('- Ensure there are no network connectivity issues');
		} else if (error.message.includes('404')) {
			console.log('\n💡 Troubleshooting tips:');
			console.log('- Check if the realm name is correct');
			console.log('- Verify the Keycloak URL format (should not include /auth)');
		}

		process.exit(1);
	}
}

// Run the test
testOidcConfig().catch(console.error);
