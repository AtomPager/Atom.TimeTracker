import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { TimePeriods } from './components/TimePeriods/TimePeriods';
import { Projects } from './components/Projects/Projects';
import { TimeSheets } from './components/TimeSheets/TimeSheets';

import './custom.css';

export default class App extends Component {
    static displayName = App.name;

    render() {
        return (
            <Layout>
                <Route exact path="/" component={Home} />

                <Route path="/time-periods" component={TimePeriods} />
                <Route path="/projects" component={Projects} />
                <Route path="/TimeSheets" component={TimeSheets} />
            </Layout>
        );
    }
}
