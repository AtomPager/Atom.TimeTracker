import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export class TimePeriodIndex extends Component {
    constructor(props) {
        super(props);
        this.state = { timePeriods: [], loading: true };
    }

    componentDidMount() {
        this.populateTimePeriodData();
    }

    static renderTableRow(timePeriod) {
        const viewUrl = `/time-periods/${timePeriod.id}`;
        let classes = '';

        if (timePeriod.status === 'Current') {
            classes += 'table-success';
        }

        return (
            <tr key={timePeriod.id} className={classes}>
                <td>
                    <Link to={viewUrl}>
                        <span role="img" aria-label="view">
                            🔍
                        </span>
                    </Link>
                </td>
                <td className="d-none d-md-block">{new Date(timePeriod.periodStartDate).toLocaleDateString()}</td>
                <td>{new Date(timePeriod.periodEndDate).toLocaleDateString()}</td>
                <td>{timePeriod.workDays}</td>
                <td>{timePeriod.notStarted}</td>
                <td>{timePeriod.notSubmitted}</td>
                <td>{timePeriod.complete}</td>
            </tr>
        );
    }

    static renderTable(timePeriods) {
        return (
            <table className="table table-sm table-striped" aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th></th>
                        <th className="d-none d-md-block">Start Date</th>
                        <th>End Date</th>
                        <th>Work Days</th>
                        <th>Not Started</th>
                        <th>Started</th>
                        <th>Complete</th>
                    </tr>
                </thead>
                <tbody>{timePeriods.map((timePeriod) => TimePeriodIndex.renderTableRow(timePeriod))}</tbody>
            </table>
        );
    }

    render() {
        let contents = this.state.loading ? (
            <p>
                <em>Loading...</em>
            </p>
        ) : (
            TimePeriodIndex.renderTable(this.state.timePeriods)
        );

        return <div>{contents}</div>;
    }

    async populateTimePeriodData() {
        axios
            .get('api/admin/TimePeriods')
            .then((response) => {
                const data = response.data;
                this.setState({ timePeriods: data, loading: false });
            })
            .catch((e) => {
                console.log(e);
            });
    }
}
