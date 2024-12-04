"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { decrypt } from "@/utils/encryptionUtils";

// Loading spinner component for better UX
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-lg">Loading verification...</p>
    </div>
  );
}

// Separate component handling the verification logic
function VerifyAttendanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const encryptedPayload = searchParams.get("payload");

    if (!encryptedPayload) {
      setError("Invalid access.");
      return;
    }

    try {
      const decryptedPayload = decrypt(encryptedPayload);
      const { token, event } = JSON.parse(decryptedPayload);

      // Retrieve one-time token from session storage
      const storedToken = sessionStorage.getItem("oneTimeToken");

      if (storedToken === token) {
        sessionStorage.removeItem("oneTimeToken"); // Prevent reuse
        sessionStorage.setItem("ucount_event_today", JSON.stringify(event)); // Save event details
        router.push("/"); // Redirect to the homepage
      } else {
        setError("Invalid or reused token. Please scan the QR code again.");
      }
    } catch {
      setError("Error during verification.");
    }
  }, [searchParams, router]);

  return (
    <div className="verification-container">
      {error ? (
        <p className="error text-red-500">{error}</p>
      ) : (
        <p>Verifying attendance...</p>
      )}
    </div>
  );
}

// Main component with Suspense handling
export default function VerifyAttendance() {
  return (
    <div className="container mx-auto px-4">
      <Suspense fallback={<LoadingSpinner />}>
        <VerifyAttendanceContent />
      </Suspense>
    </div>
  );
}
