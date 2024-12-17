"use client"
/*eslint-disable*/
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import { fetchData } from '@/utils/apiUtils'

import '@/styles/sidebar.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_UCOUNT_BACKEND_URL

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRight: 0,
  borderLeft: 0,
  '&:not(:last-child)': {
    borderTop: `1px solid ${theme.palette.divider}`,
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

export default function Sidebar(props) {
  const { data: session, status } = useSession();
  const [activities, setActivities] = useState([]);
  const [expanded, setExpanded] = useState('');
  const { color, logo, image, logoText, routes } = props;
  const params = useParams();

  // Fetch activity data on component mount
  useEffect(() => {
    const loadActivityMenu = async () => {
      if (!session) return;
        const url = `${BACKEND_URL}/api/activities/`;
        const data = await fetchData(url, "GET", null, session.accessToken);
        //console.log(data, session)
        if (data && !data.error) {
          setActivities(data.output || [])
        }
    };
    loadActivityMenu();

    if (Object.keys(params).length > 0) setExpanded(params.refs[0]);
  }, [session, params]);

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  var links = (
    <div className="nav">
      {activities.map((item, i) => {
        return (
          <Accordion key={i} expanded={expanded === item.activitytype} onChange={handleChange(item.activitytype)}>
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
            <AccordionDetails sx={{padding: 0}}>
              <ul className="nav-sub-links">
              {item.activities.map((list, j) => {
                return (
                  <Link key={j} href={`/activity/${item.activitytype}/${list.activityid}`} className="nav-links">
                    <li>
                        {list.activity}
                    </li>
                  </Link>
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
          <Link href='/scanner'>
            <div className="auth signout-link">
              <i className="material-icons"><DocumentScannerIcon /></i>
              <p>Scan attendance</p>
            </div>
          </Link>
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
