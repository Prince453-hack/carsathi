import jwt from "jsonwebtoken";
import axios from "axios";
import { amazonSSOConfig } from "./amazon-sso-config";

export async function exchangeCodeForToken(code: string) {
  const data = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: amazonSSOConfig.redirectUri,
    client_id: amazonSSOConfig.clientId,
    client_secret: amazonSSOConfig.clientSecret,
  });

  const config = {
    method: "post" as const,
    url: amazonSSOConfig.tokenUrl,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data.toString(),
  };

  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error("Error during token exchange:", error);
    throw error;
  }
}

export function decodeToken(idToken: string) {
  try {
    const decoded = jwt.decode(idToken, { complete: true });
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    throw error;
  }
}
