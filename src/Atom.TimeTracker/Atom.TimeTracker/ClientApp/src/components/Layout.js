import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';

export class Layout extends Component {
    static displayName = Layout.name;

    render() {
        return (
            <div>
                <NavMenu />
                <Container>{this.props.children}</Container>
                <footer>
                    Powered by{' '}
                    <a className="badge badge-light" href="https://github.com/AtomPager/Atom.TimeTracker">
                        Atom Time Tracker
                    </a>
                </footer>
            </div>
        );
    }
}
