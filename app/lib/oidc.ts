import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
	url: 'https://itg.org.in',
	realm: 'AWS_SSO',
	clientId: 'provider',
});

export default keycloak;
