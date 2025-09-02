"use client";

import { setAuth } from "@/app/_globalRedux/common/authSlice";
import { Button, Spin } from "antd";
import { authenticate } from "@/app/lib/actions";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { isSnowmanAccount } from "@/app/helpers/isSnowmanAccount";

export const LoginsForm = ({
  setForgetPasswordPage,
  setHeroLoader,
}: {
  setForgetPasswordPage?: Dispatch<SetStateAction<boolean>>;
  setHeroLoader?: Dispatch<SetStateAction<boolean>>;
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showLoader, setShowLoader] = useState(false);

  // Handle Amazon SSO callback
  useEffect(() => {
    const handleSSOCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (code) {
        if (setHeroLoader) {
          setHeroLoader(true);
        } else {
          setShowLoader(true);
        }

        try {
          // Send code to backend API
          const response = await fetch("/api/auth/callback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          });

          const result = await response.json();

          if (result.status === "success") {
            // Store session data
            localStorage.setItem("auth-session", result.sessionData);
            document.cookie = `auth-session=${result.sessionData}; path=/;`;

            const userData = JSON.parse(result.sessionData);

            // Store permissions including SSO given name
            localStorage.setItem(
              "permissions",
              JSON.stringify({
                parentUser: userData.parentUser,
                userId: userData.userId,
                userName: userData.userName,
                groupId: userData.groupId,
                ssoGivenName: result.user.ssoGivenName, // Store SSO given name in localStorage
              })
            );

            dispatch(
              setAuth({
                groupId: userData.groupId,
                userId: userData.userId,
                userName: userData.userName,
                mobileNumber: userData.mobileNumber,
                accessLabel: userData.accessLabel,
                parentUser: userData.parentUser,
                extra: userData.extra,
                password: userData.password,
                company: userData.company,
                address: userData.address,
                billingAddress: userData.billingAddress,
                mobileAppToken: userData.mobileAppToken,
                payment: userData.payment,
                logo: userData.logo,
                isAc: userData.isAc || 0,
                isAlcohol: userData.isAlcohol || 0,
                isOdometer: userData.isOdometer || 0,
                vehicleType: userData.vehicleType || "",
                isTemp: userData.isTemp || 0,
                isPadlock: userData.isPadlock || 0,
                isMachine: userData.isMachine || 0,
                isEveVehicle: userData.isEveVehicle || 0,
                isMarketVehicle: userData.isMarketVehicle || 0,
                isGoogleMap: userData.isGoogleMap || 1,
                isLoading: false,
                isCrackPadlock: userData.isCrackPadlock || 0,
                ssoGivenName: result.user.ssoGivenName, // Store SSO given name
              })
            );

            // Clear URL parameters
            window.history.replaceState({}, document.title, "/");

            // Redirect to dashboard
            setTimeout(() => {
              window.location.replace("/dashboard");
            }, 1000);
          } else {
            console.error("SSO login failed:", result.message);
            setErrorMessage(result.message || "SSO login failed");
            if (setHeroLoader) {
              setHeroLoader(false);
            } else {
              setShowLoader(false);
            }
          }
        } catch (error) {
          console.error("SSO callback error:", error);
          setErrorMessage("SSO authentication failed");
          if (setHeroLoader) {
            setHeroLoader(false);
          } else {
            setShowLoader(false);
          }
        }
      }
    };

    if (typeof window !== "undefined") {
      handleSSOCallback();
    }
  }, [dispatch]);

  const handleAmazonSSOLogin = () => {
    // Show full screen loading via Hero component
    if (setHeroLoader) {
      setHeroLoader(true);
    }

    // Build the SSO URL with the correct parameters
    const authUrl =
      "https://idp-integ.federate.amazon.com/api/oauth2/v1/authorize";
    const clientId = "inslpsstpsso-ibs-gtrac";
    const redirectUri = "https://young.zantatech.com/sso/callback";
    const scope = "openid";
    const state = "federateuser";

    const ssoUrl = `${authUrl}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}&state=${state}`;

    window.location.href = ssoUrl;
  };

  const authenticateUser = async (formData: FormData) => {
    setLoading(true);
    const res = await authenticate("", formData);

    let data;
    if (res.status === 403) {
      setErrorMessage(res.message);
      setLoading(false);
    } else if (
      isSnowmanAccount({ userId: JSON.parse(res.data || "")?.userId })
    ) {
      process.env.NEXT_PUBLIC_ENV === "DEVELOPMENT"
        ? window.location?.replace("https://localhost:3000/api/auth/login")
        : window.location?.replace(`${window.location.origin}/api/auth/login`);
    } else if (Number(JSON.parse(res.data || "")?.userId) === 83482) {
      data = JSON.parse(res.data || "");
      localStorage.setItem("auth-session", res.data || "");
      document.cookie = `auth-session=${res.data || ""}; path=/;`;
      localStorage.setItem(
        "permissions",
        JSON.stringify({
          parentUser: data.parentUser,
          userId: data.userId,
          userName: data.userName,
          groupId: data.groupId,
        })
      );
      localStorage.setItem(
        "username-password",
        JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
        })
      );

      dispatch(
        setAuth({
          groupId: data.groupId,
          userId: data.userId,
          userName: data.userName,
          mobileNumber: data.mobileNumber,
          accessLabel: data.accessLabel,
          parentUser: data.parentUser,
          extra: data.extra,
          password: data.password,
          company: data.company,
          address: data.address,
          billingAddress: data.billingAddress,
          mobileAppToken: data.mobileAppToken,
          payment: data.payment,
          logo: data.logo,
          isAc: data.isAc || 0,
          isAlcohol: data.isAlcohol || 0,
          isOdometer: data.isOdometer || 0,
          vehicleType: data.vehicleType || "",
          isTemp: data.isTemp || 0,
          isPadlock: data.isPadlock || 0,
          isMachine: data.isMachine || 0,
          isEveVehicle: data.isEveVehicle || 0,
          isMarketVehicle: data.isMarketVehicle || 0,
          isGoogleMap: data.isGoogleMap || 1,
          isLoading: false,
          isCrackPadlock: data.isCrackPadlock || 0,
        })
      );
      setTimeout(() => {
        window.location?.replace(
          process.env.NEXT_PUBLIC_ENV === "DEVELOPMENT"
            ? "http://localhost:3000/dashboard"
            : `${window.location.origin}/dashboard`
        );
        setLoading(false);
      }, 1000);
    } else {
      data = JSON.parse(res.data || "");
      localStorage.setItem("auth-session", res.data || "");
      document.cookie = `auth-session=${res.data || ""}; path=/;`;
      localStorage.setItem(
        "permissions",
        JSON.stringify({
          parentUser: data.parentUser,
          userId: data.userId,
          userName: data.userName,
          groupId: data.groupId,
        })
      );
      localStorage.setItem(
        "username-password",
        JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
        })
      );

      dispatch(
        setAuth({
          groupId: data.groupId,
          userId: data.userId,
          userName: data.userName,
          mobileNumber: data.mobileNumber,
          accessLabel: data.accessLabel,
          parentUser: data.parentUser,
          extra: data.extra,
          password: data.password,
          company: data.company,
          address: data.address,
          billingAddress: data.billingAddress,
          mobileAppToken: data.mobileAppToken,
          payment: data.payment,
          logo: data.logo,
          isAc: data.isAc || 0,
          isAlcohol: data.isAlcohol || 0,
          isOdometer: data.isOdometer || 0,
          vehicleType: data.vehicleType || "",
          isTemp: data.isTemp || 0,
          isPadlock: data.isPadlock || 0,
          isMachine: data.isMachine || 0,
          isEveVehicle: data.isEveVehicle || 0,
          isMarketVehicle: data.isMarketVehicle || 0,
          isGoogleMap: data.isGoogleMap || 1,
          isLoading: false,
          isCrackPadlock: data.isCrackPadlock || 0,
        })
      );
      if (data && data.userId === 87205) {
        setTimeout(() => {
          window.location?.replace(
            process.env.NEXT_PUBLIC_ENV === "DEVELOPMENT"
              ? "http://localhost:3000/dashboard/all-reports/trip-report"
              : `${window.location.origin}/dashboard/all-reports/trip-report`
          );
          setLoading(false);
        }, 1000);
      } else {
        setTimeout(() => {
          window.location?.replace(
            process.env.NEXT_PUBLIC_ENV === "DEVELOPMENT"
              ? "http://localhost:3000/dashboard"
              : `${window.location.origin}/dashboard`
          );
          setLoading(false);
        }, 1000);
      }
    }
  };

  return showLoader ? (
    <div
      style={{
        background: "#f1f1F1",
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Spin size="large" spinning={true} />
    </div>
  ) : (
    <div className="w-[400px]  bg-white  rounded-2xl shadow  md:mt-0 sm:max-w-md xl:p-0  ">
      <div className="p-6 space-y-4 md:space-y-6 sm:p-10 pb-14">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 md:text-3xl">
          Sign In
        </h1>

        <form className="space-y-4 md:space-y-6" action={authenticateUser}>
          <div>
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Username
            </label>
            <input
              type="username"
              name="username"
              id="username"
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
              placeholder="Username"
              required={true}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
              required={true}
            />
          </div>
          <div className="flex items-center justify-between">
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </div>
          <Button
            htmlType="submit"
            style={{
              background: "rgb(218,94,26)",
              color: "white",
              width: "100%",
              borderRadius: "8px",
            }}
            type="primary"
            size="large"
            loading={loading}
          >
            Sign in
          </Button>
          <Button
            style={{
              background: "rgb(218,94,26)",
              color: "white",
              width: "100%",
              borderRadius: "8px",
            }}
            variant="outlined"
            size="large"
            loading={loading}
            onClick={handleAmazonSSOLogin}
          >
            Sign in using SSO
          </Button>
          {setForgetPasswordPage ? (
            <div className="w-full flex justify-end">
              <Button
                type="link"
                size="small"
                onClick={() => setForgetPasswordPage(true)}
              >
                Forgot password?
              </Button>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
};
