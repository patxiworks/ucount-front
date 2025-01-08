"use client"
/*eslint-disable*/
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession, signOut, signIn } from "next-auth/react";
import PropTypes from "prop-types";
import Link from "next/link";

// core components
// import Logo from "@/components/Logo/Logo.js";

// import { styled } from '@mui/material/styles';
// import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
// import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import { fetchData } from '@/utils/apiUtils'

import '@/styles/sidebar.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_UCOUNT_BACKEND_URL

export default function Summary(props) {
  const { data: session, status } = useSession();
  const [userSummary, setUserSummary] = useState([]);
  const params = useParams();

  // Fetch activity data on component mount
  useEffect(() => {
    const loadUserSummary = async () => {
      if (!session) return;
      const url = `${BACKEND_URL}/api/user/summary/`;
      const data = await fetchData(url, "GET", null, session.accessToken);
      console.log(url, data, session)
      if (data && !data.error) {
        setUserSummary(data.output || [])
      }
    };
    loadUserSummary();

  }, [session, params]);
  
  return (
    <div className="home-content form-container">
      <div className="home-wrapper">
      {status !== "authenticated"
        ? <>
            <h3>Welcome</h3>
            <div className="description">
              <p>uCount description</p>
            </div>
          </>
        : <>
            <h3>Welcome, {userSummary?.user?.first_name}</h3>
            <div className="description">
              {userSummary.activities && Object.keys(userSummary.activities).length
                ? <p>Your activities:</p>
                : <p style={{textAlign: "center"}}>You have no activities assigned to you.</p>
              }
            </div>
          </>
        }
      </div>
    </div>
  );
}
