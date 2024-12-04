"use client"

import React, { useEffect } from "react";
//import { useRouter } from 'next/navigation'
/*
// creates a beautiful scrollbar
/*import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
// @mui/material components
//import { makeStyles } from "@mui/material/styles";
*/
// core components
import { SessionProvider } from 'next-auth/react';
import Backdrop from '@mui/material/Backdrop';
import Navbar from "@/components/Navbars/Navbar.js";
import Footer from "@/components/Footer/Footer.js";
import Sidebar from "@/components/Sidebar/Sidebar.js";
//import FixedPlugin from "@/components/FixedPlugin/FixedPlugin.js";

//import classes from "@/assets/jss/nextjs-material-dashboard/layouts/adminStyle.js";

//import bgImage from "@/assets/img/sidebar-2.jpg";
import logo from "@/assets/img/logo.png";

//let ps;

export default function Admin({ children, ...rest }: {children: React.ReactNode}) {
  //const router = useRouter()
  // used for checking current route
  // styles
  //const useStyles = makeStyles(styles);
  //const classes = useStyles();
  // ref to help us initialize PerfectScrollbar on windows devices
  //const mainPanel = React.createRef();
  // states and functions
  //const [image, setImage] = React.useState(bgImage);
  //const [color, setColor] = React.useState("white");
  //const [fixedClasses, setFixedClasses] = React.useState("dropdown show");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  /*
  const handleImageClick = (image) => {
    setImage(image);
  };
  const handleColorClick = (color) => {
    setColor(color);
  };
  const handleFixedClick = () => {
    if (fixedClasses === "dropdown") {
      setFixedClasses("dropdown show");
    } else {
      setFixedClasses("dropdown");
    }
  };
  */
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  /*
  const getRoute = () => {
    return router.pathname !== "/admin/maps";
  };
  const resizeFunction = () => {
    if (window.innerWidth >= 960) {
      setMobileOpen(false);
    }
  };
  const style = {
    marginRight: 10,
    //color: router.asPath === href ? 'red' : 'black',
  }
  // initialize and destroy the PerfectScrollbar plugin
  /*React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(mainPanel.current, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
      document.body.style.overflow = "hidden";
    }
    window.addEventListener("resize", resizeFunction);
    // Specify how to clean up after this effect:
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
      }
      window.removeEventListener("resize", resizeFunction);
    };
  }, [mainPanel]);
  */

  return (
    
    <div className="wrapper">
      <SessionProvider>
        <Sidebar
          //routes={routes}
          logoText={"uCount"}
          logo={logo.src}
          //image={image}
          handleDrawerToggle={handleDrawerToggle}
          open={mobileOpen}
          //color={color}
          {...rest}
        />
        <Backdrop
          sx={(theme) => ({ color: '#fff', zIndex: 3 })}
          open={mobileOpen}
          onClick={handleDrawerToggle}
        />
      
        <div className="main-panel" >
          <Navbar
            //routes={routes}
            logo={logo.src}
            open={mobileOpen}
            handleDrawerToggle={handleDrawerToggle}
            {...rest}
          />
        
        <div className="content">
          <div className="container-fluid">{children}</div>
        </div>
        <Footer />
      </div>
      </SessionProvider>
    </div>
    
  );
}
