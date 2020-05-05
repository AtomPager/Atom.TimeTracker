import React, { Component } from 'react';
import Joi from 'joi-browser';
import axios from 'axios';

export class TimeSheetDetail extends Component {
    state = { loading: true, timeSheetId: null, timeSheet: null, errorMsg: null };

    schema = {
        timeSheetId: Joi.number().integer().min(1),
    };

    componentDidMount() {
        const { error } = Joi.validate(this.props.match.params, this.schema);
        if (error) {
            // TODO: Show Error
            this.setState({ errorMsg: 'Invalid ID', loading: false });
            return;
        }

        const { timeSheetId } = this.props.match.params;

        this.setState({ timeSheetId });
        axios
            .get(`api/TimeSheet/${timeSheetId}`)
            .then((r) => {
                console.log(r.data);
                const timeSheet = r.data;
                this.setState({ timeSheet, loading: false });
            })
            .catch((error) => {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    const errorMsg = error.response.data.title || error.response.data || 'Error loading data';
                    this.setState({ errorMsg, loading: false });
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                    this.setState({ errorMsg: 'Time out', loading: false });
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                    this.setState({ errorMsg: error.message, loading: false });
                }
                console.log(error.config);
            });
    }

    renderEntityTable = () => {
        const { entries, timePeriod } = this.state.timeSheet;
        const newRow = !timePeriod.submittedDateTime && (
            <tr>
                <td>
                    <button className="btn btn-sm btn-success">Save</button>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        );

        return (
            <table className="table table-striped" aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th></th>
                        <th>Project</th>
                        <th>Node</th>
                        <th>Parts</th>
                        <th>% of Period</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map((entry) => this.renderEntityRow(entry))}
                    {newRow && newRow}
                </tbody>
            </table>
        );
    };

    renderEntityRow = (entry) => {
        return (
            <tr key={entry.id}>
                <td></td>
                <td>{entry.project.name}</td>
                <td>{entry.note}</td>
                <td>{entry.value}</td>
                <td></td>
            </tr>
        );
    };

    static renderHeading({ timePeriod, submittedDateTime }) {
        var subDate = submittedDateTime && new Date(submittedDateTime).toLocaleDateString();

        return (
            <ul>
                <li>
                    <strong>Date Range: </strong>
                    {new Date(timePeriod.periodStartDate).toLocaleDateString()} to {new Date(timePeriod.periodEndDate).toLocaleDateString()}
                </li>
                <li>
                    <strong>Work days: </strong>
                    {timePeriod.workDays}
                </li>
                <li>
                    <strong>Status: </strong>
                    {submittedDateTime ? `Submitted on ${subDate}` : 'Pending'}
                </li>
            </ul>
        );
    }

    render() {
        let contents = this.state.loading ? (
            <p>
                <em>Loading...</em>
            </p>
        ) : this.state.errorMsg ? (
            <div className="alert alert-danger">{this.state.errorMsg}</div>
        ) : (
            <div>
                {TimeSheetDetail.renderHeading(this.state.timeSheet)}
                <hr />
                <h3>Entries</h3>
                {this.renderEntityTable()}
            </div>
        );

        return <div>{contents}</div>;
    }
}
