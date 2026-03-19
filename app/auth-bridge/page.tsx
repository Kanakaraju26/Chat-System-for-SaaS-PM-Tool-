"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/client"; 

export default function AuthBridge() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    if (accessToken && refreshToken) {
      // This tells Supabase to use these tokens as the active session
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ error }) => {
        if (!error) {
          // Success! Redirect to the chat dashboard
          router.push("/");
        } else {
          console.error("Auth bridge failed:", error.message);
          router.push("/login");
        }
      });
    } else {
      router.push("/login");
    }
  }, [searchParams, supabase, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
      <p className="text-slate-600 font-medium">Syncing your workspace...</p>
    </div>
  );
}