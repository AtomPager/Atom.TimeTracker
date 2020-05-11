import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';

export class Layout extends Component {
    static displayName = Layout.name;

    render() {
        return (
            <div>
                <NavMenu userContext={this.props.userContext} />
                <div className="container-md">{this.props.children}</div>
                <footer>
                    <div className="container-md">
                        Powered by{' '}
                        <a className="badge badge-light" href="https://github.com/AtomsProject/Atoms.Time">
                            Atoms Time
                        </a>
                    </div>
                </footer>
            </div>
        );
    }
}
