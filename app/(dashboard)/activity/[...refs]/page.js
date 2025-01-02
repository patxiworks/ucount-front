"use client"
// components/DynamicActivityForm.js
import { useState, useEffect, forwardRef } from 'react';

import { SessionProvider, useSession } from 'next-auth/react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { useParams } from "next/navigation";
//import { styled } from "@mui/material/styles";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs from 'dayjs';
import TextField from "@mui/material/TextField";
import QrCodeIcon from '@mui/icons-material/QrCode';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';

import AlertBox from '@/components/Alerts/Alert';
import { fetchData, sendDataToServer } from '@/utils/apiUtils'
import { LoadingSpinner } from '@/components/Validate/Validate';
import { 
  saveToOutbox,
  getFromOutbox,
  saveToLocalStorage, 
  getFromLocalStorage, 
  isOnline } from '@/utils/storageUtils';
import QRCodeGen from '@/components/QRCode/QRCodeGen';
import { encrypt } from '@/utils/encryptionUtils';

import '@/styles/pages.css';
//import local from 'next/font/local';

const BACKEND_URL = process.env.NEXT_PUBLIC_UCOUNT_BACKEND_URL

const filter = createFilterOptions();

const getUniqueParticipants = (events) => {
  const uniqueMap = new Map();
  // @typescript-eslint/no-unused-expressions
  events && events.forEach((event) => {
    //console.log(event.participantlist)
    event.participantlist.forEach((participant) => {
      uniqueMap.set(participant.participantid, participant);
    });
  });
  return Array.from(uniqueMap.values());
};

