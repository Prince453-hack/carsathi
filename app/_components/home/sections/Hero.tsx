"use client";

import { LoginsForm } from "../LoginsForm";
import { useEffect, useState, useLayoutEffect, useMemo } from "react";
import { ForgetPasswordForm } from "../ForgetPasswordForm";
import InfoBanner from "../../common/InfoBanner";
import { Spin } from "antd";

export const HeroSection = () => {
  const [forgetPasswordPage, setForgetPasswordPage] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const hasSSOParams = useMemo(() => {
    let state: string | null = null,
      sessionState: string | null = null,
      code: string | null = null,
      amazonCode: string | null = null;
    if (typeof window !== "undefined") {
      const extractParams = (str: string): Record<string, string> => {
        const params: Record<string, string> = {};
        str.split("&").forEach((param: string) => {
          const [key, value] = param.split("=");
          if (key && value) params[key] = decodeURIComponent(value);
        });
        return params;
      };
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        const hashParams = extractParams(hash.substring(1));
        state = hashParams["state"] || null;
        sessionState = hashParams["session_state"] || null;
        code = hashParams["code"] || null;
      }
      if (!(state && sessionState && code)) {
        const search = window.location.search;
        if (search && search.length > 1) {
          const searchParams = new URLSearchParams(search.substring(1));
          state = searchParams.get("state");
          sessionState = searchParams.get("session_state");
          code = searchParams.get("code");
          amazonCode = searchParams.get("code"); // Amazon SSO code parameter
        }
      }
    }
    return !!(state && sessionState && code) || !!amazonCode;
  }, []);

  useLayoutEffect(() => {
    if (hasSSOParams) {
      setShowLoader(true);
    }
  }, [hasSSOParams]);

  if (showLoader) {
    return (
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
    );
  }

  return (
    <div className="min-h-[100vh] overflow-clip relative">
      <div className="w-full flex lg:px-36 justify-center lg:justify-end lg:mx-0 pt-48 lg:pt-40">
        {forgetPasswordPage ? (
          <ForgetPasswordForm setForgetPasswordPage={setForgetPasswordPage} />
        ) : (
          <LoginsForm
            setForgetPasswordPage={setForgetPasswordPage}
            setHeroLoader={setShowLoader}
          />
        )}
      </div>
      <InfoBanner />

      <video
        autoPlay
        loop
        muted
        className="min-h-[100vh] min-w-[100vw] object-cover absolute top-0 right-0 left-0 -z-10"
      >
        <source
          src="/assets/videos/bg-video.mp4"
          type="video/mp4"
          className="min-h-[100vh] min-w-[100vw]"
        />
      </video>
    </div>
  );
};
