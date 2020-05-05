import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export class ProjectCreate extends Component {
    state = {
        projectCreate: {
            name: '',
            isRnD: false,
        },
        errors: {},
        errorMsg: null,
    };

    onSubmit = (e) => {
        e.preventDefault();

        const errors = this.validate();
        console.log(errors);
        this.setState({ errors });
        if (Object.keys(errors).length !== 0) return;

        axios
            .post('api/Projects/', this.state.projectCreate)
            .then((r) => {
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

    handleChange = ({ currentTarget: input }) => {
        const projectCreate = { ...this.state.projectCreate };
        if (input.type === 'checkbox') {
            projectCreate[input.name] = input.checked;
        } else {
            projectCreate[input.name] = input.value;
        }
        this.setState({ projectCreate });
    };

    validate = () => {
        const projectCreate = this.state.projectCreate;
        const errors = {};

        if (!projectCreate.name) errors.name = 'No date set';
        if (projectCreate.name.length === 0) errors.name = 'No date set';
        return errors;
    };

    render() {
        const project = this.state.projectCreate;
        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Start Date {this.state.errors.name && <span className="badge badge-danger">{this.state.errors.name}</span>}</label>
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
                        <small id="startDateHelp" className="form-text text-muted">
                            The name for the new project.
                        </small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="isRnD">is R&#x26;D {this.state.errors.isRnD && <span className="badge badge-danger">{this.state.errors.isRnD}</span>}</label>
                        <input
                            type="checkbox"
                            className="form-control"
                            id="isRnD"
                            aria-describedby="endDateHelp"
                            onChange={this.handleChange}
                            checked={project.isRnD}
                            name="isRnD"
                        />
                        <small id="endDateHelp" className="form-text text-muted">
                            Is this project considered R&#x26;D?
                        </small>
                    </div>
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
                </form>
            </div>
        );
    }
}
