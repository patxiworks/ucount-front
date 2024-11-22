"use client"
/*
//import React from "react";
// react plugin for creating charts
//import ChartistGraph from "react-chartist";
// @mui/material
//import { makeStyles } from "@mui/material/styles";
import Icon from "@mui/material/Icon";
// @mui/icons-material
import Store from "@mui/icons-material/Store";
import Warning from "@mui/icons-material/Warning";
import DateRange from "@mui/icons-material/DateRange";
import LocalOffer from "@mui/icons-material/LocalOffer";
import Update from "@mui/icons-material/Update";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import AccessTime from "@mui/icons-material/AccessTime";
import Accessibility from "@mui/icons-material/Accessibility";
import BugReport from "@mui/icons-material/BugReport";
import Code from "@mui/icons-material/Code";
import Cloud from "@mui/icons-material/Cloud";
// layout for this page
//import Admin from "layouts/Admin.js";
// core components
import GridItem from "@/components/Grid/GridItem.js";
import GridContainer from "@/components/Grid/GridContainer.js";
import Table from "@/components/Table/Table.js";
import Tasks from "@/components/Tasks/Tasks.js";
import CustomTabs from "@/components/CustomTabs/CustomTabs.js";
import Danger from "@/components/Typography/Danger.js";
import Card from "@/components/Card/Card.js";
import CardHeader from "@/components/Card/CardHeader.js";
import CardIcon from "@/components/Card/CardIcon.js";
import CardBody from "@/components/Card/CardBody.js";
import CardFooter from "@/components/Card/CardFooter.js";

import { bugs, website, server } from "@/variables/general.js";

import {
  dailySalesChart,
  emailsSubscriptionChart,
  completedTasksChart,
} from "@/variables/charts.js";

import classes from "@/assets/jss/nextjs-material-dashboard/views/dashboardStyle.js";

import DataTable from 'datatables.net-react';
//import DT from 'datatables.net-dt';

//DataTable.use(DT);
*/
import Link from "next/link";
import { useSearchParams } from 'next/navigation'
import useFetch from '@/hooks/useFetch'

function Activities() {
  const queryParams = useSearchParams()
  const value = queryParams.get('ref')
  const data = useFetch('api');
  const activity = typeof data === 'object' && value in data ? data[value] : {}

  return (
    <div>
      {
      typeof data === 'string'
      ? <div><div className="loaderror">{data}</div></div>
      : ''
      }
      <div className="row top activity">
        <div className="col-md-4">
          <div className="card card-chart">
            <div className="card-body">
              <p className="card-category">{activity?.activityStats?.count[0]}</p>
              <h3 className="card-title">{activity?.activityStats?.count[1]}</h3>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card card-chart">
            <div className="card-body">
              <p className="card-category">{activity?.activityStats?.average[0]}</p>
              <h3 className="card-title">{activity?.activityStats?.average[1]}</h3>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card card-chart">
            <div className="card-body">
              <p className="card-category">{activity?.activityStats?.total[0]}</p>
              <h3 className="card-title">{activity?.activityStats?.total[1]}</h3>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header card-header-primary">
                <h4 className="card-title ">
                {
                activity?.activity?.activitytypename
                ? activity?.activity?.activitytypename
                : "No data available"
                }
                </h4>
                
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  
                  <table id="datatable" className="table">
                    <thead className=" text-primary">
                      <tr>
                        <th>S/N</th>
                        <th>Name of activity</th>
                        <th>No. of participants</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activity?.activitylist && activity?.activitylist.map((item, i)=> {
                        return (
                          <tr key={i}>
                            <td>{i+1}</td>
                            <td>
                              <Link href={{ pathname: `events/`, query: {act: value, ref: item.activityid} }}>{item.activityname}</Link>
                            </td>
                            <td>
                              <Link href={{ pathname: `participants/`, query: {act: value, ref: item.activityid} }}>{item.unique}</Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
    </div>
  </div>
  );
}

export default Activities;
