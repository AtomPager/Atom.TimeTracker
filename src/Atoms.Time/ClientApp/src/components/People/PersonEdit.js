import React, { Component } from 'react';
import { Form, Formik } from 'formik';
import axios from 'axios';
import Joi from 'joi-browser';
import { DisplayField, InputField } from '../FormInputs';
import { toast } from 'react-toastify';
import * as yup from 'yup';

export class PersonEdit extends Component {

    state = {
        personId: null,
        person: null,
        errors: {},
        errorMsg: null,
        loading: true
    };

    schema = {
        personId: Joi.number().integer().min(1),
    };

    PersonUpdateSchema = yup.object().shape({
        name: yup.string().max(50).label('Name'),
        startDate: yup.date().label('Start Date'),
        IsActive: yup.boolean().label('Is Active'),
    });
    
    componentDidMount() {
        const personId = Number(this.props.match.params.personId);
        this.getData(personId);
    }

    componentWillReceiveProps(nextProps) {
        const personId = Number(nextProps.match.params.personId);
        this.getData(personId);
    }
    
    getData = (personId) => {
        const { error } = Joi.validate(this.props.match.params, this.schema);
        if (error) {
            this.setState({ errorMsg: 'Invalid ID', loading: false });
            return;
        }

        this.setState({ personId });
        axios
            .get(`api/admin/Persons/${personId}`)
            .then((r) => {
                console.log(r.data);
                const person = r.data;
                this.setState({ person, loading: false });
            })
            .catch((error) => {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    const errorMsg = error.response.data.title || error.response.data || 'Error loading data';
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
                console.log(error.config);
            });
    };

    onSubmit = (person, ctr) => {

        axios
            .post(`api/admin/Persons/${this.state.personId}`, person)
            .then((r) => {
                toast.success('Person Saved');
                ctr.setSubmitting(false);
                this.props.history.push('/people');
            })
            .catch((error) => {
                ctr.setSubmitting(false);
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
    };

    handleFormCancel = (e) => {
        e.preventDefault();
        this.props.history.push('/people');
    };

    render(){
        return <Formik
        initialValues={this.state.person}
        enableReinitialize={true}
        validationSchema={this.PersonUpdateSchema}
        onSubmit={this.onSubmit}
        >
  {({ isSubmitting, dirty, isValid }) => (<Form>
    <div className="row justify-content-md-center">
                            <div className="col-md-6">
                                <DisplayField name="userName" label="User Name" value={this.state.person && this.state.person.userName}/>
                                <InputField name="name" label="Name" type="text" />
                                <InputField name="isActive" label="Is Active" type="checkbox"/>
                                <InputField name="startDate" label="Start Date" type="text"/>
                            </div>
                        </div>
    <div className="form-group row justify-content-md-center">
                            <div className="col-10 col-md-6">
                                <button
                                    type="submit"
                                    className="btn btn-primary mr-1"
                                    disabled={isSubmitting || !dirty || !isValid}
                                >
                                    Save
                                </button>
                                <button className="btn btn-secondary mr-1" onClick={this.handleFormCancel}>
                                    Cancel
                                </button>
                                {!isValid && <div className="invalid-feedback d-block">Fix errors before submitting.</div>}
                            </div>
                        </div>
  </Form>)}
        </Formik>
    }

}