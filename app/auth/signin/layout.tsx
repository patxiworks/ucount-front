"use client"

import React from "react";
import { SessionProvider } from "next-auth/react";

export default function Login({ children, ...rest }: {children: React.ReactNode}) {
  return (
    <SessionProvider><div>{children}</div></SessionProvider>
  );
}
