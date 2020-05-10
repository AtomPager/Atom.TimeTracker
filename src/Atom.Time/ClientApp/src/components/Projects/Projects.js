import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { ProjectIndex } from './ProjectIndex';
import { ProjectCreate } from './ProjectCreate';
import { ProjectEdit } from './ProjectEdit';

export class Projects extends Component {
    render() {
        return (
            <div>
                <h1>
                    Projects
                    {this.props.userContext.isAdmin && (
                        <span className="float-right">
                            <Switch>
                                <Route
                                    path="/projects"
                                    exact
                                    render={() => (
                                        <Link to="/projects/create" className="btn btn-primary btn-sm">
                                            Create
                                        </Link>
                                    )}
                                />
                                <Route
                                    path="/projects"
                                    render={() => (
                                        <Link to="/projects" className="btn btn-outline-secondary btn-sm">
                                            close
                                        </Link>
                                    )}
                                />
                            </Switch>
                        </span>
                    )}
                </h1>
                <Switch>
                    <Route path="/projects/create" component={ProjectCreate} />
                    <Route path="/projects/:projectId" component={ProjectEdit} />
                    <Route path="/projects" render={(props) => <ProjectIndex {...props} userContext={this.props.userContext} />} />
                </Switch>
            </div>
        );
    }
}
