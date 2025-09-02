import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, decodeToken } from "@/app/lib/amazon-sso";
import { authenticate } from "@/app/lib/actions";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    let idToken;
    let decode;
    var userPayload;

    if (!code) {
      return NextResponse.json(
        {
          status: "error",
          message: "No authorization code provided",
        },
        { status: 400 }
      );
    }

    if (code === "test") {
      // Mocked token for local testing
      idToken =
        "eyJraWQiOiIxYTRlNTI5NzQ2NjcxOTg5YTI3OGE3MGEwOGE2OTAwNCIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJhdWQiOiJpbnNscHNzdHBzc28tS2lhc2EiLCJzdWIiOiJzbXVubm9saSIsIm5iZiI6MTc0OTQ2Mjk2MiwiaXNzIjoiaHR0cHM6Ly9pZHAtaW50ZWcuZmVkZXJhdGUuYW1hem9uLmNvbSIsImxhc3RfbmFtZSI6Ik11bm5vbGkiLCJleHAiOjE3NDk0NjY1NjIsImZlZGVyYXRlX3Rva2VuX3B1cnBvc2UiOiJpZF90b2tlbiIsImlhdCI6MTc0OTQ2Mjk2MiwiZmlyc3RfbmFtZSI6IlN1ZGhlZXIiLCJqdGkiOiJJRC45MTgxYTM5MS00MjBkLTQ4NzgtODJmZS1iMzFmNDdmNTU4OGEiLCJlbWFpbCI6InNtdW5ub2xpQGFtYXpvbi5jb20ifQ.JHnPMoxGfxHJNkDq189sijhlIYeJQVNnTL_5Ga-DjFlaHdDDHUBe6hX8oKWGvhEIms0ghF5145_U-MAcwI1OS4UF8gOGwwPKuPPJxxQ8QaAZMfpyGW876NkxOCTt3oxYGDIW59_oaBCK8aJ5krAiqEI2_aYL6YujCSwhVcHguevQYdVo-s6ivu2nGgSYJ0ocX3s0XeFhE3x00M2SdfpP42KVslM4XclHXyDBTAsn2yOqFtR_yY9HmY4CKRWwu1o2VFAJRMOC5WRU5LKfjpMISkTZZujhuhfT49jIOMubnu28E7nP8QedwDXVrkSlfvTWRDiZjC4Sq0RfXp_eNLc8_Q";

      decode = {
        payload: {
          aud: "inslpsstpsso-ibs-gtrac",
          sub: "hasnen52",
          nbf: 1755691130,
          iss: "https://idp-integ.federate.amazon.com",
          exp: 1755694730,
          federate_token_purpose: "id_token",
          given_name: "Hasnen",
          iat: 1755691130,
          family_name: "Lax",
          jti: "ID.db2e91a1-8b5f-4316-8681-32cb9059d196",
          email: "hasnen@amazon.com",
        },
      };

      userPayload = decode.payload;
    } else {
      // Exchange code for token
      const tokenData = await exchangeCodeForToken(code);

      if (!tokenData.id_token) {
        return NextResponse.json(
          {
            status: "error",
            message: "No ID token received from Amazon",
          },
          { status: 400 }
        );
      }

      const decodedToken = decodeToken(tokenData.id_token);
      userPayload = decodedToken?.payload;

      if (!userPayload || typeof userPayload === "string") {
        return NextResponse.json(
          {
            status: "error",
            message: "Failed to decode token payload",
          },
          { status: 400 }
        );
      }
    }

    // Decode the token

    // Always authenticate as ajitamazon user regardless of SSO user
    const loginFormData = new FormData();
    loginFormData.append("username", "ajitamazon");
    loginFormData.append("password", "12345");

    // Call your existing authenticate function to get ajitamazon user data
    const authResult = await authenticate("", loginFormData);

    if (authResult.status === 403) {
      return NextResponse.json(
        {
          status: "error",
          message: authResult.message,
        },
        { status: 403 }
      );
    }

    const userData = JSON.parse(authResult.data || "");

    // Make POST request to validateSSO endpoint
    try {
      await axios.post("https://carsathi.in/tracking/validateSSO", {
        aud: (userPayload as any).aud,
        sub: (userPayload as any).sub,
        nbf: (userPayload as any).nbf,
        iss: (userPayload as any).iss,
        exp: (userPayload as any).exp,
        federate_token_purpose: (userPayload as any).federate_token_purpose,
        given_name: (userPayload as any).given_name,
        iat: (userPayload as any).iat,
        family_name: (userPayload as any).family_name,
        jti: (userPayload as any).jti,
        email: (userPayload as any).email,
      });
    } catch (error) {
      console.error("Error calling validateSSO:", error);
    }

    // Return successful response with user data
    return NextResponse.json({
      status: "success",
      access_token: "session_token_" + Date.now(),
      user: {
        id: userData.userId,
        email: (userPayload as any).email,
        name: userData.userName,
        groupId: userData.groupId,
        company: userData.company,
        ssoGivenName:
          (userPayload as any).given_name || (userPayload as any).first_name,
      },
      sessionData: authResult.data,
    });
  } catch (error) {
    console.error("Amazon SSO callback error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error during SSO authentication",
      },
      { status: 500 }
    );
  }
}
