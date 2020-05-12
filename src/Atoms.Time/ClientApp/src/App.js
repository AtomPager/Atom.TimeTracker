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

    state = { userContext: { loading: true }, errorMsg:null };

    componentDidMount() {
        this.populateUserContextData();
    }

    render() {
        return (
            this.state.errorMsg && <div className="alert alert-danger" role="alert">{this.state.errorMsg}</div> ||
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
            .catch((error) => {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    const errorMsg = error.response.data.title || error.response.data || 'Error loading data';
                    console.log(errorMsg);
                    this.setState({ errorMsg, loading: false });
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                    this.setState({ errorMsg: 'Time out', loading: false });
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                    this.setState({ errorMsg: error.message, loading: false });
                }
            });
    }
}
