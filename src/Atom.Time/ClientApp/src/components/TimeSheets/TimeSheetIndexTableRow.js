import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export class TimeSheetIndexTableRow extends Component {
    state = { working: false };

    handleCreateTimeSheet = (e) => {
        this.setState({ working: true });

        axios
            .post('api/TimeSheets/', { timePeriodId: this.props.timeSheet.timePeriodId })
            .then((r) => {
                console.log(r);
                this.setState({ timeSheetId: r.data.id });
                this.props.history.push(`/timeSheets/${r.data.id}`);
            })
            .catch((error) => {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    const errorMsg = error.response.data.title || error.response.data || 'Error loading data';
                    this.setState({ errorMsg, working: false });
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                    this.setState({ errorMsg: 'Time out', working: false });
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                    this.setState({ errorMsg: error.message, working: false });
                }
                console.log(error.config);
            });
    };

    render() {
        const timeSheet = this.props.timeSheet;
        const viewUrl = `/timeSheets/${timeSheet.timeSheetId}`;
        const today = new Date();
        const startDate = new Date(timeSheet.periodStartDate);
        let status = 'future';
        let statusIcon = '⚪';
        if (timeSheet.submittedDateTime) {
            statusIcon = '✔️';
            status = '';
        } else if (timeSheet.dueInDays <= -10) {
            statusIcon = '⚠️';
            status = `${-timeSheet.dueInDays} days over due`;
        } else if (timeSheet.dueInDays <= 0) {
            statusIcon = '🟠';
            status = 'due';
        } else if (timeSheet.dueInDays <= 5) {
            statusIcon = '🟡';
            status = `due in ${timeSheet.dueInDays} days`;
        } else if (timeSheet.dueInDays <= 10) {
            statusIcon = '🟢';
            status = 'up coming';
        } else if (startDate - today < 5) {
            statusIcon = '🟢';
            status = 'up coming';
        }

        const viewBtnClass = timeSheet.submittedDateTime ? 'btn btn-sm btn-outline-info' : 'btn btn-sm btn-info';

        return (
            <tr key={timeSheet.timePeriodId}>
                <td>
                    {timeSheet.timeSheetId ? (
                        <Link className={viewBtnClass} to={viewUrl}>
                            View
                        </Link>
                    ) : (
                        status !== 'future' && (
                            <button className="btn btn-sm btn-primary" disabled={this.state.working} onClick={this.handleCreateTimeSheet}>
                                {this.state.working ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <span>New</span>}
                            </button>
                        )
                    )}
                </td>
                <td className="d-none d-md-block">{startDate.toLocaleDateString()}</td>
                <td>{new Date(timeSheet.periodEndDate).toLocaleDateString()}</td>
                <td>
                    <span role="img" aria-label={status}>
                        {statusIcon}
                    </span>
                </td>
                <td>{timeSheet.submittedDateTime ? new Date(timeSheet.submittedDateTime).toLocaleDateString() : status}</td>
            </tr>
        );
    }
}
