"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import Button from '@mui/material/Button';

import AlertBox from '@/components/Alerts/Alert';
import { PageTitle } from "@/components/Widgets/Widgets";
import { ValidateMessage, LoadingSpinner } from '@/components/Validate/Validate';
import { addParticipant } from "@/utils/apiUtils";
import { isAttendanceTime, isTimeBetween } from "@/utils/timeCheck";

import '@/styles/attendance.css';

interface Event {
  event: number;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_UCOUNT_BACKEND_URL

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
    checkLocalStorage(eventDetails);
    addParticipant(`${BACKEND_URL}/api/add/participant/${eventDetails?.event}/`, email, setLoading, setEmailError, setSuccess)
    
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
