import React, { Component } from 'react';
import Joi from 'joi-browser';
import axios from 'axios';
import { DebounceInput } from 'react-debounce-input';

export class TimeSheetDetail extends Component {
    state = {
        loading: true,
        timeSheetId: undefined,
        SubmittedDateTime: undefined,
        timePeriod: undefined,
        entries: undefined,
        errorMsg: undefined,
        saving: false,
        hasChanged: false,
    };

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
                const entries = timeSheet.entries.map((e) => {
                    return {
                        id: e.id,
                        key: TimeSheetDetail.uuidv4(),
                        note: e.note,
                        pop: e.percentOfPeriod,
                        value: e.value,
                        projectId: e.project.id,
                        projectName: e.project.name,
                    };
                });
                this.setState({ submittedDateTime: timeSheet.submittedDateTime, entries, timePeriod: timeSheet.timePeriod, loading: false });
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

    componentDidUpdate(nextProps) {
        const { hasChanged } = this.state;
        if (hasChanged) {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(this.save, 5000);
        }
    }

    sleep = (milliseconds) => {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };

    save = async () => {
        const values = this.state.entries;
        console.log('Saving', values);
        clearTimeout(this.timeout);
        this.setState({ saving: true, hasChanged: false });

        await this.sleep(1000);
        this.setState({ saving: false });
    };

    handleEntryChange = (e, entry) => {
        let entries = [...this.state.entries];
        const index = entries.indexOf(entry);
        let newValue = { ...entry };

        newValue[e.name] = e.value;

        entries[index] = newValue;
        this.setState({ entries, hasChanged: true });
    };

    handleEntryCreate = () => {
        let entries = [...this.state.entries];

        entries.push({ key: TimeSheetDetail.uuidv4(), id: null, note: undefined, value: 0, percentOfPeriod: 0, projectId: undefined, projectName: undefined });
        this.setState({ entries, hasChanged: true });
    };

    handleEntryDelete = (e) => {
        let entries = [...this.state.entries];
        const index = entries.indexOf(e);
        if (index > -1) {
            entries.splice(index, 1);
            this.setState({ entries, hasChanged: true });
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
                <td>{entry.projectName}</td>
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
                <div className="row">
                    <div className="col-2">
                        <h3>Entries</h3>
                    </div>
                    <div className="col ">
                        {this.state.saving ? (
                            <span className="badge badge-warning align-middle">
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving
                            </span>
                        ) : (
                            !this.state.hasChanged && <span className="badge badge-light align-middle">Saved</span>
                        )}
                        <span className="float-right">
                            {!this.state.submittedDateTime && (
                                <button className="btn btn-sm btn-success" onClick={this.handleEntryCreate}>
                                    Submit TImeSheet
                                </button>
                            )}
                        </span>
                    </div>
                </div>
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
                        name="projectName"
                        className="form-control form-control-sm"
                        minLength={2}
                        debounceTimeout={500}
                        value={this.props.entry.projectName}
                        onChange={(e) => this.props.onChange(e.target, this.props.entry)}
                        inputRef={this.projectInput}
                    />
                </td>
                <td>
                    <textarea
                        name="note"
                        onChange={(e) => this.props.onChange(e.currentTarget, this.props.entry)}
                        value={this.props.entry.note}
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
