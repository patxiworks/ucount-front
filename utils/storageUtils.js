// utils/storageUtils.js

// Save data to oubox
export const saveToOutbox = (data) => {
    const key = "ucount_outbox";
    localStorage.setItem(key, JSON.stringify(data));
};

// Retrieve data from outbox
export const getFromOutbox = () => {
    const key = "ucount_outbox";
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

// Save data to local storage
export const saveToLocalStorage = (subKey, subValue) => {
    const fullDataKey = 'ucount'; // Single key to store the combined data
    let fullData = JSON.parse(localStorage.getItem(fullDataKey)) || {};

    // Update the specific key with the new value
    fullData[subKey] = subValue;

    // Save the updated object back to localStorage
    localStorage.setItem(fullDataKey, JSON.stringify(fullData));
};

// Retrieve data from local storage
export const getFromLocalStorage = (subkey) => {
    const fullDataKey = 'ucount'; // Key for the combined data
    const fullData = JSON.parse(localStorage.getItem(fullDataKey)) || {};

    // Return the value for the specific sub-key
    return fullData[subkey] || null;
};


// Check if user is online
export const isOnline = () => typeof window !== "undefined" && window.navigator.onLine;
  
  