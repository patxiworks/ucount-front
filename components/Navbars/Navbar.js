import React from "react";
import PropTypes from "prop-types";
import { useSession, signOut, signIn } from "next-auth/react";

import Logo from "@/components/Logo/Logo.js";
// @material-ui/icons
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

import '@/styles/navbar.css';

export default function Header(props) {
  const { data: session, status } = useSession();

  return (
    <nav className="navbar navbar-expand-lg navbar-transparent navbar-absolute fixed-top ">
      <div className="container-fluid">
        <div className="navbar-wrapper dropdown">
          <a className="navbar-brand" href="/" style={{marginTop: '-10px'}}><Logo logo={props.logo} /></a>
          {/*<span className="navbar-title-desc">Dashboard</span>*/}
          
          <button onClick={props.handleDrawerToggle} className={`navbar-toggler ${props.open ? 'toggled' : ''}`} type="button" data-toggle="collapse" aria-controls="navigation-index" aria-expanded="false" aria-label="Toggle navigation">
            <span className="sr-only">Toggle navigation</span>
            <span className="navbar-toggler-icon icon-bar"></span>
            <span className="navbar-toggler-icon icon-bar"></span>
            <span className="navbar-toggler-icon icon-bar"></span>
          </button>
          
        </div>
        <div className="collapse navbar-collapse justify-content-end">
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <div className="nav-link" href="/" id="navbarDropdownProfile" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {status === "authenticated"
                ? <>
                    <i className="logout-icon" onClick={() => signOut()}><LogoutIcon /></i>
                    <p className="d-lg-none d-md-block">Signout</p>
                  </>
                : <>
                    <i className="login-icon" onClick={() => signIn()}><LoginIcon /></i>
                    <p className="d-lg-none d-md-block">Signin</p>
                  </>
                }
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

Header.propTypes = {
  logo: PropTypes.string,
  color: PropTypes.oneOf(["primary", "info", "success", "warning", "danger"]),
  rtlActive: PropTypes.bool,
  handleDrawerToggle: PropTypes.func,
  routes: PropTypes.arrayOf(PropTypes.object),
  open: PropTypes.bool,
};