const getHightlightedDays = (events) => {
  return events && events.map(event => event.activitydate)
}

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const DynamicActivityForm = () => {
  const params = useParams();
  const slug = params.refs[0];
  const id = params.refs[1];
  const slugid = slug+'_'+id;
  const { data: session, status } = useSession();
  //const router = useRouter();
  const [formState, setFormState] = useState({});
  const [selectedDate, setSelectedDate] = useState();
  //const [dateType, setDateType] = useState(''); // "past" or "today"
  const [checkedParticipants, setCheckedParticipants] = useState({});
  const [uniqueParticipants, setUniqueParticipants] = useState([]);
  const [participantNames, setParticipantNames] = useState([]);
  //const [autocompleteResults, setAutocompleteResults] = useState([]);
  //const [autocompleteVisible, setAutocompleteVisible] = useState(false);
  const [addedParticipants, setAddedParticipants] = useState([])
  const [newParticipant, setNewParticipant] = useState({
    participantid: Date.now(),
    participantname: '',
    surname: '',
    firstname: '',
    othername: ''
  });
  //const [showNewParticipantForm, setShowNewParticipantForm] = useState(false);
  const [value, setValue] = useState(null);
  const [open, toggleOpen] = useState(false);
  const [highlightedDays, setHighlightedDays] = useState([]);
  const [localMarker, setLocalMarker] = useState("");
  const [hasContent, setHasContent] = useState(false);
  const [saveMessage, setSaveMessage] = useState(['','info'])
  const [openSnack, setOpenSnack] = useState(false);

  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [openPlaceholderDialog, setOpenPlaceholderDialog] = useState(false);
  
  const todayDate = getTodayDate();

  // Fetch activity data on component mount
  useEffect(() => {
    const loadActivityData = async () => {
      if (!session) return;

      const getLocalData = (localData) => {
        if (localData) {
          if (localData?.events) {
            setFormState(localData);
            setUniqueParticipants(getUniqueParticipants(localData?.events));
            setHighlightedDays(getHightlightedDays(localData?.events));
            setHasContent(true);
          }
        }
        setLocalMarker(<CloudOffIcon fontSize="small" />)
      }
      
      const localData = getFromLocalStorage(slugid);
      if (isOnline()) {
        const url = `${BACKEND_URL}/api/activity/${slug}/events/${id}/`;
        const datares = await fetchData(url, "GET", null, session.accessToken);
        if (datares) {
          console.log(datares)
          const data = datares.output //datares is a json object with format {error: ..., output: ...}. See apiUtils.js for reference
          if (data?.events) {
            setFormState(data);
            //console.log(data.events)
            //console.log(getUniqueParticipants(data.events))
            setUniqueParticipants(getUniqueParticipants(data.events));
            setHighlightedDays(getHightlightedDays(data.events));
            //saveToLocalStorage("formData", data); // Store data from server in local storage
            saveToLocalStorage(slugid, data); // Store data from server in local storage
            setHasContent(true);
            setLocalMarker("")
          }
        } else {
          getLocalData(localData)
        }
      } else if (localData) {
        getLocalData(localData);
      }
    };
    loadActivityData();
    handleDateTypeChange()
  }, [session]);


  useEffect(() => { 
    if (Object.keys(formState).length) {
      handleDateChange(dayjs(selectedDate))
    }
  }, [formState]);
  

  // Fetch participants from API
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!session) return;
      const url = `${BACKEND_URL}/api/people/vig/?cat=cp&cat=fr`;
      const data = await fetchData(url, "GET", null, session.accessToken);
      if (data) {
        setParticipantNames(data.output);
      }
    };
    fetchParticipants();
  }, [session]);


  // Check the outbox when back online
  useEffect(() => {
    if (isOnline()) {
      processOutbox();
    }
  }, [isOnline()]);


  // Check the outbox every hour
  useEffect(() => {
    const interval = setInterval(() => {
      processOutbox();
    }, 60 * 60 * 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [session]);


  const processOutbox = async () => {
    const outbox = getFromOutbox() || [];
    if (outbox.length > 0 && isOnline() && session?.accessToken) {
      const successfullySent = await Promise.all(outbox.map((data) => sendDataToServer(data, session.accessToken)));
      if (successfullySent.every(Boolean)) {
        saveToOutbox([]); // Clear outbox if all items sent
      }
    }
  };

  const handleDeleteParticipant = (participantId) => {
      setUniqueParticipants((prev) =>
        prev.filter((participant) => participant.participantid !== participantId)
      );
      setValue(null) // reset the autocomplete input
  };

  const handleAddedCheck = (participant) => {
    //console.log(checkedParticipants, addedParticipants)
    return addedParticipants.some(p => p.participantname == participant.participantname)
  }

  const handleDateTypeChange = () => {
    //setDateType(type);
    setSelectedDate(selectedDate ?? todayDate);
    setCheckedParticipants({});
  };

  const handleDateChange = (e) => {
    //console.log(dayjs(e).format('YYYY-MM-DD'))
    //const date = e.target.value;
    const date = dayjs(e).format('YYYY-MM-DD')
    setSelectedDate(date);

    // Find participants who attended on the selected date
    const event = formState?.events?.find((ev) => ev.activitydate === date);
    const newCheckedParticipants = {};

    if (event) {
      event.participantlist.forEach((participant) => {
        newCheckedParticipants[participant.participantid] = true;
      });
    }
    setCheckedParticipants(newCheckedParticipants);
  };

  const handleCheckboxChange = (participantId) => {
    setCheckedParticipants((prev) => ({
      ...prev,
      [participantId]: !prev[participantId],
    }));
  };

  const handleAutocompleteInputChange = (item) => {
    //console.log(newParticipant, item)
    const fullname = item.participantname //e.target.value;
    setNewParticipant((prev) => ({ ...prev, ...item }));

    // if (fullname.length >= 2) {
    //   const filteredResults = participantNames.filter((participant) =>
    //     participant.participantname.toLowerCase().includes(fullname.toLowerCase())
    //   );
    //   setAutocompleteResults(filteredResults);
    //   setAutocompleteVisible(filteredResults.length > 0);
    //   //console.log(participantNames, newParticipant, filteredResults)
    // } else {
    //   setAutocompleteVisible(false);
    // }
  };

  // const handleAutocompleteSelect = (selectedName) => {
  //   setNewParticipant((prev) => ({ ...prev, participantname: selectedName }));
  //   setAutocompleteVisible(false);
  //   setShowNewParticipantForm(false);
  // };

  const handleDuplicateNameCheck = (obj, value) => {
    return obj.some(
      (participant) => participant.participantname.toLowerCase() === value.toLowerCase()
    );
  }

  const handleNewParticipantCheck = () => {
    const exists = participantNames.some(
      (participant) => participant.participantname.toLowerCase() === newParticipant.participantname.toLowerCase()
    );

    // if (!exists && newParticipant.participantname) {
    //   setShowNewParticipantForm(true);
    // } else {
    //   setShowNewParticipantForm(false);
    // }
  };

  // const handleNewParticipantChange = (e) => {
  //   const { name, value } = e.target;
  //   setNewParticipant((prev) => ({ ...prev, [name]: value }));
  // };

  const handleAddParticipant = async () => {
    console.log(newParticipant, uniqueParticipants)
    if (!newParticipant.surname || !newParticipant.firstname) return;

    const combinedName = `${newParticipant?.surname ?? ''} ${newParticipant?.firstname ?? ''} ${newParticipant?.othername ?? ''}`;
    const fullName = combinedName.replace(/\s+/g, ' ').trim()
    const newId =  newParticipant?.originalid ?? Date.now();
    //const newId =  newParticipant?.originalid ? newParticipant?.participantid : Date.now();

    const addToList = () => {
      setUniqueParticipants((prev) => [
        ...prev,
        { ...newParticipant, participantid: newId }
      ]);
      setAddedParticipants((prev) => [...prev, newParticipant])
      handleCheckboxChange(newId) // add checkbox to the new participant entry
      setValue('') // empty the autocomplete input

      if (!handleDuplicateNameCheck(participantNames, fullName)) {
        setParticipantNames((prev) => [...prev, { participantid: newId, participantname: fullName }]);
      }

      setNewParticipant({
        participantid: newId,
        originalid: '',
        participantname: '',
        surname: '',
        firstname: '',
        othername: '',
      });
    }

    if (!handleDuplicateNameCheck(uniqueParticipants, fullName)) {
      if (!newParticipant.originalid) { // i.e. if the user does not already exist in the database
        if (!newParticipant.othername) newParticipant.othername = ""
        const data = {...newParticipant, participantid: newId}
        // send to database as a placehoder
        const response = await sendDataToServer(`${BACKEND_URL}/api/add/placeholder/`, data, session.accessToken);
        if (response.error) {
          console.log(response)
          setSaveMessage([response.detail, "error"])
          setOpenSnack(true);
        } else {
          // if successfully added to database...
          addToList()
        }
      } else {
        addToList();
      }
    }
    //setShowNewParticipantForm(false);
  };

  const handleClose = () => {
    setDialogValue({
      title: '',
      year: '',
    });
    toggleOpen(false);
  };

  const [dialogValue, setDialogValue] = useState({
    title: '',
    year: '',
  });

  const handleDialogSubmit = async (event) => {
    event.preventDefault();
    //console.log(dialogValue)
    let fullname = (dialogValue?.surname ?? '') + ' ' + (dialogValue?.firstname ?? '') + ' ' + (dialogValue?.othername ?? '')
    fullname = fullname.replace(/\s+/g, ' ').trim()
    const data = {
      participantname: fullname,
      surname: dialogValue.surname,
      firstname: dialogValue.firstname, //parseInt(dialogValue.year, 10),
      othername: dialogValue.othername ?? '',
    };
    setValue(data)
    handleClose();
    handleNewParticipantCheck();
    
  };

  const processEntryDetails = (response) => {
    //console.log(response)
    if ('error' in response) {
      if (response.error) {
        return [response.detail, 'error']
      } else {
        //const created = response?.detail?.created?.length
        //const deleted = response?.detail?.deleted?.length
        const errors = response?.detail?.errors?.length
        const alert = errors ? 'info' : 'success'
        /*if (created) {
          if (!deleted) {
            return [`${created} successfully added`, alert]
          } else {
            return [`Successfully saved: ${created} added, ${deleted} removed`, alert]
          }
        } else {
          if (!deleted) {
            return ['Nothing was saved', alert]
          } else {
            return [`${deleted} successfully removed`, alert]
          }
        }*/
        return [`Changes made successfully`, alert]
      }
    }
  }

  const storeInOutbox = (data) => {
    const outbox = getFromOutbox() || [];
    outbox.push(data);
    saveToOutbox(outbox);
  }

  const handleStorage = async (updatedData) => {
    //saveToLocalStorage("formData", updatedData);
    saveToLocalStorage(slugid, updatedData);
    
    if (isOnline()) {
      const response = await sendDataToServer(`${BACKEND_URL}/api/add/attendance/`, updatedData, session.accessToken);
      console.log(response)
      if (response.error) {
        setSaveMessage(processEntryDetails(response))
        storeInOutbox(updatedData)
      } else {
        setSaveMessage(processEntryDetails(response))
      }
    } else {
      setSaveMessage(['You seem to be offline. Check your connection.','warning'])
      storeInOutbox(updatedData)
    }
    setOpenSnack(true);
  }


  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedParticipants = uniqueParticipants.filter(
      (participant) => checkedParticipants[participant.participantid]
    );

    const newEvent = {
      activitydate: selectedDate,
      //activityid: formState.activity[0]?.activitytypeid,
      eventid: Date.now(),
      total: selectedParticipants.length,
      participantlist: selectedParticipants.map((participant) => ({
        participantid: participant.participantid,
        participantname: participant.participantname,
        participantcategory: participant.participantcategory,
        participantgroup: participant.participantgroup,
        total: participant.total,
      })),
    };
    
    // submit only if participants have been selected
    if (selectedParticipants.length) {
      // check if date already exists. If there is none append it; if there is, replace its data
      const index = formState.events.findIndex(i => i.activitydate === selectedDate)
      if (index == -1) {
        setFormState((prevState) => ({
          ...prevState,
          currentdate: selectedDate,
          events: [...prevState.events, newEvent],
        }));
        const updatedData = {
          ...formState,
          currentdate: selectedDate,
          events: [...formState.events, newEvent]
        };
        //console.log(updatedData)
        handleStorage(updatedData)
      } else {
        formState.events[index] = newEvent;
        formState['currentdate'] = selectedDate;
        const updatedData = formState;
        //console.log(formState);
        handleStorage(updatedData)
      }
      
      setAddedParticipants([]) // empty the array of freshly added participants
      processOutbox();  // Try sending outbox on every new submit
    }
  };

  function ServerDay(props) {
    const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;
  
    const isSelected =
      !props.outsideCurrentMonth && highlightedDays.indexOf(day.format("YYYY-MM-DD")) >= 0;
  
    return (
      <PickersDay 
        {...other} 
        outsideCurrentMonth={outsideCurrentMonth} 
        day={day} 
        sx={{backgroundColor: isSelected ? '#4CAF50' : undefined}} 
      />
    );
  }

  const handleCloseSnack = () => {
    setOpenSnack(false);
  };

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <p>Please sign in to access this form.</p>;
  }

  // Ensure activity data is loaded before rendering
  if (!formState) {
    return <LoadingSpinner />;
  }

  if (hasContent) {
    return (
      <>
      <div className="localmarker_icon">{localMarker}</div>
      <form className="form-container">
        <QrCodeIcon onClick={()=>setOpenQRDialog(true)} fontSize='1rem' sx={{float: 'left', cursor: 'pointer'}} />
        <LinkIcon onClick={()=>setOpenPlaceholderDialog(true)} fontSize='2rem' sx={{float: 'right', cursor: 'pointer'}} />
        <div className="title">
          <h5>{formState?.activity?.activitytypename}</h5>
          <h3>{formState?.activitylabel}</h3>
          <h6>{formState?.activitycentre}</h6>
        </div>
        <div className="date-box">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MobileDatePicker
              value={dayjs(todayDate)}
              format="LL"
              maxDate={dayjs(todayDate)}
              onChange={handleDateChange}
              slots={{
                day: ServerDay,
              }}
              slotProps={{ 
                toolbar: { hidden: true },
                day: { highlightedDays }
              }}
              
            />
          </LocalizationProvider>
        </div>

        <div className='list-box'>
          {/*JSON.stringify(uniqueParticipants)*/}
          {uniqueParticipants.map((participant) => (
            <div key={participant.participantid} className={`${'list-item'}`}>
              <label 
                key={participant.participantid} 
                className={`
                  form-control 
                  ${'originalid' in participant && !participant?.originalid ? 'temp' : ''}
                  ${'participanttype' in participant && participant?.participanttype === 'Placeholder' ? 'temp' : ''}
                `}
              >
                <span>{participant.participantname}</span>
                <input
                  type="checkbox"
                  checked={checkedParticipants[participant.participantid] || handleAddedCheck(participant)}
                  onChange={() => handleCheckboxChange(participant.participantid)}
                />
              </label>
              {
                handleAddedCheck(participant)
                ? <button
                    type="button"
                    onClick={() => handleDeleteParticipant(participant.participantid)}
                    className="delete-button"
                  >
                  X
                  </button>
                : <div className="delete-button-ph"></div>
              }
            </div>
          ))}
          {isOnline() && <><Autocomplete
            value={value || null}
            onChange={(event, newValue) => {
              if (typeof newValue === 'string') {
                // timeout to avoid instant validation of the dialog's form.
                setTimeout(() => {
                  toggleOpen(true);
                  setDialogValue({
                    participantname: newValue,
                    surname: '',
                    firstname: '',
                    othername: '',
                  });
                });
              } else if (newValue && newValue.inputValue) {
                toggleOpen(true);
                const names = newValue.inputValue.split(/\s+/)
                const nameObj = {
                  participantname: newValue.inputValue,
                  surname: names[0],
                  firstname: names[1],
                  othername: names[2],
                };
                setDialogValue(nameObj)
                //handleAutocompleteInputChange(nameObj)
              } else {
                setValue(newValue);
              }
            }}
            onInputChange={(event, newInputValue) => {
              const index = participantNames.findIndex(i=>i.participantname==newInputValue)
              const originalid = participantNames[index]?.participantid ?? undefined
              const names = newInputValue.split(/\s+/)
              const nameObj = {
                originalid: originalid,
                participantname: newInputValue,
                surname: names[0],
                firstname: names[1],
                othername: names[2],
              };
              handleAutocompleteInputChange(nameObj)
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);

              if (formState.activity.activityformat == 'open') {
                if (params.inputValue !== '' && params.inputValue.length > 2) {
                  filtered.push({
                    inputValue: params.inputValue,
                    participantname: `Add "${params.inputValue}"`,
                  });
                }
              }

              return filtered;
            }}
            id="add-participant-form"
            options={participantNames || []}
            //options={!participantNames ? [{participantname:"Loading...", participantid:0}] : participantNames }
            getOptionLabel={(option) => {
              // for example value selected with enter, right from the input
              if (typeof option === 'string') {
                return option;
              }
              if (option.inputValue) {
                return option.inputValue;
              }
              return option.participantname;
            }}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            renderOption={(props, option) => {
              const { key, ...optionProps } = props;
              return (
                <li key={key} {...optionProps}>
                  {option.participantname}
                </li>
              );
            }}
            sx={{ width: '100%', border: 0, display: 'flex' }}
            //{...(formState.activity.activityformat == 'open' ? freeSolo={freeSolo} : {})}
            renderInput={(params) => 
              <>
                <TextField {...params} label="New participant" variant="standard" />
                <button type="button" className="button add-button" onClick={handleAddParticipant}>
                  Add
                </button>
              </>
            }
          />
          <Dialog open={open} onClose={handleClose}>
            <form onSubmit={handleDialogSubmit} className="add-dialog">
              <DialogTitle>Add a new participant</DialogTitle>
              <DialogContent>
                <DialogContentText></DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  id="surname"
                  value={dialogValue.surname || ''}
                  onChange={(event) =>
                    setDialogValue({
                      ...dialogValue,
                      surname: event.target.value,
                    })
                  }
                  sx={{width:'100%'}}
                  label="Surname"
                  type="text"
                  variant="standard"
                />
                <TextField
                  margin="dense"
                  id="firstname"
                  value={dialogValue.firstname || ''}
                  onChange={(event) =>
                    setDialogValue({
                      ...dialogValue,
                      firstname: event.target.value,
                    })
                  }
                  sx={{width:'100%'}}
                  label="First name"
                  type="text"
                  variant="standard"
                />
                <TextField
                  margin="dense"
                  id="othername"
                  value={dialogValue.othername || ''}
                  onChange={(event) =>
                    setDialogValue({
                      ...dialogValue,
                      othername: event.target.value,
                    })
                  }
                  sx={{width:'100%'}}
                  label="Other name"
                  type="text"
                  variant="standard"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit">Add</Button>
              </DialogActions>
            </form>
          </Dialog>
          </>
          }
        </div>
        <AlertBox 
          status={openSnack} 
          onClose={handleCloseSnack} 
          severity={saveMessage[1]} 
          message={saveMessage[0]}
        />

        <button type="submit" onClick={handleSubmit} className="button save-button" disabled={!(selectedDate)}>
          Save
        </button>
        <QRCodeDialog open={openQRDialog} handleClose={()=>setOpenQRDialog(false)} activityid={formState.activityid} />
        <PlaceholderListDialog open={openPlaceholderDialog} handleClose={()=>setOpenPlaceholderDialog(false)} participants={uniqueParticipants} />
      </form>
      </>
    );
  }

  if (!hasContent) {
    return (
      <div className="form-container" style={{textAlign: 'center'}}>
        <h3>Looks like you&apos;re offline</h3>
        <h4>If you&apos;re online, then the problem might be from us...</h4>
        </div>
    )
  }

  return <LoadingSpinner />;
};



