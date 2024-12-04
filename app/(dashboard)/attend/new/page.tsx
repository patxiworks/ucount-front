"use client";

import { useState, FormEvent, ChangeEvent, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
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
  });
  const [emailError, setEmailError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [invitedBy, setInvitedBy] = useState("");
  const [invitedBySuggestions, setInvitedBySuggestions] = useState<User[]>([]);
  const [selectedInvitedBy, setSelectedInvitedBy] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [noSession, setNoSession] = useState(false);

  //const { login } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currencies = [
    {
      value: 'USD',
      label: '$',
    },
    {
      value: 'EUR',
      label: '€',
    },
    {
      value: 'BTC',
      label: '฿',
    },
    {
      value: 'JPY',
      label: '¥',
    },
  ];

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

  // Email validation
  useEffect(() => {
    if (formData.email) {
      console.log(formData.email)
      const timeoutId = setTimeout(() => {
        setIsChecking(true);
        fetch(`http://127.0.0.1:8000/api/check-email/?email=${formData.email}`)
          .then((res) => res.json())
          .then((data) => {
              setIsChecking(false);
              if (data.exists) {
                  setEmailError('This email is already in use.');
              } else {
                  setEmailError('');
              }
          })
          .catch(() => {
              setIsChecking(false);
              setEmailError('Error checking email.');
          });
      }, 500); // Debounce
      return () => clearTimeout(timeoutId); // Cleanup debounce
    }
  }, [formData.email]);

  // Handle input changes
  const handleChange = (e: any) => {
    console.log(e.target.name, e.target.value)
    const { name, value } = e.target;
    setFormData((prevData) => ({
        ...prevData,
        [name]: value,
    }));
  };

  // Submit form
  const handleSubmit = async (e: any) => {
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
            });
        } else {
            setFormError(result.error || 'An error occurred during submission.');
        }
    } catch (error) {
        setFormError('Failed to submit the form.');
    }
  };

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setInvitedBySuggestions([]);
      return;
    }

    try {
      const res = await fetch(`/api/users/search?query=${query}`);
      const data = await res.json();
      setInvitedBySuggestions(data.users);
    } catch {
      console.log("Failed to fetch suggestions");
    }
  };

  const handleInvitedByChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInvitedBy(value);
    setIsDropdownOpen(true);
    fetchSuggestions(value);
  };

  useEffect(() => {
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
  }, []);

  const handleSelectInvitedBy = (user: User) => {
    setSelectedInvitedBy(user.firstName + " " + user.surname);
    setInvitedBy(user.firstName + " " + user.surname);
    setIsDropdownOpen(false);
  };

  /*const handleSignup = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/events.json");
      const events: Event[] = await response.json();

      // Find the event matching today's date and within its attendance time
      const now = new Date().toISOString().split("T")[0];
      const activeEvent = events.find(
        (event) =>
          event.date === now && isAttendanceTime(event.startTime, event.endTime)
      );

      if (!activeEvent) {
        <AlertBox 
          status={open} 
          onClose={()=>setOpen(false)} 
          severity="error"
          message="No active event at this time."
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
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify({
          firstName,
          surname,
          phone,
          email,
          dob,
          invitedBy: selectedInvitedBy,
        }),
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

        const signupData = {
          firstName,
          surname,
          phone,
          email,
          dob,
          invitedBy: selectedInvitedBy,
          timestamp: new Date().toLocaleString(),
        };
        localStorage.setItem("signupData", JSON.stringify(signupData));

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
        severity="error"
        message={"Signup failed!"}
      />
    } finally {
      setLoading(false);
    }
  };*/

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
                sx={{width: 600}}
                onChange={handleChange}
                value={formData.surname || undefined}
                focused
              />
              <TextField
                required
                id="firstname"
                name="firstname"
                label="First name"
                variant="filled"
                color="secondary"
                value={formData.firstname || undefined}
                onChange={handleChange}
                focused
              />
              <TextField
                id="othername"
                name="othername"
                label="Other name"
                variant="filled"
                color="secondary"
                value={formData.othername || undefined}
                onChange={handleChange}
                focused
              />
              <TextField
                required
                id="email"
                name="email"
                label="Email address"
                variant="filled"
                color="secondary"
                value={formData.email || undefined}
                onChange={handleChange}
                error={!!emailError}
                helperText={emailError || (isChecking ? 'Checking...' : '')}
                focused
              />
              <TextField
                type="number"
                id="phone"
                name="phone"
                label="Phone number"
                variant="filled"
                color="secondary"
                value={formData.phone || undefined}
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
                {currencies.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <Autocomplete
                options={top100Films || []}
                id="friend"
                autoComplete
                getOptionLabel={(option) => option.title}
                renderInput={(params) => (
                  <TextField {...params} 
                    name="friend"
                    label="Invited by? (type to search)" 
                    variant="filled" 
                    color="secondary"
                    focused
                  />
                )}
                
              />
            </div>
          </Box>
          {formError && <Typography color="error">{formError}</Typography>}
          {successMessage && <Typography color="success">{successMessage}</Typography>}
          <Button 
            type="submit"
            variant="contained"
            color="secondary" 
            size="medium"
            disabled={!!emailError || isChecking}
            className={`register-button ${
              loading ? "disabled" : "enabled"
            }`}
          >
            Register
          </Button>
          {/*<label className="block mb-2">Surname</label>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Surname"
            className="mb-4 w-full px-4 py-2 border rounded"
            required
          />

          <label className="block mb-2">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            className="mb-4 w-full px-4 py-2 border rounded"
            required
          />

          <label className="block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="mb-4 w-full px-4 py-2 border rounded"
            required
          />

          <label className="block mb-2">Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="mb-4 w-full px-4 py-2 border rounded"
            required
          />

          <label className="block mb-2">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            className="mb-4 w-full px-4 py-2 border rounded"
            required
          />

          <label className="block mb-2">Invited By</label>
          <div ref={dropdownRef} className="relative">
            <input
              type="text"
              value={invitedBy}
              onChange={handleInvitedByChange}
              placeholder="Invited By (type to search)"
              className="w-full px-4 py-2 border rounded"
              required
              onClick={() => setIsDropdownOpen(true)}
            />
            {isDropdownOpen && invitedBySuggestions.length > 0 && (
              <ul className="absolute z-10 bottom-full mb-2 bg-white border rounded-md shadow-lg w-full max-h-40 overflow-y-auto">
                {invitedBySuggestions.map((user) => (
                  <li
                    key={user.phone}
                    onClick={() => handleSelectInvitedBy(user)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                  >
                    {user.firstName} {user.surname}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white rounded ${
              loading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
            } mt-[20px]`}
          >
            {loading ? "Loading" : "Submit"}
          </button>*/}
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

const top100Films = [
  { title: 'The Shawshank Redemption', year: 1994 },
  { title: 'The Godfather', year: 1972 },
  { title: 'The Godfather: Part II', year: 1974 },
  { title: 'The Dark Knight', year: 2008 },
  { title: '12 Angry Men', year: 1957 },
  { title: "Schindler's List", year: 1993 },
]