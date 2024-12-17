
import { useState, useEffect } from "react";

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import { createFilterOptions } from '@mui/material/Autocomplete';

import { addParticipant, updateParticipant } from "@/utils/apiUtils";
import AlertBox from '@/components/Alerts/Alert';

import '@/styles/attendance.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_UCOUNT_BACKEND_URL

export const PageTitle = ({ event }) => {
    return (
      <div className="main-title">
        <span>Current activity:</span> 
        <h2>{event?.name}</h2>
      </div>
    )
}

export const RegisterForm = (props) => {
    const { surname, firstname, othername } = props
    const [eventDetails, setEventDetails] = useState(null);
    const [formData, setFormData] = useState({
      surname: surname || '',
      firstname: firstname || '',
      othername: othername || '',
      phone: '',
      email: '',
      centre: '',
      invitedby: 0,
    });
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [isCheckingNames, setIsCheckingNames] = useState(false);
    const [formError, setFormError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [nameError, setNameError] = useState('');
    // const [success, setSuccess] = useState(false);
    // const [active, setActive] = useState(true);
  
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
  
    //const { login } = useAuth();
    //const router = useRouter();
    //const dropdownRef = useRef<HTMLDivElement>(null);
  
    const [centres, setCentres] = useState([]);
    const [people, setPeople] = useState([]);
    
  
    const OPTIONS_LIMIT = 5;
    const filterOptions = createFilterOptions({
      limit: OPTIONS_LIMIT
    });
  
    // Fetch centres on component mount
    useEffect(() => {
      fetch(`${BACKEND_URL}/api/centres/`)
          .then((res) => res.json())
          .then((data) => setCentres(data))
          .catch(() => setCentres([])); // Handle errors gracefully
  
        fetch(`${BACKEND_URL}/api/people/`)
          .then((res) => res.json())
          .then((data) => setPeople(data))
          .catch(() => setPeople([])); // Handle errors gracefully
    }, []);
  
    // Email validation
    useEffect(() => {
      if (formData.email) {
        const timeoutId = setTimeout(() => {
          setIsCheckingEmail(true);
          fetch(`${BACKEND_URL}/api/validate/email/?email=${formData.email}`)
            .then((res) => res.json())
            .then((data) => {
              setIsCheckingEmail(false);
              if (data.exists) {
                  setEmailError('This email is already in use.');
              } else {
                  setEmailError(undefined);
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
                `${BACKEND_URL}/api/validate/names/?surname=${encodeURIComponent(surname)}&firstname=${encodeURIComponent(firstname)}&othername=${encodeURIComponent(othername || '')}`
            );
            const data = await response.json();
            //console.log(data)
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
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
          ...prevData,
          [name]: value && typeof value === 'string' ? value.trim() : value,
      }));
    };
  
    // Submit form
    const handleSubmit = async (e) => {
      e.preventDefault();
      setFormError('');
      props.setSuccess(false)
  
      if (emailError) {
          setFormError('Please fix errors before submitting');
          return;
      }
      try {
          const payload = {
            ...formData,
            //eventid: eventid ?? eventDetails?.event,
          };
          //console.log(payload)
          const response = await fetch(`${BACKEND_URL}/api/add/person/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          const result = await response.json();
          //console.log(result)
          if (response.ok) {
            if (props.mode == 'add') {
                addParticipant(`${BACKEND_URL}/api/add/participant/${props.event}/`, formData.email, setLoading, setEmailError, props.setSuccess)
            } else if (props.mode == 'update') {
                updateParticipant(`${BACKEND_URL}/api/update/participant`, props.placeholderid, result.personid, setLoading, setEmailError, props.setSuccess)
            }
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
          setFormError('Failed to submit the form');
          console.log(error);
      }
      setOpen(true)
    };
  
    return (
      <form className="register-form" onSubmit={handleSubmit}>
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
              disabled={surname ? true : false}
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
              disabled={firstname ? true : false}
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
              disabled={othername ? true : false}
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
              ? centres.map((centre) => (
                <MenuItem key={centre.centreid} value={centre.centreid}>
                  {centre.centre}
                </MenuItem>
              )) 
              : <div></div>}
            </TextField>
            <Autocomplete
              options={people || []}
              id="invitedby"
              autoComplete
              defaultValue={{participantid: 1, firstname: '', surname: ''}}
              filterOptions={filterOptions}
              getOptionLabel={(option) =>
                //`${option.participantname}`
                `${option.surname} ${option.firstname}${option.othername ? ` ${option.othername}` : ''}`
              }
              onChange={(event, value) => 
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
      </form>
    );
  }