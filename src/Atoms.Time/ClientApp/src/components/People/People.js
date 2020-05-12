import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { PersonsIndex } from './PersonsIndex';
import { PersonCreate } from './PersonCreate';
import { PersonEdit } from './PersonEdit';

export class People extends Component {
    render() {
        return (
            <div>
                <h1>
                    People
                    
                        <span className="float-right">
                            <Switch>
                                <Route
                                    path="/people"
                                    exact
                                    render={() => (
                                        <Link to="/people/create" className="btn btn-primary btn-sm">
                                            Add
                                        </Link>
                                    )}
                                />
                                <Route
                                    path="/people"
                                    render={() => (
                                        <Link to="/people" className="btn btn-outline-secondary btn-sm">
                                            close
                                        </Link>
                                    )}
                                />
                            </Switch>
                        </span>
                </h1>
                <Switch>
                    <Route path="/people/create" component={PersonCreate} />
                    <Route path="/people/:personId" component={PersonEdit} />
                    <Route path="/people" component={PersonsIndex} />
                </Switch>
            </div>
        );
    }
}
