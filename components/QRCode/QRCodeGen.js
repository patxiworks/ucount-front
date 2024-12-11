"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Button from '@mui/material/Button';

import { fetchData } from '@/utils/apiUtils'
import { encrypt } from "@/utils/encryptionUtils";
import pako from 'pako';

/*interface Event {
  date: string;
  name: string;
  startTime: string;
  endTime: string;
}*/

const compressData = (data) => {
  try {
    const stringData = new TextEncoder().encode(data);
    const compressed = pako.deflate(stringData);
    return btoa(String.fromCharCode.apply(null, [...compressed]));
  } catch (error) {
    console.error('Compression error:', error);
    return btoa(encodeURIComponent(data));
  }
};

export default function QRCodeGen({ activityid }) {
  const [encryptedData, setEncryptedData] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [qrSize, setQrSize] = useState(400);
  const qrCodeRef = useRef(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchAndEncryptEvents = async () => {
      try {
        //const response = await fetch("http://127.0.0.1:8000/api/sample/");
        //const data = await response.json();
        if (!session) return;
        const url = `http://127.0.0.1:8000/api/events/${activityid}/`;
        const data = await fetchData(url, "GET", null, session?.accessToken);
        //console.log(data)
        if (!data?.error) {
          if (data?.output.length) {
            // Include all event details in the QR code
            const events = data.output.map(({ event, date, name, startTime, endTime }) => ({
              event,
              date: date.replace(/-/g, '').slice(2),
              name,
              startTime,
              endTime
            }));

            events.sort((a, b) => a.date.localeCompare(b.date));

            const eventsString = JSON.stringify(events);
            const compressedEvents = compressData(eventsString);
            const encryptedEvents = encrypt(compressedEvents);
            setEncryptedData(encryptedEvents);

          } else {
            setErrorMessage('There is no data to display')
          }
        } else {
          setErrorMessage('There was problem. Could not fetch the data.')
          console.error("Failed to obtain the event data:" + data?.output);
        }
      } catch (error) {
        setErrorMessage('Something went wrong. Could not load the QR code.')
        console.error("Failed to process the event data:" + error);
      }
    };

    fetchAndEncryptEvents();
  }, []);

  const handlePrint = () => {
    if (!qrCodeRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrCode = qrCodeRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Event QR Code</title>
          <style>
            @page {
              size: auto;
              margin: 0mm;
            }
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .qr-container {
              text-align: center;
            }
            .qr-code {
              max-width: 100%;
              height: auto;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${qrCode}
            <p style="margin-top: 20px; font-size: 14px;">
              Scan to mark attendance
            </p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="flex flex-col items-center p-4">
      
      {encryptedData ? (
        <div className="space-y-6" style={{textAlign: 'center'}}>
          <div 
            ref={qrCodeRef}
            className="bg-white rounded-lg shadow-lg"
          >
            <QRCodeSVG
              value={encryptedData}
              size={qrSize}
              level="M"
              includeMargin={true}
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: `${qrSize}px`
              }}
            />
          </div>
          
          <Button
            onClick={handlePrint}
            variant="outlined"
          >
            Print
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">{errorMessage ? errorMessage : 'Generating QR code...'}</p>
        </div>
      )}
    </div>
  );
}