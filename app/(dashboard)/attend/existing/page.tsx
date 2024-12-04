"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import Button from '@mui/material/Button';

import AlertBox from '@/components/Alerts/Alert';
import { ValidateMessage, LoadingSpinner } from '@/components/Validate/Validate';
import { isAttendanceTime } from "@/utils/timeCheck";

import '@/styles/attendance.css';

interface Event {
  date: string;
  startTime: string;
  endTime: string;
  name: string;
}

const ValidateUser = () => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  const [noSession, setNoSession] = useState(false);
  const router = useRouter();
  //const { isAuthenticated, login } = useAuth();

  /*useEffect(() => {
    if (isAuthenticated) {
      toast.info("You are already logged in.");
      router.push("/success");
    }
  }, [isAuthenticated, router]);*/

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

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/events.json");
      const events: Event[] = await response.json();

      // Find an event that matches today's date and time
      const now = new Date().toISOString().split("T")[0];
      const activeEvent = events.find(
        (event) =>
          event.date === now &&
          isAttendanceTime(event.startTime, event.endTime)
      );

      if (!activeEvent) {
        <AlertBox 
          status={open} 
          onClose={()=>setOpen(false)} 
          severity="error"
          message="No active event during this time."
        />
        return;
      }
    } catch {
      <AlertBox 
        status={open} 
        onClose={()=>setOpen(false)} 
        severity="error"
        message="Failed to validate event time."
      />
      console.log('error')
      return;
    }

    if (localStorage.getItem("loginData")) {
      <AlertBox 
        status={open} 
        onClose={()=>setOpen(false)} 
        severity="error"
        message="You are already logged in."
      />
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        body: JSON.stringify({ phone }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (res.status === 200) {
        <AlertBox 
          status={open} 
          onClose={()=>setOpen(false)} 
          severity="success"
          message={data.message}
        />
        //login();

        const loginData = { phone, timestamp: new Date().toLocaleString() };
        localStorage.setItem("loginData", JSON.stringify(loginData));

        router.push("/success");
      } else {
        <AlertBox 
          status={open} 
          onClose={()=>setOpen(false)} 
          severity="error"
          message={data.message}
        />
      }
    } catch {
      <AlertBox 
        status={open} 
        onClose={()=>setOpen(false)} 
        severity="success"
        message={"Login failed!"}
      />
    } finally {
      setLoading(false);
    }
  };

  if (isValidated && eventDetails) {
    return (
      <div className="page-container">
        <div className="text-xl mb-2 text-green-700">
          <span>Today&apos;s Event</span> 
          <h2>{eventDetails?.name}</h2>
        </div>
        <form onSubmit={handleLogin} className="verify-form">
          <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            {/*<VerifiedUserIcon sx={{ color: 'secondary', mr: 2, my: 0.5 }} />*/}
            <TextField 
              required
              id="email-verification" 
              label="Enter your email address" 
              variant="filled" 
              color="secondary"
              sx={{width: 400}}
              focused
            />
          </Box>
          <Button 
            type="submit"
            variant="contained"
            color="secondary" 
            size="medium"
            disabled={loading}
            className={`verify-button ${
              loading ? "disabled" : "enabled"
            }`}
          >
            Verify your attendance
          </Button>
        </form>
      </div>
    )
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
export default function Attendance() {
  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <ValidateUser />
      </Suspense>
    </div>
  );
}
