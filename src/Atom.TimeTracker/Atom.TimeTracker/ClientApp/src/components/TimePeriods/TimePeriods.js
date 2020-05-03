import React, { Component } from 'react';

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
            <table className='table table-striped' aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Work Days</th>
                    </tr>
                </thead>
                <tbody>
                    {timePeriods.map(timePeriod =>
                        <tr key={timePeriod.id}>
                            <td>{timePeriod.PeriodStartDate}</td>
                            <td>{timePeriod.PeriodEndDate}</td>
                            <td>{timePeriod.WorkDays}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }

    render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : TimePeriods.renderTable(this.state.timePeriods);

        return (
           <div>{contents}</div>
        );
    }

    async populateTimePeriodData() {
        const response = await fetch('api/admin/TimePeriods');
        const data = await response.json();
        this.setState({ timePeriods: data, loading: false });
    }
}
