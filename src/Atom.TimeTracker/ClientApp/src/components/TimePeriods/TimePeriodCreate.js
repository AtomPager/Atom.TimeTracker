import React, { Component } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import axios from "axios";

export class TimePeriodCreate extends Component {
    state = {
        timePeriodCreate: {
            startDate: "",
            endDate: "",
        },
        errors: {},
    };

    componentDidMount() {
        this.populateTimePeriodData();
    }

    async populateTimePeriodData() {
        axios
            .get("api/admin/TimePeriods/SuggestTimes")
            .then((response) => {
                const d = response.data;
                const timePeriodCreate = {
                    startDate: moment(d.startDate).format("YYYY-MM-DD"),
                    endDate: moment(d.endDate).format("YYYY-MM-DD"),
                };

                this.setState({ timePeriodCreate });
            })
            .catch((e) => {
                console.log(e);
            });
    }

    onSubmit = (e) => {
        e.preventDefault();

        const errors = this.validate();
        console.log(errors);
        this.setState({ errors });
        if (Object.keys(errors).length !== 0) return;

        axios
            .post("api/admin/TimePeriods/", this.state.timePeriodCreate)
            .then((r) => {
                this.props.history.push("/time-periods");
            })
            .catch((e) => {
                this.setState({ errors: { form: "Error submitting data" } });
            });
    };

    handleChange = ({ currentTarget: input }) => {
        const timePeriodCreate = { ...this.state.timePeriodCreate };
        timePeriodCreate[input.name] = input.value;
        this.setState({ timePeriodCreate });
    };

    validate = () => {
        const timePeriodCreate = this.state.timePeriodCreate;
        const errors = {};
        var startDate = null;
        var endDate = null;

        if (!timePeriodCreate.startDate) errors.startDate = "No date set";
        else startDate = moment(timePeriodCreate.startDate);
        if (!timePeriodCreate.endDate) errors.endDate = "No date set";
        else endDate = moment(timePeriodCreate.endDate);

        if (startDate && !startDate.isValid()) {
            startDate = null;
            errors.startDate = "Invalid date";
        }

        if (endDate && !endDate.isValid()) {
            endDate = null;
            errors.endDate = "Invalid date";
        }

        if (startDate && endDate) {
            if (endDate.isSameOrBefore(startDate)) errors.endDate = "End date must be after start date";
        }

        return errors;
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
                    &nbsp;
                    <Link to="/time-periods" className="btn btn-outline-secondary">
                        Cancel
                    </Link>
                    {this.state.errors.form && (
                        <div className="alert alert-danger" role="alert">
                            {this.state.errors.form}
                        </div>
                    )}
                </form>
            </div>
        );
    }
}
