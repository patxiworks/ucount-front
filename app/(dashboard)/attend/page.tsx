"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from '@mui/material/Button';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';

import { ValidateMessage, LoadingSpinner } from '@/components/Validate/Validate';
import '@/styles/attendance.css';

interface Event {
  name: string;
  description: string;
}

const AttendanceOptions = () => {
  const router = useRouter();
  const [isValidated, setIsValidated] = useState(false);
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  const [noSession, setNoSession] = useState(false);

  useEffect(() => {
    // Check if the user has already been validated through QR scan
    const validatedData = sessionStorage.getItem("ucount_event_today");
    if (validatedData) {
      setIsValidated(true);
      setEventDetails(JSON.parse(validatedData));
    } else {
      setNoSession(true)
    }
  }, []);

  if (isValidated && eventDetails) {
    return (
      <div className="page-container">
        <div className="text-xl mb-2 text-green-700">
          <span>Today&apos;s Event</span> 
          <h2>{eventDetails.name}</h2>
        </div>
        <p className="text-lg text-gray-700 mb-6">{eventDetails.description}</p>
        {/* Hero Component with Login and Signup */}
        <div className="attendance-buttons">
          <Link href="/attend/new">
            <Button variant="outlined" color="secondary" size="large" className="mui-button" startIcon={<PersonIcon sx={{color: '#000'}} />}>
              I am attending for the first time...
            </Button>
          </Link>
          <div className="buttons-sep">--OR--</div>
          <Link href="/attend/existing">
            <Button variant="outlined" color="secondary" size="large" className="mui-button" startIcon={<GroupIcon sx={{color: '#000'}} />}>
              I have attended and registered before...
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (noSession) {
    return (
      <div className="page-container">
        <ValidateMessage router={router} />
      </div>
    )
  }

  return <LoadingSpinner />;
}

// Main component with proper Suspense boundaries
export default function AttendanceHome() {
  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <AttendanceOptions />
      </Suspense>
    </div>
  );
}
