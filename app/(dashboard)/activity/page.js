"use client"

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
