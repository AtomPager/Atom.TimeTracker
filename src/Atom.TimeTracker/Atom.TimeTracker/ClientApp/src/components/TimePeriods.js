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
            <div>
                <h1 id="tabelLabel" >Time Periods 
                    <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
                    Add New
                    </button>
                    <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Modal title</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            ...
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary">Save changes</button>
                        </div>
                        </div>
                    </div>
                    </div>
                </h1>
                
                {contents}

                 
            </div>
        );
    }

    async populateTimePeriodData() {
        const response = await fetch('api/admin/TimePeriods');
        const data = await response.json();
        this.setState({ timePeriods: data, loading: false });
    }
}
