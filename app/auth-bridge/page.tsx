"use client";

import { useEffect, Suspense } from "react"; // 1. Import Suspense
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/client"; 

// 2. Move your logic into a sub-component
function AuthBridgeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ error }) => {
        if (!error) {
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

// 3. The main export just wraps the content in Suspense
export default function AuthBridge() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-400">Loading auth bridge...</p>
      </div>
    }>
      <AuthBridgeContent />
    </Suspense>
  );
}