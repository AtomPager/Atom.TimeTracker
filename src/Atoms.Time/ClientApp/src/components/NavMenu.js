import React, { Component } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';

export class NavMenu extends Component {
    static displayName = NavMenu.name;

    constructor(props) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            collapsed: true,
        };
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    }

    render() {
        return (
            <header>
                <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3" light>
                    <Container>
                        <NavbarBrand tag={Link} to="/">
                            <img src="/icon.svg" alt="Atoms Time" className="mr-2 mb-1" style={{ width: '20px' }} />
                        </NavbarBrand>
                        <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                        <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!this.state.collapsed} navbar>
                            <ul className="navbar-nav flex-grow">
                                {this.props.userContext.isAdmin && (
                                    <NavItem>
                                        <NavLink tag={Link} className="text-dark" to="/timePeriods">
                                            Periods
                                        </NavLink>
                                    </NavItem>
                                )}
                                {this.props.userContext.isTimeSheetUser && (
                                    <NavItem>
                                        <NavLink tag={Link} className="text-dark" to="/timeSheets">
                                            Time Sheets
                                        </NavLink>
                                    </NavItem>
                                )}
                                <NavItem>
                                    <NavLink tag={Link} className="text-dark" to="/projects">
                                        Projects
                                    </NavLink>
                                </NavItem>
                            </ul>
                        </Collapse>
                    </Container>
                </Navbar>
            </header>
        );
    }
}