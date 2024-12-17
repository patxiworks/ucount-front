"use client"

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/Widgets/Widgets";
import { decrypt } from "@/utils/encryptionUtils";

import '@/styles/attendance.css';

export default function Register () {
  // const [formError, setFormError] = useState('');
  // const [emailError, setEmailError] = useState('');
  // const [nameError, setNameError] = useState('');
  const [success, setSuccess] = useState(false);
  // const [active, setActive] = useState(true);

  // const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams()
  const pid = decrypt(searchParams.get('p'))
  const parts = pid.split(/[ ,]+/)
  const placeholderid = parseInt(parts[0]) ?? ''
  console.log(parts)

  if (success) {
    return (
      <div className="page-container">
        <div className="verify-form">
          <div className="register-form-title success">
            <h4>Thank you{parts[2] ? ', '+parts[2] : ''}!</h4>
            <div>Your details were successfully registered.</div>
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="page-container">
        <h3 className="register-title">Register for activities</h3>
          {
          placeholderid
          ? <RegisterForm placeholderid={placeholderid} surname={parts[1]} firstname={parts[2]} othername={parts[3] ?? ''} mode='update' setSuccess={setSuccess} />
          : <div>Sorry, this address is incorrect</div>
          }
      </div>
    )
  }
}