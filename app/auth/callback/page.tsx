"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserManager } from "@/app/lib/oidc/oidcClient";

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const userManager = getUserManager();
        const user = await userManager.signinRedirectCallback();

        if (user) {
          // Store user info in session storage for immediate access
          sessionStorage.setItem(
            "oidc_user",
            JSON.stringify({
              profile: user.profile,
              access_token: user.access_token,
              id_token: user.id_token,
            })
          );

          // Redirect to dashboard or intended page
          const returnUrl =
            sessionStorage.getItem("oidc_return_url") || "/dashboard";
          sessionStorage.removeItem("oidc_return_url");

          router.replace(returnUrl);
        } else {
          throw new Error("No user returned from authentication");
        }
      } catch (error) {
        console.error("Authentication callback error:", error);
        setError(
          error instanceof Error ? error.message : "Authentication failed"
        );
        setLoading(false);

        // Redirect to login page after a delay
        setTimeout(() => {
          router.replace("/");
        }, 3000);
      }
    };

    handleCallback();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return null;
}
