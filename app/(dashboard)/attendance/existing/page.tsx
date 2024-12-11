"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import Button from '@mui/material/Button';

import AlertBox from '@/components/Alerts/Alert';
import { PageTitle } from "@/components/Attendance/PageTitle";
import { ValidateMessage, LoadingSpinner } from '@/components/Validate/Validate';
import { checkEmail_addParticipant } from "@/utils/apiUtils";
import { isAttendanceTime, isTimeBetween } from "@/utils/timeCheck";

import '@/styles/attendance.css';

interface Event {
  event: number;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
}

const ValidateUser = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(['',false]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendee, setAttendee] = useState('');
  const [open, setOpen] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  const [active, setActive] = useState(true);
  const [noSession, setNoSession] = useState(false);
  const router = useRouter();
  //const { isAuthenticated, login } = useAuth();

  const checkLocalStorage = (event: any) => {
    if (localStorage.getItem("ucount_attendance")) {
      const localdata = JSON.parse(localStorage.getItem("ucount_attendance") ?? '')
      if (localdata) {
        setAttendee(localdata.user.firstname)
        // Ensure event matches users time
        const today = new Date().toISOString().split("T")[0];
        const userdate = localdata.timestamp.split("T");
        const activeEvent = (
          event.date === today &&
          isAttendanceTime(event.startTime, event.endTime)
        );
        const userEvent = (
          event.date === userdate[0] &&
          isTimeBetween(userdate[1], event.startTime, event.endTime)
        );

        if (activeEvent) {
          if (!userEvent) {
            setLoading(false)
          } else {
            setLoading(false)
            setSuccess(true)
          }
        } else {
          setActive(false)
        }
      }
    }
  }

  useEffect(() => {
    // Check if the user has already been validated through QR scan
    const validatedData = sessionStorage.getItem("ucount_event");
    if (validatedData) {
      setIsValidated(true);
      setEventDetails(JSON.parse(validatedData));
      // check if the user has data in localstorage
      checkLocalStorage(JSON.parse(validatedData))
    } else {
      setNoSession(true)
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    /*try {
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
    }*/

    checkLocalStorage(eventDetails);

    /*try {
      fetch(`http://127.0.0.1:8000/api/validate/email/?email=${email}`)
        .then((res) => res.json())
        .then((data) => {
          //setIsCheckingEmail(false);
          if (data.exists) {
              const loginData = { email, timestamp: new Date().toLocaleString() };
              localStorage.setItem("loginData", JSON.stringify(loginData));
              setSuccess(true)
              console.log('here')
          } else {
              setLoading(false);
              setEmailError(['This email address is not in our records. Is this your first time?', true]);
          }
        })
        .catch(() => {
          setLoading(false);
          setEmailError(['Could not connect to the server. Please try again.', false]);
        });
    } catch {
      setLoading(false);
      setEmailError(['Something went wrong. Please try again later.', false]);
    }*/
    //console.log(eventDetails)

    checkEmail_addParticipant(`http://127.0.0.1:8000/api/add/participant/${eventDetails?.event}/`, email, setLoading, setEmailError, setSuccess)
    
  };

  if (isValidated && eventDetails && !success) {
      return (
        <div className="page-container">
          <PageTitle event={eventDetails} />
          <form onSubmit={handleSubmit} className="verify-form">
            <div className="register-form-title">
              {
              active
              ? <>
                  <h4>Verify your attendance</h4>
                  <h5>If this is your first time, <Link href="/attendance/new">click here to register</Link></h5>
                </>
              : <h3>Attendance for this activity is closed!</h3>
              }
              <div className="email-validate-message">
                {
                !loading
                ? emailError.length && !success 
                  ? <h5 className="message">{emailError[0]} {emailError[1] ? <Link href="/attendance/new">Register here</Link> : ''}</h5>
                  : <h5 className="message">Email found!</h5>
                : <h5>Checking...</h5>
                }
              </div>
            </div>
            {
            active
            ?  <>
                <Box sx={{ '& .MuiTextField-root': { m: 2, width: '45ch' } }}>
                {/*<VerifiedUserIcon sx={{ color: 'secondary', mr: 2, my: 0.5 }} />*/}
                  <TextField 
                    required
                    id="email-verification" 
                    label="Enter your email address" 
                    variant="filled" 
                    color="secondary"
                    disabled={!active}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{width: 400}}
                    focused
                  />
                </Box>
                <Button 
                  type="submit"
                  variant="contained"
                  color="secondary" 
                  size="medium"
                  disabled={loading || !active}
                  className={`verify-button ${
                    loading ? "disabled" : "enabled"
                  }`}
                >
                  Submit
                </Button>
              </>
            : ''
            }
          </form>
        </div>
      )
  }

  if (isValidated && eventDetails && success) {
    return (
      <div className="page-container">
        <PageTitle event={eventDetails} />
        <div className="verify-form">
          <div className="register-form-title success">
            <h4>Welcome back{attendee ? ', '+attendee : ''}!</h4>
            <div>Your attendance has been successfully marked.</div>
          </div>
        </div>
      </div>
    )
  }

  if (!active) {
    return (
      <div className="page-container">
        <PageTitle event={eventDetails} />
        <div className="verify-form">
          <div className="register-form-title">
            <div>Not active</div>
          </div>
        </div>
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
