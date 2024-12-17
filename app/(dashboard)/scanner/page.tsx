"use client";
import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { BrowserQRCodeReader } from "@zxing/library";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import pako from 'pako';

import { decrypt } from "@/utils/encryptionUtils";
import { isAttendanceTime } from "@/utils/timeCheck";

import '@/styles/scanner.css';

interface Event {
  date: string;
  name: string;
  startTime: string;
  endTime: string;
}

const decompressData = (compressedData: string): string => {
  try {
    const binaryString = atob(compressedData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decompressed = pako.inflate(bytes);
    return new TextDecoder().decode(decompressed);
  } catch (error) {
    console.error('Decompression error:', error);
    return decodeURIComponent(atob(compressedData));
  }
};

export default function Scanner() {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const scannerControls = useRef<{ stop: () => void } | null>(null);
  const lastScanTime = useRef<number>(0);
  const router = useRouter();

  const today = dayjs().format("YYMMDD");

  const handleScan = useCallback((data: string) => {
    const now = Date.now();
    if (now - lastScanTime.current < 1000) return;
    lastScanTime.current = now;

    if (!data) {
      setError("Invalid QR code");
      return;
    }

    try {
      const decryptedData = decrypt(data);
      if (!decryptedData) {
        setError("Invalid QR code");
        return;
      }

      const decompressedData = decompressData(decryptedData);
      const events: Event[] = JSON.parse(decompressedData);
      console.log(events)
      
      // Find all events for today
      const todayEvents = events.filter(event => event.date === today);
      //console.log(todayEvents)
      
      if (todayEvents.length === 0) {
        setError("No events scheduled for today");
        scannerControls.current?.stop();
        return;
      }
      const currentEvent = todayEvents[0]
      
      // Find current active event based on current time
      const currentEvents = todayEvents.find(event => {
        return isAttendanceTime(event.startTime, event.endTime)
      });
      
      if (!currentEvents) {
        setError("No active events at this time");
        scannerControls.current?.stop();
        return;
      }

      setSuccessMessage(`✓ QR Code Scanned Successfully for ${currentEvent.name}`);
      sessionStorage.setItem("ucount_event", JSON.stringify({
        ...currentEvent,
        date: `20${currentEvent.date.slice(0,2)}-${currentEvent.date.slice(2,4)}-${currentEvent.date.slice(4,6)}`
      }));
      
      scannerControls.current?.stop();
      setTimeout(() => router.push("/attendance/"), 1500);
    } catch (err) {
      console.error("Scan processing error:", err);
      setError("Invalid QR code format");
    }
  }, [router, today]);


  useEffect(() => {
    // Configure scanner hints for better performance
    const hints = new Map();
    hints.set(2, true); // TRY_HARDER
    hints.set(4, false); // ASSUME_GS1

    
    // codeReader.setHints(hints); // Removed as setHints does not exist on BrowserQRCodeReader

    let mounted = true;

    const codeReader = new BrowserQRCodeReader();
    const startScanning = async () => {
      try {
        const videoElement = document.getElementById("video") as HTMLVideoElement;
        if (!videoElement || !mounted) return;

        const devices = await codeReader.listVideoInputDevices();
        
        // Enhanced camera selection
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("rear") ||
          device.label.toLowerCase().includes("environment")
        );
        
        const constraints = {
          video: {
            deviceId: backCamera?.deviceId,
            facingMode: backCamera ? undefined : "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
            aspectRatio: { ideal: 1.777778 },
            focusMode: "continuous"
          }
        };
        
        if (mounted) {
          await codeReader.decodeFromConstraints(
            constraints,
            videoElement,
            (result, _err) => {  // Added underscore prefix
              if (result && mounted) {
                handleScan(result.getText());
              }
            }
          );
          
          scannerControls.current = {
            stop: () => codeReader.reset()
          };
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          setError(`Camera access failed: ${errorMessage}`);
          setIsScanning(false);
        }
      }
    };

    startScanning();

    return () => {
      mounted = false;
      scannerControls.current?.stop();
      codeReader.reset();
    };
  }, [handleScan]);

  return (
    <div className="flex-container">

      {successMessage && (
        <div className="alert-box">
          <h2 className="alert-heading">
            {successMessage}
          </h2>
        </div>
      )}
      
      {error && (
        <div className="error-box">
          <h2 className="error-heading">{error}</h2>
          <div className="buttons">
            <button
              onClick={() => {
                scannerControls.current?.stop();
                router.push("/");
              }}
              className="button"
            >
              Cancel
            </button>
            <button className="button retry" onClick={()=>window.location.reload()}
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="container-box">
        <div className="aspect-box2">
          <video 
            id="video" 
            className="video-container"
            playsInline 
            muted
          />
          
          {isScanning && (
            <div className="full-cover no-pointer-events">
              <div className="centered-box" />
            </div>
          
          )}
        </div>
      </div>
    </div>
  );
}