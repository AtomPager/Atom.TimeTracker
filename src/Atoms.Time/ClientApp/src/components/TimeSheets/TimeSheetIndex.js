import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export class TimeSheetIndex extends Component {
    state = { loading: true, timeSheets: {} };

    componentDidMount() {
        this.populateTimePeriodData(this.props.showAll);
    }

    componentDidUpdate(nextProps) {
        const { showAll } = this.props;
        if (nextProps.showAll !== showAll) {
            this.populateTimePeriodData(showAll);
        }
    }

    renderTable = (timeSheets) => {
        return (
            <table className="table table-sm table-striped" aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th></th>
                        <th className="d-none d-md-table-cell">Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Date Submitted</th>
                    </tr>
                </thead>
                <tbody>
                    {timeSheets.map((timeSheet) => (
                        <TimeSheetIndexTableRow key={timeSheet.timePeriodId} timeSheet={timeSheet} {...this.props}></TimeSheetIndexTableRow>
                    ))}
                </tbody>
            </table>
        );
    };

    render() {
        let contents = this.state.loading ? (
            <p>
                <em>Loading...</em>
            </p>
        ) : (
            <React.Fragment>
                {this.renderTable(this.state.timeSheets.filter((s) => s.submittedDateTime === undefined))}

                <h4>Completed Time Sheets</h4>
                {this.renderTable(this.state.timeSheets.filter((s) => s.submittedDateTime !== undefined))}
            </React.Fragment>
        );

        return <div>{contents}</div>;
    }

    async populateTimePeriodData(showAll) {
        axios
            .get('api/TimeSheets', { params: { showAll } })
            .then((response) => {
                const data = response.data;
                this.setState({ timeSheets: data, loading: false });
            })
            .catch((e) => {
                console.log(e);
            });
    }
}

export class TimeSheetIndexTableRow extends Component {
    state = { working: false };

    handleCreateTimeSheet = (e) => {
        this.setState({ working: true });

        axios
            .post('api/TimeSheets', { timePeriodId: this.props.timeSheet.timePeriodId })
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

        const one_day = 1000 * 60 * 60 * 24;
        const startIn = Math.ceil((startDate.getTime() - today.getTime()) / one_day);

        let status = 'future';
        let statusIcon = '⚪';
        if (timeSheet.submittedDateTime) {
            statusIcon = '✔️';
            status = '';
        } else if (timeSheet.dueInDays <= -10) {
            statusIcon = '🟠';
            status = `${-timeSheet.dueInDays} days over due`;
        } else if (timeSheet.dueInDays <= 0) {
            statusIcon = '🟡';
            status = 'due';
        } else if (timeSheet.dueInDays <= 5) {
            statusIcon = '🟢';
            status = `due in ${timeSheet.dueInDays} days`;
        } else if (timeSheet.dueInDays <= 10) {
            statusIcon = '⚪';
            status = 'up coming';
        } else if (startIn < 5) {
            statusIcon = '⚪';
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
                <td className="d-none d-sm-table-cell">{startDate.toLocaleDateString()}</td>
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
