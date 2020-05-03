import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Link
  } from "react-router-dom";
import {TimePeriods} from './TimePeriods';
import {TimePeriodCreate} from './TimePeriodCreate';

export class TimePeriodsIndex extends Component {
    static displayName = TimePeriods.name;

    render() {
        return (
            <div>
                <h1 id="tabelLabel" >Time Periods <Link to="/time-periods/create" className="btn btn-outline-secondary btn-sm">Create</Link> </h1>
                
                <Route path='/time-periods/create' component={TimePeriodCreate} />
                <Route path='/time-periods' exact component={TimePeriods} />
            </div>
        );
    }
}
