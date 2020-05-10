import React, { Component } from 'react';
import Joi from 'joi-browser';
import axios from 'axios';
import { Link } from 'react-router-dom';

export class TimePeriodDetails extends Component {
    state = { timePeriod: null, persons: null, timePeriodId: null, loading: true, errorMsg: null };

    schema = {
        timePeriodId: Joi.number().integer().min(1),
    };

    componentDidMount() {
        const { error } = Joi.validate(this.props.match.params, this.schema);
        if (error) {
            // TODO: Show Error
            this.setState({ errorMsg: 'Invalid ID', loading: false });
            return;
        }

        const { timePeriodId } = this.props.match.params;

        this.setState({ timePeriodId });
        axios
            .get(`api/admin/TimePeriods/${timePeriodId}`)
            .then((r) => {
                console.log(r.data);
                const { timePeriod, persons } = r.data;
                this.setState({ timePeriod, persons, loading: false });
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

    handleResetTimeSheetClick = (person) => {
        axios
            .post(`api/TimeSheet/${person.timeSheetId}/reject`)
            .then((r) => {
                var persons = [...this.state.persons];
                var personIndex = persons.indexOf(person);
                if (personIndex >= 0) {
                    persons[personIndex] = { ...person };
                    persons[personIndex].submittedDateTime = null;
                    this.setState({ persons });
                }
            })
            .catch((e) => console.warn(e));
    };

    renderTableRow = (person) => {
        const viewUrl = `/timePeriods/${this.state.timePeriodId}/timesheets/${person.timeSheetId}`;
        return (
            <tr key={person.id}>
                {person.timeSheetId ? (
                    <td>
                        <Link to={viewUrl}>{person.name}</Link>
                    </td>
                ) : (
                    <td>{person.name}</td>
                )}
                <td>{person.timeSheetId ? '✔️' : '❌'}</td>
                <td>{person.submittedDateTime ? '✔️' : '❌'}</td>
                <td>{person.submittedDateTime && new Date(person.submittedDateTime).toLocaleDateString()}</td>
                <td className="text-right">
                    {person.submittedDateTime && (
                        <button className="btn btn-sm btn-outline-danger" onClick={(e) => this.handleResetTimeSheetClick(person)}>
                            Reject
                        </button>
                    )}
                </td>
            </tr>
        );
    };

    renderTable = (persons) => {
        return (
            <table className="table table-striped" aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Created</th>
                        <th>Submitted</th>
                        <th>Submitted Date</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>{persons.map((person) => this.renderTableRow(person))}</tbody>
            </table>
        );
    };

    static renderHeading(timePeriod) {
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
                {TimePeriodDetails.renderHeading(this.state.timePeriod)}
                <h3>Time Sheets</h3>
                {this.renderTable(this.state.persons)}
            </div>
        );

        return <div>{contents}</div>;
    }
}
