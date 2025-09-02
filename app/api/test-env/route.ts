import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are available
    const envCheck = {
      hasClientSecret: !!process.env.AMAZON_SSO_CLIENT_SECRET,
      hasTokenUrl: !!process.env.AMAZON_SSO_TOKEN_URL,
      hasClientId: !!process.env.NEXT_PUBLIC_AMAZON_SSO_CLIENT_ID,
      hasRedirectUri: !!process.env.NEXT_PUBLIC_AMAZON_SSO_REDIRECT_URI,
      hasAuthUrl: !!process.env.NEXT_PUBLIC_AMAZON_SSO_AUTH_URL,
      nodeEnv: process.env.NODE_ENV || "undefined",
      // Show first few characters to verify they exist without exposing secrets
      clientSecretPreview: process.env.AMAZON_SSO_CLIENT_SECRET
        ? process.env.AMAZON_SSO_CLIENT_SECRET.substring(0, 10) + "..."
        : "NOT_FOUND",
    };

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      environment: envCheck,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
