"use client";

import { useEffect, useId, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export default function TurnstileWidget({ theme = "auto" }: { theme?: "light" | "dark" | "auto" }) {
  const containerId = useId().replace(/:/g, "");
  const tokenInputRef = useRef<HTMLInputElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    function render() {
      if (!window.turnstile || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(`#${containerId}`, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
        theme,
        callback: (token) => {
          if (tokenInputRef.current) tokenInputRef.current.value = token;
        },
        "expired-callback": () => {
          if (tokenInputRef.current) tokenInputRef.current.value = "";
        },
      });
    }

    if (window.turnstile) {
      render();
    } else {
      // Script hasn't loaded yet — poll briefly until it has.
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          render();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [containerId, theme]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <input ref={tokenInputRef} type="hidden" name="turnstileToken" />
      <div id={containerId} />
    </>
  );
}