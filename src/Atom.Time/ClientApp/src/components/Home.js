import React, { Component } from 'react';
import { TimeSheetIndex } from './TimeSheets/TimeSheetIndex';

export class Home extends Component {
    render() {
        return (
            <div>
                <p>Welcome {this.props.userContext && this.props.userContext.name}</p>
                {this.props.userContext.isTimeSheetUser ? (
                    <React.Fragment>
                        <h2>Your recent and up coming time sheets</h2>
                        <TimeSheetIndex />
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <h3>No time sheet available.</h3>
                    </React.Fragment>
                )}
            </div>
        );
    }
}
