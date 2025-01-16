// utils/apiUtils.js

const errorMessages = async (response) => {
    console.log(response)
    // Handle different HTTP status codes more specifically
    switch (response.status) {
        case 400:
            //throw new Error('Bad Request: Please check your input data.');
            return 'Bad Request: Please check your input data.'
        case 401:
            //throw new Error('Unauthorized: Please log in to continue.');
            return 'Unauthorized: Please log in to continue.'
        case 403:
            //throw new Error('Forbidden: You do not have permission to perform this action.');
            return 'Forbidden: You do not have permission to perform this action.'
        case 404:
            //throw new Error('Not Found: The endpoint does not exist.');
            return 'Not Found: Invalid request.'
        case 500:
            //throw new Error('Internal Server Error: Please try again later.');
            return 'Internal Server Error: Please try again later.'
        default:
            const errorData = await response.json();
            return `Unexpected Error: ${response.status} - ${errorData.detail || 'Unknown error occurred'}`;
    }
    return error;
}

// Fetch data from server
export async function fetchData(url, method = "GET", body = null, token = null) {
    const servres = {'error': false}
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Token ${token}`;
        }
        const config = {
            method,
            headers,
        };
        if (body) {
            config.body = JSON.stringify(body);
        }

        const response = await fetch(url, config);
        if (!response.ok) {
            //const errorData = await response.json();
            //throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
            servres['error'] = true
            servres['status'] = response.status
            servres['detail'] = response.statusText
        }
        const data = await response.json();
        servres['output'] = data
        return servres;
    } catch (error) {
        console.error("Failed to fetch data:", error);
        return null;
    }
  }

  // Send data to the server
  export const sendDataToServer = async (url, data, token) => {
    const servres = {'error': false}
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(data),
      });
      const res = await response.json();
      if (!response.ok) { //throw new Error("Failed to send data to server");
        return {error: true, detail: 'An unexpected error occurred. Please contact the admin.'};
      }
      return {error: false, detail: res};
    } catch (error) {
      return {error: error, detail: 'Failed to add participants. Please try again later.'};
    }
  };


// check email and add participants (does not use session token)
export const addParticipant = async (url, email, setLoading, setEmailError, setSuccess) => {
    setSuccess(false)
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });
        
        const result = await response.json();
        //console.log(result)
        if (response.ok) {
            const ucount_attendance = { 
                user: {
                    firstname: result?.data?.firstname, 
                    surname: result?.data?.surname
                }, 
                email, 
                timestamp: new Date().toISOString() 
            };
            localStorage.setItem("ucount_attendance", JSON.stringify(ucount_attendance));
            setLoading(false);
            setSuccess(true)
            setEmailError([]);
            console.log(result.message);
        } else {
            setLoading(false);
            setEmailError([result.message, false]);
            //console.error('Error:', result.exc);
        }
    } catch (error) {
        setLoading(false);
        setEmailError(['Something went wrong. Please try again later.', false]);
        console.error('Request failed:', error);
    }
};


// check email and add participants (does not use session token)
export const updateParticipant = async (url, placeholderId, personId, setLoading, setEmailError, setSuccess) => {
    setSuccess(false)
    if (!placeholderId || !personId) {
        setEmailError("Invalid request url");
        return;
    }
  
    try {
        // API request to update participant
        const response = await fetch(
          `${url}/${placeholderId}/${personId}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        if (response.ok) {
            //const errorData = await response.json();
            setLoading(false);
            setSuccess(true)
            setEmailError([]);
            console.log(result.message);
        } else {
            setLoading(false);
            setEmailError([result.message, false]);
            //console.error('Error:', result.exc);
        }
    } catch (error) {
        setLoading(false);
        setEmailError(['Something went wrong. Please try again later.', false]);
        console.error('Request failed:', error);
    }
};