import React, { Component } from 'react';
import Joi from 'joi-browser';
import axios from 'axios';
import debounce from 'lodash.debounce';
import Modal from 'react-modal';
import CreatableSelect from 'react-select/async-creatable';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

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
        projects: [],
    };

    schema = {
        timeSheetId: Joi.number().integer().min(1),
        timePeriodId: Joi.any().optional(),
    };

    componentDidMount() {
        const { error } = Joi.validate(this.props.match.params, this.schema);
        if (error) {
            console.warn(error);
            // TODO: Show Error
            this.setState({ errorMsg: 'Invalid ID', loading: false });
            return;
        }

        const { timeSheetId } = this.props.match.params;
        axios
            .get(`api/TimeSheets/${timeSheetId}`)
            .then((r) => {
                const timeSheet = r.data;

                // Add a key field for internal tracking, as when we add new entried during editing, we will not have the Id to use as a key.
                const entries = timeSheet.entries;
                this.setState({ timeSheetId, submittedDateTime: timeSheet.submittedDateTime, entries, timePeriod: timeSheet.timePeriod, loading: false });
            })
            .catch((error) => {
                if (error.response) {
                    console.error(error.response.status);
                    const errorMsg = error.response.data.title || error.response.data || 'Error loading data';
                    this.setState({ errorMsg, loading: false });
                } else if (error.request) {
                    this.setState({ errorMsg: 'Timeout', loading: false });
                } else {
                    console.error('Error', error.message);
                    this.setState({ errorMsg: error.message, loading: false });
                }
            });

        if (!this.props.readOnly)
            axios
                .get('api/projects')
                .then((res) => {
                    console.log(res);
                    this.setState({ projects: res.data });
                })
                .catch((error) => {
                    console.error('Error getting projects', error);
                });
    }

    async componentWillUnmount() {
        if (this.state.hasChanged) {
            await this.save(false);
        }
    }

    componentDidUpdate(nextProps) {
        const { hasChanged } = this.state;
        if (hasChanged) {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(this.save, 8000, true);
        }
    }

    sleep = (milliseconds) => {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };

    save = async (updateState) => {
        const timeSheetId = this.state.timeSheetId;
        if (!timeSheetId) {
            console.error("Time Sheet not loaded, can't create new Entry.");
            return;
        }

        const values = this.state.entries;
        console.log('Saving', values);
        clearTimeout(this.timeout);
        this.setState({ saving: true, hasChanged: false });

        try {
            const res = await axios.post(`api/TimeSheets/${timeSheetId}`, { entries: values });
            console.log(res);
            if (updateState) {
                this.setState({ saving: false });
            }
        } catch (error) {
            console.error('Error Creating time sheet entry', error);
        }
    };

    confirmSubmit = (e) => {
        confirmAlert({
          title: 'Confirm to submit',
          message: 'Time sheet can not be edited once submitted',
          buttons: [
            {
              label: 'Yes',
              onClick: () => this.handleSubmit(e)
            },
            {
              label: 'No',
              onClick: () => onclose
            }
          ]
        });
      };

    handleSubmit = async (e) => {
        const timeSheetId = this.state.timeSheetId;
        if (!timeSheetId) {
            console.error("Time Sheet not loaded, can't create new Entry.");
            return;
        }

        if (this.state.hasChanged) await this.save(true);
        this.setState({ saving: true, hasChanged: false });

        try {
            const res = await axios.post(`api/TimeSheets/${timeSheetId}/submit`);
            console.log(res);
            this.setState({ saving: false, submittedDateTime: res.data.submittedDateTime });
        } catch (error) {
            console.error('Error Creating time sheet entry', error);
        }
    };

    handleEntryChange = (e, entry) => {
        let entries = [...this.state.entries];
        const index = entries.indexOf(entry);
        let newValue = { ...entry };

        newValue[e.name] = e.type === 'number' ? Number(e.value) : e.value;
        entries[index] = newValue;

        if (e.name === 'value') {
            // Need to re-calculate the percentOfPeriod
            let sumOfValues = 0;
            entries.forEach((e) => {
                sumOfValues += e.value;
            });

            entries = entries.map((e) => {
                let ec = { ...e };
                ec.percentOfPeriod = ec.value / sumOfValues;
                return ec;
            });
        }

        this.setState({ entries, hasChanged: true });
    };

    handleEntryCreate = () => {
        const timeSheetId = this.state.timeSheetId;
        if (!timeSheetId) {
            console.error("Time Sheet not loaded, can't create new Entry.");
            return;
        }

        axios
            .post(`api/TimeSheets/${timeSheetId}/entries`, {})
            .then((res) => {
                console.log(res);
                let entries = [...this.state.entries];
                entries.push(res.data);
                this.setState({ entries });
            })
            .catch((error) => {
                console.error('Error Creating time sheet entry', error);
            });
    };

    handleEntryDelete = (e) => {
        const timeSheetId = this.state.timeSheetId;
        if (!timeSheetId) {
            console.error("Time Sheet not loaded, can't create new Entry.");
            return;
        }

        axios
            .delete(`api/TimeSheets/${timeSheetId}/entries/${e.id}`, {})
            .then((res) => {
                console.log(res);
                let entries = [...this.state.entries];
                const index = entries.indexOf(e);
                if (index > -1) {
                    entries.splice(index, 1);

                    if (e.value > 0) {
                        // Need to re-calculate the percentOfPeriod
                        let sumOfValues = 0;
                        entries.forEach((ent) => {
                            sumOfValues += ent.value;
                        });

                        entries = entries.map((ent) => {
                            let ec = { ...ent };
                            ec.percentOfPeriod = ec.value / sumOfValues;
                            return ec;
                        });
                    }

                    this.setState({ entries });
                }
            })
            .catch((error) => {
                console.error('Error Creating time sheet entry', error);
            });
    };

    isReadOnly = () => {
        return this.state.submittedDateTime || this.props.readOnly;
    };

    renderEntityTable = () => {
        const { entries } = this.state;
        const isReadOnly = this.isReadOnly();
        const tableId = isReadOnly ? 'timesheet' : 'editTimeSheet';
        return (
            <table className="table table-sm table-striped" id={tableId} aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th className="timeSheet-col-auto">Project</th>
                        <th className="timeSheet-col-sm">Note</th>
                        <th className="timeSheet-col-sm">Parts</th>
                        <th className="timeSheet-col-sm">%</th>
                        {!isReadOnly && <th className="timeSheet-col-xs"></th>}
                    </tr>
                </thead>
                <tbody>{entries.map((entry) => (isReadOnly ? this.renderEntityRow(entry) : this.renderEntityEditRow(entry)))}</tbody>
            </table>
        );
    };

    renderEntityEditRow = (entry) => {
        return <TimeSheetDetailNewEntry projects={this.state.projects} key={entry.id} entry={entry} onDelete={this.handleEntryDelete} onChange={this.handleEntryChange} />;
    };

    renderEntityRow = (entry) => {
        return (
            <tr key={entry.id}>
                <td>{entry.project && entry.project.name}</td>
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

    renderSubmitButton = () => {
        return (
            <span className="float-right">
                {this.state.saving ? (
                    <span className="badge badge-warning align-middle">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving
                    </span>
                ) : (
                    !this.state.hasChanged && <span className="badge badge-light align-middle">Saved</span>
                )}
                <span>&nbsp;&nbsp;</span>
                <button className="btn btn-sm btn-success" onClick={this.confirmSubmit}>
                    Submit TimeSheet
                </button>
            </span>
        );
    };

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
                    <div className="col-4">
                        <h3>Entries</h3>
                    </div>
                    <div className="col ">{!this.isReadOnly() && this.renderSubmitButton()}</div>
                </div>
                <div>{this.renderEntityTable()}</div>
                <span>
                    {!this.isReadOnly() && (
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
    state = {
        projects: undefined,
        notesIsOpen: false,
        isLoading: false,
    };

    handleProjectLoadOptions = debounce((inputValue, callback) => {
        console.log('options', inputValue);

        if (!inputValue) {
            this.setState({ projects: null });
            return;
        }

        this.setState({ isLoading: true });
        const searchTerm = inputValue.trim();
        this.props.onChange({ name: 'projectName', value: searchTerm }, this.props.entry);

        axios
            .get('api/projects', {
                params: { searchTerm },
            })
            .then((res) => {
                console.log(res);
                callback(res.data);
            })
            .catch((error) => {
                console.log(error);
                callback(null);
            });
    }, 600);

    handleProjectChange = (e, a) => {
        console.log('change', e, a);
        this.props.onChange({ name: 'project', value: e }, this.props.entry);
    };

    handleProjectCreate = (e) => {
        console.log('Create', e);

        axios
            .post('api/projects', {
                name: e,
            })
            .then((res) => {
                console.log('Created project', res);
                this.props.onChange({ name: 'project', value: res.data }, this.props.entry);
            })
            .catch((error) => {
                console.log('Error creating Project', error);
            });
    };

    handlePieceSearchClick = (e, item) => {
        e.preventDefault();
        this.setState({ project: item, showProjectList: false });
        this.props.onChange({ name: 'project', value: item }, this.props.entry);
    };

    render() {
        const noteStyle = {
            height: '75%',
        };

        // See : https://react-select.com/creatable
        return (
            <tr key={this.props.entry.id}>
                <td>
                    <CreatableSelect
                        autoFocus
                        cacheOptions
                        onCreateOption={this.handleProjectCreate}
                        onChange={this.handleProjectChange}
                        loadOptions={this.handleProjectLoadOptions}
                        defaultOptions={this.props.projects}
                        getOptionLabel={(o) => o.name}
                        getOptionValue={(o) => o.id}
                        getNewOptionData={(i, o) => ({
                            name: `Create "${i}"`,
                        })}
                        value={this.props.entry.project}
                    />
                </td>
                <td>
                    <button className="btn" onClick={(e) => this.setState({ notesIsOpen: true })}>
                        <span aria-label="view note" role="img">
                            {this.props.entry.note ? '📓' : '➕'}
                        </span>
                    </button>
                    <Modal isOpen={this.state.notesIsOpen} ariaHideApp={false}>
                        <h3>
                            Notes:
                            <span className="float-right">
                                <button className="btn" onClick={(e) => this.setState({ notesIsOpen: false })}>
                                    X
                                </button>
                            </span>
                        </h3>
                        <textarea
                            style={noteStyle}
                            name="note"
                            onChange={(e) => this.props.onChange(e.currentTarget, this.props.entry)}
                            value={this.props.entry.note}
                            className="form-control form-control-sm"
                        ></textarea>
                    </Modal>
                </td>
                <td>
                    <input
                        name="value"
                        onChange={(e) => this.props.onChange(e.currentTarget, this.props.entry)}
                        type="number"
                        value={this.props.entry.value}
                        className="partsInput form-control form-control-sm"
                        onFocus={(e) => e.target.select()}
                    ></input>
                </td>
                <td>{(this.props.entry.percentOfPeriod * 100).toFixed(1)}</td>
                <td>
                    <button style={{ padding: 0 }} className="btn btn-sm" onClick={() => this.props.onDelete(this.props.entry)}>
                        <span role="img" aria-label="Delete">
                            🗑️
                        </span>
                    </button>
                </td>
            </tr>
        );
    }
}
