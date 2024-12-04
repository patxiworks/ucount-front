"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState, useRef } from "react";
import { encrypt } from "@/utils/encryptionUtils";
import pako from 'pako';

interface Event {
  date: string;
  name: string;
  startTime: string;
  endTime: string;
}

const compressData = (data: string): string => {
  try {
    const stringData = new TextEncoder().encode(data);
    const compressed = pako.deflate(stringData);
    return btoa(String.fromCharCode.apply(null, [...compressed]));
  } catch (error) {
    console.error('Compression error:', error);
    return btoa(encodeURIComponent(data));
  }
};

export default function AdminQRCode() {
  const [encryptedData, setEncryptedData] = useState<string>("");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [qrSize, setQrSize] = useState<number>(300);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAndEncryptEvents = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/sample/");
        const data = await response.json();

        // Include all event details in the QR code
        const events: Event[] = data.events.map(({ date, name, startTime, endTime }: Event) => ({
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
      } catch (error) {
        console.error("Failed to process event data:", error);
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
      <h4 className="text-xl font-bold mb-6">Event Attendance QR Code</h4>
      
      {encryptedData ? (
        <div className="space-y-6">
          <div 
            ref={qrCodeRef}
            className="p-4 bg-white rounded-lg shadow-lg"
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
          
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg 
                     hover:bg-blue-600 transition-colors duration-200 
                     shadow-md active:scale-95 transform no-print"
          >
            Print QR Code
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Generating QR code...</p>
        </div>
      )}
    </div>
  );
}