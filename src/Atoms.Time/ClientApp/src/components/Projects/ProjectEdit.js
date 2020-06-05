import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Joi from 'joi-browser';
import { ProjectSelector } from './ProjectSelector';
import { toast } from 'react-toastify';

export class ProjectEdit extends Component {
    state = {
        projectId: null,
        project: null,
        errors: {},
        errorMsg: null,
        loading: true,
        mergeTargetProject: null,
    };

    schema = {
        projectId: Joi.number().integer().min(1),
    };

    componentDidMount() {
        const { error } = Joi.validate(this.props.match.params, this.schema);
        if (error) {
            this.setState({ errorMsg: 'Invalid ID', loading: false });
            return;
        }

        const projectId = Number(this.props.match.params.projectId);

        this.setState({ projectId });
        axios
            .get(`api/Projects/${projectId}`)
            .then((r) => {
                console.log(r.data);
                const project = r.data;
                this.setState({ project, loading: false });
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

    onSubmit = (e) => {
        e.preventDefault();

        const errors = this.validate();
        console.log(errors);
        this.setState({ errors });
        if (Object.keys(errors).length !== 0) return;

        axios
            .post(`api/Projects/${this.state.projectId}`, this.state.project)
            .then((r) => {
                toast.success('Project Saved');
                this.props.history.push('/projects');
            })
            .catch((error) => {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    const errorMsg = error.response.data.title || error.response.data || 'Error loading data';
                    console.log(errorMsg);
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
            });
    };

    onMergeSubmit = (e) => {
        e.preventDefault();

        if (!this.state.mergeTargetProject) return;

        axios
            .post(`api/Projects/${this.state.projectId}/mergeInto/${this.state.mergeTargetProject.id}`)
            .then((r) => {
                toast.success('Project Merged');
                this.props.history.push(`/projects/${this.state.projectId}`);
            })
            .catch((error) => {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    const errorMsg = error.response.data.title || error.response.data || 'Error loading data';
                    console.log(errorMsg);
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
            });
    };

    handleProjectSelectorChange = ({ targetProject }) => {
        console.log('targetProject', targetProject);
        if (this.state.projectId === targetProject.id) {
            this.setState({ mergeTargetProject: null });
        } else {
            this.setState({ mergeTargetProject: targetProject });
        }
    };

    handleChange = ({ currentTarget: input }) => {
        const project = { ...this.state.project };
        if (input.type === 'checkbox') {
            project[input.name] = input.checked;
        } else {
            project[input.name] = input.value;
        }
        this.setState({ project });
    };

    validate = () => {
        const project = this.state.project;
        const errors = {};

        if (!project.name) errors.name = 'No date set';
        if (project.name.length === 0) errors.name = 'No date set';
        return errors;
    };

    renderForm = () => {
        const project = this.state.project;
        // TODO: Move this out to it's own class, and re-uew with the create pages.
        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name {this.state.errors.name && <span className="badge badge-danger">{this.state.errors.name}</span>}</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            aria-describedby="nameHelp"
                            placeholder="Enter project name"
                            onChange={this.handleChange}
                            value={project.name}
                            name="name"
                        />
                        <small id="nameHelp" className="form-text text-muted">
                            The short name of the project.
                        </small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="keyWords">KeyWords {this.state.errors.keyWords && <span className="badge badge-danger">{this.state.errors.keyWords}</span>}</label>
                        <input
                            type="text"
                            className="form-control"
                            id="keyWords"
                            aria-describedby="keyWordsHelp"
                            placeholder="Enter project keyWords"
                            onChange={this.handleChange}
                            value={project.keyWords}
                            name="keyWords"
                        />
                        <small id="keyWordsHelp" className="form-text text-muted">
                            Keywords that are used when searching for projects in the timesheet.
                        </small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="classification">
                            Classification {this.state.errors.classification && <span className="badge badge-danger">{this.state.errors.classification}</span>}
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="classification"
                            aria-describedby="nameHelp"
                            placeholder="Enter project classification"
                            onChange={this.handleChange}
                            value={project.classification}
                            name="classification"
                        />
                        <small id="startDateHelp" className="form-text text-muted">
                            The classification of the project.
                        </small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="group">Group {this.state.errors.group && <span className="badge badge-danger">{this.state.errors.group}</span>}</label>
                        <input
                            type="text"
                            className="form-control"
                            id="group"
                            aria-describedby="nameHelp"
                            placeholder="Enter project group"
                            onChange={this.handleChange}
                            value={project.group}
                            name="group"
                        />
                        <small id="startDateHelp" className="form-text text-muted">
                            The group or team that is responsable for this project. This is used when you want to know how much team each person is working on projects for a
                            given group.
                        </small>
                    </div>
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="showByDefault"
                            aria-describedby="endDateHelp"
                            onChange={this.handleChange}
                            checked={project.showByDefault}
                            name="showByDefault"
                        />
                        <label htmlFor="showByDefault" className="form-check-label">
                            Show By Default {this.state.errors.showByDefault && <span className="badge badge-danger">{this.state.errors.showByDefault}</span>}
                        </label>

                        <small id="endDateHelp" className="form-text text-muted">
                            Should be shown in the project dropdown, along with the persons recently used project, unless the user is searching from something specific
                        </small>
                    </div>
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="isRnD"
                            aria-describedby="endDateHelp"
                            onChange={this.handleChange}
                            checked={project.isRnD}
                            name="isRnD"
                        />
                        <label htmlFor="isRnD" className="form-check-label">
                            is R&#x26;D {this.state.errors.isRnD && <span className="badge badge-danger">{this.state.errors.isRnD}</span>}
                        </label>

                        <small id="endDateHelp" className="form-text text-muted">
                            Is this project considered R&#x26;D for Tax purpuses?
                        </small>
                    </div>
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="isArchived"
                            aria-describedby="endDateHelp"
                            onChange={this.handleChange}
                            checked={project.isArchived}
                            name="isArchived"
                        />
                        <label htmlFor="isArchived" className="form-check-label">
                            is Archived {this.state.errors.isArchived && <span className="badge badge-danger">{this.state.errors.isArchived}</span>}
                        </label>

                        <small id="endDateHelp" className="form-text text-muted">
                            Is this project considered complete, and should no longer be listed in new time sheet?
                        </small>
                    </div>
                    <div className="pt-3">
                        <button type="submit" className="btn btn-primary">
                            Submit
                        </button>
                        &nbsp;
                        <Link to="/projects" className="btn btn-outline-secondary">
                            Cancel
                        </Link>
                        {this.state.errorMsg && (
                            <div className="alert alert-danger" role="alert">
                                {this.state.errorMsg}
                            </div>
                        )}
                    </div>
                </form>
            </div>
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
            <div>{this.renderForm()}</div>
        );

        return (
            <React.Fragment>
                {contents}
                <hr />
                <h3>Merge into project</h3>
                <form onSubmit={this.onMergeSubmit}>
                    <ProjectSelector
                        helpMsg="Move all existing uses of this project to the target project, and then delete this project."
                        onChange={this.handleProjectSelectorChange}
                    />
                    <div className="pt-3">
                        <button type="submit" className="btn btn-outline-danger" disabled={!this.state.mergeTargetProject}>
                            Merge
                        </button>
                    </div>
                </form>
            </React.Fragment>
        );
    }
}
