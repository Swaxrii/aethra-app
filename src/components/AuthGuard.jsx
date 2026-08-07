"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("aethra_user"));
    } catch {}
    const isAuth = pathname === "/auth";

    if (!user && !isAuth) {
      router.replace("/auth");
    } else if (user && isAuth) {
      router.replace("/");
    }
  }, [pathname, router]);

  return children;
}