const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const QRCodeDialog = ({ open, handleClose, activityid }) => {

  return (
    <Dialog
        onClose={handleClose}
        open={open}
        TransitionComponent={Transition}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Event Attendance QR Code
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <QRCodeGen activityid={activityid} />
        </DialogContent>
    </Dialog>
  )
}

const PlaceholderListDialog = ({ open, handleClose, participants }) => {
  const [copied, setCopied] = useState('Copy link')
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied('Link copied!');
  };

  const placeholders = []
  for (var p of participants) {
    if (p.participanttype == 'Placeholder' || !p?.originalid) placeholders.push(p.participantname)
  }

  return (
    <Dialog
        onClose={handleClose}
        open={open}
        TransitionComponent={Transition}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Attendees yet to formally register
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <div className='placeholder-list'>
            <ul>
              {
                placeholders.length ?
                  participants.map((p,i) => {
                    const link = `http://localhost:3000/register/?p=${encrypt(p.participantid+','+p.participantname)}`
                    return (
                      p.participanttype === 'Placeholder' || !p?.originalid
                      ? <li key={i} style={{display:'flex'}}>
                          <span className='name'>{p.participantname}</span>
                          <span className='copy' onClick={() => copyToClipboard(link)}>{copied}</span>
                        </li>
                      : ''
                    )
                  })
                : <span>The list is empty</span>
              }
            </ul>
          </div>
        </DialogContent>
    </Dialog>
  )
}

export default function ActivityFormPage() {
  return (
    <SessionProvider >
      <ProtectedRoute>
        <DynamicActivityForm />
      </ProtectedRoute>
    </SessionProvider>
  );
}