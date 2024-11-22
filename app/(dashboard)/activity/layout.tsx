"use client"

import { Suspense } from 'react'

export default function DashboardLayout({ children }: {children: React.ReactNode}) {
  return (
    <Suspense>
      <div>{children}</div>
    </Suspense>
  );
}
