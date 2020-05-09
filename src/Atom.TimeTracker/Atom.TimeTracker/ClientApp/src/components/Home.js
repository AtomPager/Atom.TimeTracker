import axios from 'axios';
import React, { Component } from 'react';
import { TimeSheetIndex } from './TimeSheets/TimeSheetIndex';

export class Home extends Component {
    state = {
        context: null,
        loading: true,
    };

    componentDidMount() {
        this.populateTimePeriodData(this.props.showAll);
    }

    render() {
        return (
            <div>
                <p>
                    Welcome{' '}
                    {this.state.context && (
                        <span>
                            {this.state.context.name} ({this.state.context.user})
                        </span>
                    )}
                </p>
                <h2>Your recent and up coming time sheets</h2>
                <TimeSheetIndex />
            </div>
        );
    }

    async populateTimePeriodData(showAll) {
        axios
            .get('api/context')
            .then((response) => {
                const data = response.data;
                this.setState({ context: data, loading: false });
            })
            .catch((e) => {
                console.log(e);
            });
    }
}
