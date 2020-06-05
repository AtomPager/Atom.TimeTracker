import React, { Component } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import AsyncSelect from 'react-select/async';

export class ProjectSelector extends Component {
    state = { inputValue: null };

    handleProjectLoadOptions = debounce((inputValue, callback) => {
        console.log('options', inputValue);

        if (!inputValue) {
            this.setState({ projects: null });
            return;
        }

        const searchTerm = inputValue.trim();

        axios
            .get('api/projects', {
                params: { searchTerm },
            })
            .then((res) => {
                console.log(res);
                callback(res.data);
            })
            .catch((error) => {
                console.log(error);
                callback(null);
            });
    }, 600);

    handleProjectChange = (e, a) => {
        this.props.onChange({ targetProject: e });
    };

    render() {
        return (
            <React.Fragment>
                <div>
                    <div className="form-check">
                        <label htmlFor="selectProject" className="form-check-label">
                            Project
                        </label>
                        <AsyncSelect
                            getOptionLabel={(o) => o.name}
                            getOptionValue={(o) => o.id}
                            cacheOptions
                            id="selectProject"
                            onChange={this.handleProjectChange}
                            loadOptions={this.handleProjectLoadOptions}
                        />

                        <small id="endDateHelp" className="form-text text-muted">
                            {this.props.helpMsg}
                        </small>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
