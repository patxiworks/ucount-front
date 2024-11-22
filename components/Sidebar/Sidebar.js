"use client"
/*eslint-disable*/
import React, { useEffect, useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import PropTypes from "prop-types";
import Link from "next/link";

// core components
import Logo from "@/components/Logo/Logo.js";

import { styled } from '@mui/material/styles';
import MuiAccordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { fetchData } from '@/utils/apiUtils'

import '@/styles/sidebar.css';

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    border: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

function activityLinks() {
  return data;
}

export default function Sidebar(props) {
  const { data: session, status } = useSession();
  const [activities, setActivities] = useState([]);
  const { color, logo, image, logoText, routes } = props;

  // Fetch activity data on component mount
  useEffect(() => {
    const loadActivityMenu = async () => {
      if (!session) return;
        const url = "http://127.0.0.1:8000/api/activities/";
        const data = await fetchData(url, "GET", null, session.accessToken);
        if (data) {
          console.log(data)
          setActivities(data.output || [])
        }
      
    };
    loadActivityMenu();
  }, [session]);

  var links = (
    <div className="nav">
      {activities.map((item, i) => {
        return (
          <Accordion key={i}>
            <AccordionSummary
              expandIcon={item.activities.length ? <ExpandMoreIcon /> : ''}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              {/*<Link href={{pathname: "/activity", query: {ref: item.activitytype} }} className="nav-link crt">*/}
              <i className="material-icons"><LibraryBooksIcon /></i>
              {item.activitytypename}
            </AccordionSummary>
            {item.activities.length ?
            <AccordionDetails>
              <ul className="nav-sub-links">
              {item.activities.map((list, j) => {
                return (
                  <li key={j}>
                    <Link href={`/activity/${item.activitytype}/${list.activityid}`} className="nav-links crt">
                      {list.activity}
                    </Link>
                  </li>
                )
              })}
              </ul>
            </AccordionDetails>
            : ''}
          </Accordion>
        )
      })}
    </div>
  );
  
  return (
    <div className={`sidebar ${props.open ? 'sidebar-mobile' : ''}`} data-color="purple" data-background-color="white" data-image="/static/backend/assets/img/sidebar-4.jpg">
      <div className="sidebar-wrapper">
        <Logo logo={logo} />
        {status === "authenticated" ? links : ''}
        <div className="other-links">
          {status === "authenticated"
          ? <div className="auth signout-link" onClick={() => signOut()}>
              <i className="material-icons"><LogoutIcon /></i>
              <p>Sign out</p>
            </div>
          : <div className="auth signin-link" onClick={() => signIn()}>
              <i className="material-icons"><LoginIcon /></i>
              <p>Sign in</p>
            </div>
          }
        </div>
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  rtlActive: PropTypes.bool,
  handleDrawerToggle: PropTypes.func,
  bgColor: PropTypes.oneOf([
    "white",
    "purple",
    "blue",
    "green",
    "orange",
    "red",
  ]),
  logo: PropTypes.string,
  image: PropTypes.string,
  logoText: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
  open: PropTypes.bool,
};
