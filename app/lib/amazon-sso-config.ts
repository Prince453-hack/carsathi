export const amazonSSOConfig = {
  clientId: process.env.NEXT_PUBLIC_AMAZON_SSO_CLIENT_ID!,
  clientSecret: process.env.AMAZON_SSO_CLIENT_SECRET!,
  redirectUri: process.env.NEXT_PUBLIC_AMAZON_SSO_REDIRECT_URI!,
  authUrl: process.env.NEXT_PUBLIC_AMAZON_SSO_AUTH_URL!,
  tokenUrl: process.env.AMAZON_SSO_TOKEN_URL!,
  scope: "openid profile email",
  responseType: "code",
};

export function getAmazonSSOLoginUrl(): string {
  const params = new URLSearchParams({
    client_id: amazonSSOConfig.clientId,
    redirect_uri: amazonSSOConfig.redirectUri,
    response_type: amazonSSOConfig.responseType,
    scope: amazonSSOConfig.scope,
  });

  return `${amazonSSOConfig.authUrl}?${params.toString()}`;
}
