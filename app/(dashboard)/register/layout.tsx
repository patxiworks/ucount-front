"use client"

import { Suspense } from 'react'

export default function RegisterLayout({ children }: {children: React.ReactNode}) {
  return (
    <Suspense>
      {children}
    </Suspense>
  );
}