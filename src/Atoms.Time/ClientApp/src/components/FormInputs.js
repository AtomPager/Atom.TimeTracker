import { ErrorMessage, Field } from 'formik';
import React from 'react';

export const InputField = (props) => {
    return (
        <div className="form-group">
            <label htmlFor={props.name} className="col-form-label">
                {props.label || props.name}
            </label>
            <Field type={props.type} name={props.name} className="form-control" />
            <ErrorMessage className="invalid-feedback d-block" name={props.name} component="div" />
        </div>
    );
};

export const DisplayField = (props) => {
    return (
        <div className="form-group">
            <label htmlFor={props.name} className="col-form-label">
                {props.label || props.name}
            </label>
            <input type="text" readOnly aria-readonly className="form-control" id={props.name} placeholder={props.value} />
            <ErrorMessage name={props.name} component="div" />
        </div>
    );
};