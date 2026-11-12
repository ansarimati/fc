"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";

export function userCartCount () {
  const { data: session, status } = useSession();
  const { cart, fetchCart } = useCartStore();

  useEffect(() => {
    if (status === "authenticated") fetchCart();
  }, [status]);

  return session ? cart?.totalItems || 0 : 0;
}