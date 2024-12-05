"use client";

import { useState, FormEvent, ChangeEvent, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import { createFilterOptions } from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';

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

interface User {
  firstName: string;
  surname: string;
  phone: string;
}

const RegisterUser = () => {
  const [isValidated, setIsValidated] = useState(false);
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  // const [firstName, setFirstName] = useState("");
  // const [surname, setSurname] = useState("");
  // const [phone, setPhone] = useState("");
  // const [email, setEmail] = useState("");
  // const [dob, setDob] = useState("");
  const [formData, setFormData] = useState({
    surname: '',
    firstname: '',
    othername: '',
    phone: '',
    email: '',
    centre: '',
    invitedby: '',
  });
  const [emailError, setEmailError] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingNames, setIsCheckingNames] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  useEffect(() => {
    const existingSignupData = localStorage.getItem("signupData");
    if (existingSignupData) {
      <AlertBox 
        status={open} 
        onClose={()=>setOpen(false)} 
        severity="error"
        message="You have already signed up."
      />
      router.push("/success");
    }
  }, [router]);

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
            setNameError('This combination of names already exists.');
          } else {
            setIsCheckingNames(false);
            setNameError('');
          }
      } catch (error) {
        setIsCheckingNames(false);
        setNameError('Failed to validate names.');
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
    //console.log(formData, people)
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (emailError) {
        setFormError('Please fix errors before submitting.');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/add/person/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        const result = await response.json();

        if (response.ok) {
            setSuccessMessage('Form submitted successfully!');
            setFormData({
                surname: '',
                firstname: '',
                othername: '',
                phone: '',
                email: '',
                centre: '',
                invitedby: '',
            });
        } else {
            setFormError(result.error || 'An error occurred during submission.');
        }
    } catch (error) {
        setFormError('Failed to submit the form.');
    }
    setOpen(true)
  };

  /*useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);*/

  if (isValidated && eventDetails) {
    return (
      <div className="page-container">
        <div className="text-xl mb-2 text-green-700">
          <span>Today&apos;s Event</span> 
          <h2>{eventDetails?.name}</h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="register-form"
        >
          <h4 className="register-form-title">Fill the form below</h4>
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
                filterOptions={filterOptions}
                getOptionLabel={(option: any) =>
                  //`${option.participantname}`
                  `${option.surname} ${option.firstname}${option.othername ? ` ${option.othername}` : ''}`
                }
                onChange={(event, value: any) =>
                  setFormData((prevData) => ({
                      ...prevData,
                      invitedby: value ? value.participantid : '',
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
          {successMessage && <AlertBox  status={open} onClose={()=>setOpen(false)} severity="success" message={successMessage} />}
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
        </form>
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
export default function AttendanceForm() {
  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <RegisterUser />
      </Suspense>
    </div>
  );
}