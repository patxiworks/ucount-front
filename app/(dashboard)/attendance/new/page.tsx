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
import Typography from '@mui/material/Typography';

import AlertBox from '@/components/Alerts/Alert';
import { PageTitle } from '@/components/Attendance/PageTitle';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  // Fetch centres on component mount
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/centres/')
        .then((res) => res.json())
        .then((data) => setCentres(data))
        .catch(() => setCentres([])); // Handle errors gracefully

      fetch('http://127.0.0.1:8000/api/people/')
        .then((res) => res.json())
        .then((data) => setPeople(data))
        .catch(() => setPeople([])); // Handle errors gracefully
  }, []);

  // Email validation
  useEffect(() => {
    if (formData.email) {
      const timeoutId = setTimeout(() => {
        setIsCheckingEmail(true);
        fetch(`http://127.0.0.1:8000/api/validate/email/?email=${formData.email}`)
          .then((res) => res.json())
          .then((data) => {
            setIsCheckingEmail(false);
            if (data.exists) {
                setEmailError('This email is already in use.');
            } else {
                setEmailError('');
            }
          })
          .catch(() => {
            setIsCheckingEmail(false);
            setEmailError('Error checking email.');
          });
      }, 500); // Debounce
      return () => clearTimeout(timeoutId); // Cleanup debounce
    }
  }, [formData.email]);


  // Names validation
  useEffect(() => {
    const validateNames = async () => {
      const { surname, firstname, othername } = formData;
      try {
          const response = await fetch(
              `http://127.0.0.1:8000/api/validate/names/?surname=${encodeURIComponent(surname)}&firstname=${encodeURIComponent(firstname)}&othername=${encodeURIComponent(othername || '')}`
          );
          const data = await response.json();
          if (data.exists) {
            setIsCheckingNames(true);
            setNameError('This combination of names already exists');
          } else {
            setIsCheckingNames(false);
            setNameError('');
          }
      } catch (error) {
        setIsCheckingNames(false);
        setNameError('Failed to validate names');
      }
    };

    if (formData.surname) {
      validateNames();
    }
  }, [formData.surname, formData.firstname, formData.othername]);

  // Handle input changes
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
        ...prevData,
        [name]: value && typeof value === 'string' ? value.trim() : value,
    }));
  };

  // Submit form
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setFormError('');
    setSuccess(false)

    if (emailError) {
        setFormError('Please fix errors before submitting');
        return;
    }
    
    try {
        const payload = {
          ...formData,
          eventid: eventDetails?.event, // Replace 2 with a reference to the actual event ID
        };
        //console.log(payload)
        const response = await fetch('http://127.0.0.1:8000/api/add/person/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const result = await response.json();
        //console.log(result)
        if (response.ok) {
            checkEmail_addParticipant(`http://127.0.0.1:8000/api/add/participant/${eventDetails?.event}/`, formData.email, setLoading, setEmailError, setSuccess)
            setFormData({
                surname: '',
                firstname: '',
                othername: '',
                phone: '',
                email: '',
                centre: '',
                invitedby: 0,
            });
        } else {
            if ('email' in result) {
              setEmailError('This email already exists');
            } else if ('non_field_errors' in result) {
              setNameError('This combination of names already exists');
            }
            setFormError('An error occurred during submission');
        }
    } catch (error) {
        setFormError('Failed to submit the form: ' + error);
    }
    setOpen(true)
  };

  if (isValidated && eventDetails && !success) {
    return (
      <div className="page-container">
        <PageTitle event={eventDetails} />
        <form
          onSubmit={handleSubmit}
          className="register-form"
        >
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
            ?  <>
              <Box sx={{ '& .MuiTextField-root': { m: 2, width: '45ch' } }}>
                <div className="form-container">
                  <TextField
                    required
                    id="surname"
                    name="surname"
                    label="Surname"
                    variant="filled"
                    color="secondary"
                    value={formData.surname}
                    onChange={handleChange}
                    error={!!nameError}
                    helperText={nameError}
                  />
                  <TextField
                    required
                    id="firstname"
                    name="firstname"
                    label="First name"
                    variant="filled"
                    color="secondary"
                    value={formData.firstname}
                    onChange={handleChange}
                    error={!!nameError}
                    helperText={nameError}
                  />
                  <TextField
                    id="othername"
                    name="othername"
                    label="Other name"
                    variant="filled"
                    color="secondary"
                    value={formData.othername}
                    onChange={handleChange}
                    error={!!nameError}
                    helperText={nameError}
                  />
                  <TextField
                    required
                    id="email"
                    name="email"
                    label="Email address"
                    variant="filled"
                    color="secondary"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!emailError}
                    helperText={emailError || (isCheckingEmail ? 'Checking...' : '')}
                    focused
                  />
                  <TextField
                    type="number"
                    id="phone"
                    name="phone"
                    label="Phone number"
                    variant="filled"
                    color="secondary"
                    value={formData.phone}
                    onChange={handleChange}
                    focused
                  />
                  <TextField
                    id="centre"
                    name="centre"
                    select
                    label="Which Opus Dei Centre do you attend?"
                    variant="filled"
                    color="secondary"
                    value={formData.centre || ''}
                    onChange={handleChange}
                    focused
                  >
                    {centres.length 
                    ? centres.map((centre: any) => (
                      <MenuItem key={centre.centreid} value={centre.centreid}>
                        {centre.centre}
                      </MenuItem>
                    )) 
                    : ''}
                  </TextField>
                  <Autocomplete
                    options={people || []}
                    id="invitedby"
                    autoComplete
                    defaultValue={{participantid: 1, firstname: '', surname: ''}}
                    filterOptions={filterOptions}
                    getOptionLabel={(option: any) =>
                      //`${option.participantname}`
                      `${option.surname} ${option.firstname}${option.othername ? ` ${option.othername}` : ''}`
                    }
                    onChange={(event, value: any) => 
                      setFormData((prevData) => ({
                          ...prevData,
                          invitedby: value ? value.participantid : 1,
                      }))
                    }
                    renderInput={(params) => (
                      <TextField {...params} 
                        name="invitedby"
                        label="Invited by? (type to search)" 
                        variant="filled" 
                        color="secondary"
                        focused
                      />
                    )}
                    
                  />
                </div>
              </Box>
              <div>
              {formError && <AlertBox status={open} onClose={()=>setOpen(false)} severity="error" message={formError} />}
              </div>
              <Button 
                type="submit"
                variant="contained"
                color="secondary" 
                size="medium"
                disabled={!!emailError || isCheckingEmail || isCheckingNames}
                className={`register-button ${
                  loading ? "disabled" : "enabled"
                }`}
              >
                Register
              </Button>
              </>
            : ''
            }
          </form>
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