"use client";

import { useState, FormEvent, ChangeEvent, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import { createFilterOptions } from '@mui/material/Autocomplete';

import AlertBox from '@/components/Alerts/Alert';
import { PageTitle } from '@/components/Widgets/Widgets';
import { RegisterForm } from "@/components/Widgets/Widgets";
import { ValidateMessage, LoadingSpinner } from '@/components/Validate/Validate';
import { addParticipant } from "@/utils/apiUtils";
import { isAttendanceTime, isTimeBetween } from "@/utils/timeCheck";

import '@/styles/attendance.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_UCOUNT_BACKEND_URL

interface Event {
  event: number;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
}

interface User {
  firstName: string;
  surname: string;
  phone: string;
}

const RegisterUser = () => {
  const [isValidated, setIsValidated] = useState(false);
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  const [attendee, setAttendee] = useState('');
  const [formData, setFormData] = useState({
    surname: '',
    firstname: '',
    othername: '',
    phone: '',
    email: '',
    centre: '',
    invitedby: 0,
  });
  const [emailError, setEmailError] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingNames, setIsCheckingNames] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [noSession, setNoSession] = useState(false);

  //const { login } = useAuth();
  const router = useRouter();
  //const dropdownRef = useRef<HTMLDivElement>(null);

  const [centres, setCentres] = useState([]);
  const [people, setPeople] = useState([]);
  const [nameError, setNameError] = useState('');

  const OPTIONS_LIMIT = 5;
  const filterOptions = createFilterOptions({
    limit: OPTIONS_LIMIT
  });

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

  // // Fetch centres on component mount
  // useEffect(() => {
  //   fetch(`${BACKEND_URL}/api/centres/`)
  //       .then((res) => res.json())
  //       .then((data) => setCentres(data))
  //       .catch(() => setCentres([])); // Handle errors gracefully

  //     fetch(`${BACKEND_URL}/api/people/`)
  //       .then((res) => res.json())
  //       .then((data) => setPeople(data))
  //       .catch(() => setPeople([])); // Handle errors gracefully
  // }, []);

  // // Email validation
  // useEffect(() => {
  //   if (formData.email) {
  //     const timeoutId = setTimeout(() => {
  //       setIsCheckingEmail(true);
  //       fetch(`${BACKEND_URL}/api/validate/email/?email=${formData.email}`)
  //         .then((res) => res.json())
  //         .then((data) => {
  //           setIsCheckingEmail(false);
  //           if (data.exists) {
  //               setEmailError('This email is already in use.');
  //           } else {
  //               setEmailError('');
  //           }
  //         })
  //         .catch(() => {
  //           setIsCheckingEmail(false);
  //           setEmailError('Error checking email.');
  //         });
  //     }, 500); // Debounce
  //     return () => clearTimeout(timeoutId); // Cleanup debounce
  //   }
  // }, [formData.email]);


  // // Names validation
  // useEffect(() => {
  //   const validateNames = async () => {
  //     const { surname, firstname, othername } = formData;
  //     try {
  //         const response = await fetch(
  //             `${BACKEND_URL}/api/validate/names/?surname=${encodeURIComponent(surname)}&firstname=${encodeURIComponent(firstname)}&othername=${encodeURIComponent(othername || '')}`
  //         );
  //         const data = await response.json();
  //         if (data.exists) {
  //           setIsCheckingNames(true);
  //           setNameError('This combination of names already exists');
  //         } else {
  //           setIsCheckingNames(false);
  //           setNameError('');
  //         }
  //     } catch (error) {
  //       setIsCheckingNames(false);
  //       setNameError('Failed to validate names');
  //     }
  //   };

  //   if (formData.surname) {
  //     validateNames();
  //   }
  // }, [formData.surname, formData.firstname, formData.othername]);

  // // Handle input changes
  // const handleChange = (e: any) => {
  //   const { name, value } = e.target;
  //   setFormData((prevData) => ({
  //       ...prevData,
  //       [name]: value && typeof value === 'string' ? value.trim() : value,
  //   }));
  // };

  // // Submit form
  // const handleSubmit = async (e: any) => {
  //   e.preventDefault();
  //   setFormError('');
  //   setSuccess(false)

  //   if (emailError) {
  //       setFormError('Please fix errors before submitting');
  //       return;
  //   }
  //   try {
  //       const payload = {
  //         ...formData,
  //         eventid: eventDetails?.event, // Replace 2 with a reference to the actual event ID
  //       };
  //       //console.log(payload)
  //       const response = await fetch(`${BACKEND_URL}/api/add/person/`, {
  //           method: 'POST',
  //           headers: {
  //               'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify(payload),
  //       });
  //       const result = await response.json();
  //       //console.log(result)
  //       if (response.ok) {
  //           addParticipant(`${BACKEND_URL}/api/add/participant/${eventDetails?.event}/`, formData.email, setLoading, setEmailError, setSuccess)
  //           setFormData({
  //               surname: '',
  //               firstname: '',
  //               othername: '',
  //               phone: '',
  //               email: '',
  //               centre: '',
  //               invitedby: 0,
  //           });
  //       } else {
  //           if ('email' in result) {
  //             setEmailError('This email already exists');
  //           } else if ('non_field_errors' in result) {
  //             setNameError('This combination of names already exists');
  //           }
  //           setFormError('An error occurred during submission');
  //       }
  //   } catch (error) {
  //       setFormError('Failed to submit the form: ' + error);
  //   }
  //   setOpen(true)
  // };

  if (isValidated && eventDetails && !success) {
    return (
      <div className="page-container">
        <PageTitle event={eventDetails} />
          <div className="register-form-title">
          {
              active
              ? <>
                <h4>Fill the form below</h4>
                <h5>If you have already registered, <Link href="/attendance/existing">click here to mark your attendance</Link></h5>
                </>
              : <h3>Attendance for this activity is closed!</h3>
          }
          </div>
          {
            active
            ?  <RegisterForm event={eventDetails?.event} mode="add" setSuccess={setSuccess} />
            : ''
            }
      </div>
    );
  }


  if (isValidated && eventDetails && success) {
    return (
      <div className="page-container">
        <PageTitle event={eventDetails} />
        <div className="verify-form">
          <div className="register-form-title success">
            <h4>Welcome{attendee ? ', '+attendee : ''}!</h4>
            <div>Your attendance has been successfully marked.</div>
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
export default function AttendanceForm() {
  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <RegisterUser />
      </Suspense>
    </div>
  );
}