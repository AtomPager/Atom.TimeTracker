import React, { Component } from 'react';
import { TimeSheetIndex } from './TimeSheets/TimeSheetIndex';
import { Spinner } from 'reactstrap';

export class Home extends Component {
    render() {
        return (
            <div>
                <p>Welcome {this.props.userContext && this.props.userContext.name}</p>
                {(!this.props.userContext.loading &&
                    (this.props.userContext.isTimeSheetUser ? (
                        <React.Fragment>
                            <h2>Your recent and up coming time sheets</h2>
                            <TimeSheetIndex {...this.props} />
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <h3>No time sheet available.</h3>
                        </React.Fragment>
                    ))) || <Spinner color="primary"></Spinner>}
            </div>
        );
    }
}
