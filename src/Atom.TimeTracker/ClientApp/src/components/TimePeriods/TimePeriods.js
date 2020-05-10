import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { TimePeriodIndex } from './TimePeriodIndex';
import { TimePeriodCreate } from './TimePeriodCreate';
import { TimePeriodDetails } from './TimePeriodDetails';
import { TimeSheetDetail } from '../TimeSheets/TimeSheetDetail';

export class TimePeriods extends Component {
    render() {
        return (
            <div>
                <h1 id="tabelLabel">
                    Time Periods
                    <span className="float-right">
                        <Switch>
                            <Route
                                path="/timePeriods"
                                exact
                                render={() => (
                                    <Link to="/timePeriods/create" className="btn btn-primary btn-sm">
                                        Create
                                    </Link>
                                )}
                            />
                            <Route
                                path="/timePeriods/:timePeriodId/timesheets/:timeSheetId"
                                render={(props) => {
                                    const link = `/timePeriods/${props.match.params.timePeriodId}`;
                                    return (
                                        <Link to={link} className="btn btn-outline-secondary btn-sm">
                                            Back
                                        </Link>
                                    );
                                }}
                            />
                            <Route
                                path="/timePeriods"
                                render={() => (
                                    <Link to="/timePeriods" className="btn btn-outline-secondary btn-sm">
                                        close
                                    </Link>
                                )}
                            />
                        </Switch>
                    </span>
                </h1>
                <Switch>
                    <Route path="/timePeriods/create" component={TimePeriodCreate} />
                    <Route path="/timePeriods/:timePeriodId/timesheets/:timeSheetId" render={(prop) => <TimeSheetDetail {...prop} readOnly={true} />} />
                    <Route path="/timePeriods/:timePeriodId" component={TimePeriodDetails} />
                    <Route path="/timePeriods" component={TimePeriodIndex} />
                </Switch>
            </div>
        );
    }
}
