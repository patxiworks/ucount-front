import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
// @material-ui/core components
//import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Hidden from "@mui/material/Hidden";
import Box from '@mui/material/Box';
// @material-ui/icons
import Menu from "@mui/material/Menu";
// core components
import AdminNavbarLinks from "./AdminNavbarLinks.js";
import RTLNavbarLinks from "./RTLNavbarLinks.js";
import Button from "@/components/CustomButtons/Button.js";

import classes from "@/assets/jss/nextjs-material-dashboard/components/headerStyle.js";

export default function Header(props) {
  // used for checking current route
  //const router = useRouter();
  // create styles for this component
  //const useStyles = makeStyles(styles);
  //const classes = useStyles();
  function makeBrand() {
    var name = "NextJS Material Dashboard";
    /*props.routes.map((prop) => {
      if (router.route.indexOf(prop.layout + prop.path) !== -1) {
        name = props.rtlActive ? prop.rtlName : prop.name;
      }
      return null;
    });*/
    return name;
  }
  //const { color } = props;
  /*const appBarClasses = classNames({
    [" " + classes[color]]: color,
  });*/
  return (
    <AppBar className={classes.appBar}>
      <Toolbar className={classes.container}>
        <div className={classes.flex}>
          {/* Here we create navbar brand, based on route name */}
          <Button color="transparent" href="#" className={classes.title}>
            {makeBrand()}
          </Button>
        </div>
        <Box sx={{ display: { xl: 'none', xs: 'block' } }} >
          <AdminNavbarLinks />
        </Box>
        <Box sx={{ display: { xl: 'none', xs: 'block' } }} >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={props.handleDrawerToggle}
          >
            <Menu />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  color: PropTypes.oneOf(["primary", "info", "success", "warning", "danger"]),
  rtlActive: PropTypes.bool,
  handleDrawerToggle: PropTypes.func,
  routes: PropTypes.arrayOf(PropTypes.object),
};
