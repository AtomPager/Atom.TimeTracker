import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { TimePeriods } from './components/TimePeriods/TimePeriods';
import { Projects } from './components/Projects/Projects';
import { TimeSheets } from './components/TimeSheets/TimeSheets';
import axios from 'axios';

import './custom.css';

export default class App extends Component {
    static displayName = App.name;

    state = { userContext: {} };

    componentDidMount() {
        this.populateUserContextData();
    }

    render() {
        return (
            <Layout userContext={this.state.userContext}>
                <Route exact path="/" component={(props) => <Home {...props} userContext={this.state.userContext} />} />

                <Route path="/timePeriods" component={TimePeriods} />
                <Route path="/projects" render={(props) => <Projects {...props} userContext={this.state.userContext} />} />
                <Route path="/timeSheets" component={TimeSheets} />
            </Layout>
        );
    }

    async populateUserContextData(showAll) {
        axios
            .get('api/context')
            .then((response) => {
                this.setState({ userContext: response.data });
            })
            .catch((e) => {
                console.log(e);
            });
    }
}
