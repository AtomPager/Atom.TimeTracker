import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export class PersonsIndex extends Component {
    constructor(props) {
        super(props);
        this.state = { persons: [], loading: true };
    }

    componentDidMount() {
        this.populateProjectData();
    }

    renderTableRow = (person) => {
        const viewUrl = `/people/${person.id}`;
        return (
            <tr key={person.id}>
                <td><Link to={viewUrl}>{person.name}</Link></td>
                <td>{new Date(person.startDate).toLocaleDateString()}</td>
                <td>{person.isActive ? '✔️' : ''}</td>
            </tr>
        );
    };

    renderTable = (persons) => {
        return (
            <table className="table table-striped" aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>StartDate</th>
                        <th>Active</th>
                    </tr>
                </thead>
                <tbody>{persons.map((person) => this.renderTableRow(person))}</tbody>
            </table>
        );
    };

    render() {
        let contents = this.state.loading ? (
            <p>
                <em>Loading...</em>
            </p>
        ) : (
            this.renderTable(this.state.persons)
        );

        return <div>{contents}</div>;
    }

    async populateProjectData() {
        axios
            .get('api/admin/persons')
            .then((response) => {
                const data = response.data;
                this.setState({ persons: data, loading: false });
            })
            .catch((e) => {
                console.log(e);
            });
    }
}
