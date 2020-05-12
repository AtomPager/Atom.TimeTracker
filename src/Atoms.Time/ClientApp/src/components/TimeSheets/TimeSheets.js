import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { TimeSheetIndex } from './TimeSheetIndex';
import { TimeSheetDetail } from './TimeSheetDetail';

export class TimeSheets extends Component {
    state = { showAll: false };

    handleShowHideAll = () => {
        var showAll = !this.state.showAll;
        this.setState({ showAll });
    };

    render() {
        return (
            <div>
                <h1 id="tabelLabel">
                    Time Sheets
                    <span className="float-right">
                        <Switch>
                            <Route path="/timeSheets" exact />
                            <Route
                                path="/timeSheets/:timeSheetId/"
                                render={() => (
                                    <Link to="/timeSheets" className="btn btn-outline-secondary btn-sm">
                                        Save & Close
                                    </Link>
                                )}
                            />
                            <Route
                                path="/timeSheets"
                                render={() => (
                                    <Link to="/timeSheets" className="btn btn-outline-secondary btn-sm">
                                        close
                                    </Link>
                                )}
                            />
                        </Switch>
                    </span>
                </h1>
                <Switch>
                    <Route path="/timeSheets/:timeSheetId" component={TimeSheetDetail} />
                    <Route path="/timeSheets" render={(prop) => <TimeSheetIndex {...prop} showAll={true}></TimeSheetIndex>} />
                </Switch>
            </div>
        );
    }
}
