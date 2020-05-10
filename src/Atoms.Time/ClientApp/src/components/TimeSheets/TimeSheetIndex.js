import React, { Component } from 'react';
import axios from 'axios';
import { TimeSheetIndexTableRow } from './TimeSheetIndexTableRow';

export class TimeSheetIndex extends Component {
    state = { loading: true, timeSheets: {} };

    componentDidMount() {
        this.populateTimePeriodData(this.props.showAll);
    }

    componentDidUpdate(nextProps) {
        const { showAll } = this.props;
        if (nextProps.showAll !== showAll) {
            this.populateTimePeriodData(showAll);
        }
    }

    renderTable = (timeSheets) => {
        return (
            <table className="table table-sm table-striped" aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th></th>
                        <th className="d-none d-md-block">Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Date Submitted</th>
                    </tr>
                </thead>
                <tbody>
                    {timeSheets.map((timeSheet) => (
                        <TimeSheetIndexTableRow key={timeSheet.timePeriodId} timeSheet={timeSheet} {...this.props}></TimeSheetIndexTableRow>
                    ))}
                </tbody>
            </table>
        );
    };

    render() {
        let contents = this.state.loading ? (
            <p>
                <em>Loading...</em>
            </p>
        ) : (
            this.renderTable(this.state.timeSheets)
        );

        return <div>{contents}</div>;
    }

    async populateTimePeriodData(showAll) {
        axios
            .get('api/TimeSheets', { params: { showAll } })
            .then((response) => {
                const data = response.data;
                this.setState({ timeSheets: data, loading: false });
            })
            .catch((e) => {
                console.log(e);
            });
    }
}
