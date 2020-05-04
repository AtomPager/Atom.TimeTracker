import React, { Component } from 'react';
import axios from 'axios';

export class ProjectIndex extends Component {
    constructor(props) {
        super(props);
        this.state = { Projects: [], loading: true };
    }

    componentDidMount() {
        this.populateProjectData();
    }

    static renderTableRow(project) {
        return (
            <tr key={project.id}>
                <td>{project.name}</td>
                <td>{project.isRnD ? '✔️' : ''}</td>
                <td>{project.isObsolete ? '✔️' : ''}</td>
            </tr>
        );
    }

    static renderTable(projects) {
        return (
            <table className="table table-striped" aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>R&#x26;D</th>
                        <th>Obsolete</th>
                    </tr>
                </thead>
                <tbody>{projects.map((project) => ProjectIndex.renderTableRow(project))}</tbody>
            </table>
        );
    }

    render() {
        let contents = this.state.loading ? (
            <p>
                <em>Loading...</em>
            </p>
        ) : (
            ProjectIndex.renderTable(this.state.projects)
        );

        return <div>{contents}</div>;
    }

    async populateProjectData() {
        axios
            .get('api/Projects')
            .then((response) => {
                const data = response.data;
                this.setState({ projects: data, loading: false });
            })
            .catch((e) => {
                console.log(e);
            });
    }
}
