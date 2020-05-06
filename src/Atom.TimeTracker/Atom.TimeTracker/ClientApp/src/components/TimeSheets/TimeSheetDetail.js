import React, { Component } from 'react';
import Joi from 'joi-browser';
import axios from 'axios';
import { DebounceInput } from 'react-debounce-input';

export class TimeSheetDetail extends Component {
    state = { loading: true, timeSheetId: null, SubmittedDateTime: null, timePeriod: null, entries: null, errorMsg: null };

    schema = {
        timeSheetId: Joi.number().integer().min(1),
    };

    // From broofa @ https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
    static uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

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
                const timeSheet = r.data;

                // Add a key field for internal tracking, as when we add new entried during editing, we will not have the Id to use as a key.
                timeSheet.entries.forEach((e) => (e.key = TimeSheetDetail.uuidv4()));
                this.setState({ submittedDateTime: timeSheet.submittedDateTime, entries: timeSheet.entries, timePeriod: timeSheet.timePeriod, loading: false });
            })
            .catch((error) => {
                if (error.response) {
                    console.log(error.response.status);
                    const errorMsg = error.response.data.title || error.response.data || 'Error loading data';
                    this.setState({ errorMsg, loading: false });
                } else if (error.request) {
                    this.setState({ errorMsg: 'Timeout', loading: false });
                } else {
                    console.log('Error', error.message);
                    this.setState({ errorMsg: error.message, loading: false });
                }
            });
    }

    handleEntryChange = (e, entry) => {
        console.log(e.type);
        console.log(e.name);
        console.log(e.value);
        console.log(entry);
    };

    handleEntryCreate = () => {
        let entries = [...this.state.entries];

        entries.push({ key: TimeSheetDetail.uuidv4(), id: null, note: null, value: 0, percentOfPeriod: 0, project: { id: null, name: null } });
        this.setState({ entries });
    };

    handleEntryDelete = (e) => {
        let entries = [...this.state.entries];
        const index = entries.indexOf(e);
        if (index > -1) {
            entries.splice(index, 1);
            this.setState({ entries });
        }
    };

    renderEntityTable = () => {
        const { entries, submittedDateTime } = this.state;

        return (
            <table className="table table-sm table-striped" aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th>Project</th>
                        <th>Note</th>
                        <th>Parts</th>
                        <th>%</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>{entries.map((entry) => (submittedDateTime ? this.renderEntityRow(entry) : this.renderEntityEditRow(entry)))}</tbody>
            </table>
        );
    };

    renderEntityEditRow = (entry) => {
        return <TimeSheetDetailNewEntry key={entry.key} entry={entry} onDelete={this.handleEntryDelete} onChange={this.handleEntryChange} />;
    };

    renderEntityRow = (entry) => {
        return (
            <tr key={entry.id}>
                <td>{entry.project.name}</td>
                <td>{entry.note}</td>
                <td>{entry.value}</td>
                <td>{entry.percentOfPeriod}</td>
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
                {TimeSheetDetail.renderHeading(this.state)}
                <hr />
                <h3>
                    Entries
                    <span className="float-right">
                        {!this.state.submittedDateTime && (
                            <button className="btn btn-sm btn-success" onClick={this.handleEntryCreate}>
                                Submit TImeSheet
                            </button>
                        )}
                    </span>
                </h3>
                <div>{this.renderEntityTable()}</div>
                <span>
                    {!this.state.submittedDateTime && (
                        <button className="btn btn-sm btn-primary" onClick={this.handleEntryCreate}>
                            Add new row
                        </button>
                    )}
                </span>
            </div>
        );

        return <div>{contents}</div>;
    }
}

export class TimeSheetDetailNewEntry extends Component {
    state = {};

    constructor() {
        super();

        this.projectInput = React.createRef();
    }

    componentDidMount() {
        this.projectInput.current && this.projectInput.current.focus();
    }

    render() {
        return (
            <tr>
                <td>
                    <DebounceInput
                        name="productName"
                        className="form-control form-control-sm"
                        minLength={2}
                        debounceTimeout={500}
                        project={this.props.entry.project}
                        value={this.props.entry.project.name}
                        onChange={(e) => this.props.onChange(e.target, this.props.entry)}
                        inputRef={this.projectInput}
                    />
                </td>
                <td>
                    <textarea
                        name="nodes"
                        onChange={(e) => this.props.onChange(e.currentTarget, this.props.entry)}
                        value={this.props.entry.notes}
                        className="form-control form-control-sm"
                    ></textarea>
                </td>
                <td>
                    <input
                        name="value"
                        onChange={(e) => this.props.onChange(e.currentTarget, this.props.entry)}
                        type="number"
                        value={this.props.entry.Value}
                        className="partsInput form-control form-control-sm"
                    ></input>
                </td>
                <td>{this.props.entry.PercentOfPeriod}</td>
                <td>
                    <button className="btn btn-sm" onClick={() => this.props.onDelete(this.props.entry)}>
                        <span role="img" aria-label="Delete">
                            🗑️
                        </span>
                    </button>
                </td>
            </tr>
        );
    }
}
