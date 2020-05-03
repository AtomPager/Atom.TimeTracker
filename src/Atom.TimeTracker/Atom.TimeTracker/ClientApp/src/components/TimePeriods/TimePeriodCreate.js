import React, { Component } from "react";

export class TimePeriodCreate extends Component {
    state = {
        timePeriodCreate: {
            startDate: "",
            endDate: "",
        },
        errors: {},
    };

    onSubmit = (e) => {
        e.preventDefault();

        const errors = this.validate();
        this.setState({ errors });
        if (errors) return;

        console.log("Submitted");
    };

    handleChange = ({ currentTarget: input }) => {
        const timePeriodCreate = { ...this.state.timePeriodCreate };
        timePeriodCreate[input.name] = input.value;
        this.setState({ timePeriodCreate });
    };

    validate = () => {
        const timePeriodCreate = this.state.timePeriodCreate;
        const errors = {};

        if (!timePeriodCreate.startDate) errors.startDate = "No date set";
        if (!timePeriodCreate.endDate) errors.endDate = "No date set";

        return Object.keys(errors) === 0 ? null : errors;
    };

    render() {
        const timePeriod = this.state.timePeriodCreate;
        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label htmlFor="startDate">
                            Start Date {this.state.errors.startDate && <span className="badge badge-danger">{this.state.errors.startDate}</span>}
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            id="startDate"
                            aria-describedby="startDateHelp"
                            placeholder="Enter Start date"
                            onChange={this.handleChange}
                            value={timePeriod.startDate}
                            name="startDate"
                        />
                        <small id="startDateHelp" className="form-text text-muted">
                            The start date for the new time period.
                        </small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="endDate">End Date {this.state.errors.endDate && <span className="badge badge-danger">{this.state.errors.endDate}</span>}</label>
                        <input
                            type="date"
                            className="form-control"
                            id="endDate"
                            aria-describedby="endDateHelp"
                            placeholder="Enter end date"
                            onChange={this.handleChange}
                            value={timePeriod.endDate}
                            name="endDate"
                        />
                        <small id="endDateHelp" className="form-text text-muted">
                            The end date for the new time period. End dates is inclusive
                        </small>
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Submit
                    </button>
                </form>
            </div>
        );
    }
}
