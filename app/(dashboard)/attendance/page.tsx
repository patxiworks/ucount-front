"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { decrypt } from "@/utils/encryptionUtils";
import dayjs from "dayjs";

interface Event {
  date: string;
  name: string;
  description: string;
}

// Loading component for better UX
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-lg">Loading attendance...</p>
    </div>
  );
}

// Separate component for the attendance verification logic
function AttendanceVerifier() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [todayEvent, setTodayEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const today = dayjs().format("YYYY-MM-DD");

  useEffect(() => {
    const verifyDate = async () => {
      const encryptedEvents = searchParams.get("events");

      if (!encryptedEvents) {
        setIsLoading(false);
        setError("No event data provided");
        return;
      }

      try {
        const decryptedEvents = decrypt(encryptedEvents);
        const events: Event[] = JSON.parse(decryptedEvents);
        const eventForToday = events.find((event) => event.date === today);

        if (eventForToday) {
          setTodayEvent(eventForToday);
          // Redirect after showing the success message
          setTimeout(() => router.push("/"), 3000);
        } else {
          setError("No event scheduled for today");
        }
      } catch {
        setError("Invalid event data");
      } finally {
        setIsLoading(false);
      }
    };

    verifyDate();
  }, [searchParams, today, router]);

  // Handle Cancel button click
  const handleCancel = () => {
    router.push("/"); // Navigate to the homepage or any desired page
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg">Verifying event...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">{error}</p>
        <p className="mt-2">Please check that you&apos;re using a valid QR code.</p>
        {/* Cancel button */}
        <button
          onClick={handleCancel}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (todayEvent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-bold mb-4">Event Today: {todayEvent.name}</h2>
        <p className="mb-4">{todayEvent.description}</p>
        <p className="text-green-600">Attendance validated! Redirecting...</p>
      </div>
    );
  }

  return null;
}

// Main component with proper Suspense boundaries
export default function Attendance() {
  return (
    <div className="container mx-auto px-4">
      <Suspense fallback={<LoadingSpinner />}>
        <AttendanceVerifier />
      </Suspense>
    </div>
  );
}
