import React, { Component } from 'react';
import { NavMenu } from './NavMenu';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

export class Layout extends Component {
    static displayName = Layout.name;

    render() {
        return (
            <div>
                <NavMenu userContext={this.props.userContext} />
                <div className="container-md">{this.props.children}</div>
                <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss pauseOnHover />
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
