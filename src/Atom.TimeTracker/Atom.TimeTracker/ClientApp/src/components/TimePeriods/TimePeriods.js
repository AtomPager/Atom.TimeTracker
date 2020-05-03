import React, { Component } from "react";
import axios from "axios";

export class TimePeriods extends Component {
    static displayName = TimePeriods.name;

    constructor(props) {
        super(props);
        this.state = { timePeriods: [], loading: true };
    }

    componentDidMount() {
        this.populateTimePeriodData();
    }

    static renderTable(timePeriods) {
        return (
            <table className="table table-striped" aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Work Days</th>
                    </tr>
                </thead>
                <tbody>
                    {timePeriods.map((timePeriod) => (
                        <tr key={timePeriod.id}>
                            <td>{new Date(timePeriod.periodStartDate).toLocaleDateString()}</td>
                            <td>{new Date(timePeriod.periodEndDate).toLocaleDateString()}</td>
                            <td>{timePeriod.workDays}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    render() {
        let contents = this.state.loading ? (
            <p>
                <em>Loading...</em>
            </p>
        ) : (
            TimePeriods.renderTable(this.state.timePeriods)
        );

        return <div>{contents}</div>;
    }

    async populateTimePeriodData() {
        axios
            .get("api/admin/TimePeriods")
            .then((response) => {
                const data = response.data;
                this.setState({ timePeriods: data, loading: false });
            })
            .catch((e) => {
                console.log(e);
            });
    }
}
