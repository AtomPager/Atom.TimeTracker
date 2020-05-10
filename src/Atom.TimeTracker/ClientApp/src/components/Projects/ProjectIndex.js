import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export class ProjectIndex extends Component {
    constructor(props) {
        super(props);
        this.state = { Projects: [], loading: true };
    }

    componentDidMount() {
        this.populateProjectData();
    }

    static renderTableRow(project) {
        const viewUrl = `/projects/${project.id}`;
        return (
            <tr key={project.id}>
                <td>
                    <Link to={viewUrl}>{project.name}</Link>
                </td>
                <td>{project.classification}</td>
                <td>{project.group}</td>
                <td>{project.isRnD ? '✔️' : ''}</td>
                <td>{project.isArchived ? '✔️' : ''}</td>
            </tr>
        );
    }

    static renderTable(projects) {
        return (
            <table className="table table-striped" aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Classification</th>
                        <th>Group</th>
                        <th>R&#x26;D</th>
                        <th>Archived</th>
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
            .get('api/Projects', { params: { showAll: true } })
            .then((response) => {
                const data = response.data;
                this.setState({ projects: data, loading: false });
            })
            .catch((e) => {
                console.log(e);
            });
    }
}
