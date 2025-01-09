import React, { FunctionComponent, useState, useEffect } from 'react';
import { Styles, Cookies, Endpoints } from '../functions/constants';
import {Button, Form} from 'react-bootstrap';
import { iComponentProps, iResponseObject } from '../functions/interfaces';
import { Redirect } from 'react-router';
import cookie from 'react-cookies';
import { iRequestObject, iUpdateResponseObject, iUserObject } from '../functions/interfaces';
import { hashPassword, goFetch} from '../functions/functions';
import { RequestObject, UserObject } from '../functions/constructors';
import { UserManager } from './usermanager';

export const Splash: FunctionComponent<iComponentProps> = function ({ ...props }): React.ReactElement {
    interface iUI {
        userEmail: string;
        userPassword: string;
        saveCredentials: boolean;
        showUserManager: boolean;
        message: string;
    }

    class UIObject implements iUI {
        constructor() {
            this.userEmail = '';
            this.userPassword = '';
            this.saveCredentials = false;
            this.showUserManager = false;
            this.message = '';
        }
        userEmail: string;
        userPassword: string;
        saveCredentials: boolean;
        showUserManager: boolean;
        message: string;
    }

    const [UI, updateUI] = useState(new UIObject());

    const logonBowlCup: Function = function (event: React.FormEvent): void {
        event.preventDefault();
        attemptLogon(UI.userEmail, UI.userPassword);

        if (UI.saveCredentials) {
            cookie.save(Cookies.userEmail, UI.userEmail, {
                domain: process.env.PUBLIC_URL,
                maxAge: 1000,
                secure: false,
                httpOnly: false,
            });
            cookie.save(Cookies.userPassword, UI.userPassword, {
                domain: process.env.PUBLIC_URL,
                maxAge: 1000,
                secure: false,
                httpOnly: false,
            });
        } else {
            cookie.remove(Cookies.userEmail);
            cookie.remove(Cookies.userPassword);
        };
    };

    const attemptLogon: Function = function (userEmail: string, userPassword: string) {
        const callback: Function = function (responseObject:iResponseObject): void {
            console.log(responseObject)
            if (responseObject.success) {
                props.updateFunction(responseObject);
            } else {
                updateUI(Object.assign(new UIObject(), UI, { message: responseObject.error }));
            }
        }

        let newRequest = new RequestObject();
        newRequest.user.user_password = hashPassword(userPassword);
        newRequest.user.user_email = userEmail;
        console.log("Request", newRequest);
        goFetch(newRequest, Endpoints.logon, callback);
    };

    const cookieLogin: Function = function (): void {
        let cookieEmail: string = cookie.load(Cookies.userEmail);
        let cookiePassword: string = cookie.load(Cookies.userPassword);
        //console.log(cookieEmail, cookiePassword);
        if (cookieEmail && cookiePassword && !props.dataObject.isAuthenticated) {
            attemptLogon(cookieEmail, cookiePassword);
        };
    };

    const forgotPassword: Function = function (): void {
        const emailReg: RegExp = /\S+@\S+\.\S+/;
        if (emailReg.test(UI.userEmail)) {
            const callback: Function = function (responseObject: iUpdateResponseObject): void {
                console.log("Response", responseObject);
                if (responseObject.success) {
                    updateUI(Object.assign(new UIObject(), UI, { message: 'New password has been sent to ' + UI.userEmail }));
                } else {
                    updateUI(Object.assign(new UIObject(), UI, { message: responseObject.error }));
                }
            }
            let newUser: iUserObject = props.dataObject.user;
            newUser.user_email = UI.userEmail;
            let newRequest: iRequestObject = new RequestObject(newUser, newUser.user_id, null, newUser);
            goFetch(newRequest, Endpoints.resetpassword, callback);
        } else {
            updateUI(Object.assign(new UIObject(), UI, { message: "'" + UI.userEmail + "' is not a valid email address" }));
        }
    }

    useEffect(() => {
        //if (!props.dataObject.isAuthenticated){cookieLogin()};
        if (!props.dataObject.isAuthenticated) { attemptLogon('chris.broderick@verizon.net', '7Juie') };
    }, [props.dataObject.isAuthenticated])

    return (
        <>
            {
                props.dataObject.isAuthenticated
                    ?
                    <Redirect to='/main' />
                    :
                    <div style={Styles.sContainerCenter}>
                        <UserManager show={UI.showUserManager} user={props.dataObject.user} showFunction={(show: boolean, message: string = '') => { updateUI(Object.assign(new UIObject(), UI, { showUserManager: show, message: message })) }} />
                        <div style={{ display: 'block' }}>
                            <br />
                                <div style={{ ...Styles.sContainerCenter, ...Styles.sContainerFont }}>
                                <img style={{ height: '300px', width: '300px' }} src='/images/umd.webp' alt='Bowl Cup' />
                            </div>
                            <br />
                            <br />
                            <div>
                                <h1>The Bowl Cup Tournament</h1>
                            </div>
                            <br />
                            <div style={Styles.sContainerCenter}>
                                    <div >
                                        <Form onSubmit={(event: React.ChangeEvent<HTMLFormElement>):void => { logonBowlCup(event) }}>
                                            <Form.Group controlId="formBasicEmail" >
                                                <Form.Control
                                                    name="email_input"
                                                    type="email"
                                                    placeholder="Enter email"
                                                    onChange={
                                                        (event: React.ChangeEvent<HTMLInputElement>): void => {
                                                            updateUI(Object.assign(new UIObject(), UI, { userEmail: event.currentTarget.value}))
                                                        }
                                                    }
                                                />
                                                <Form.Text className="text-muted">
                                                    We'll never share your email with anyone else.
                                                </Form.Text>
                                            </Form.Group>
                                            <Form.Group controlId="formBasicPassword">
                                                <Form.Control
                                                    name="password_email"
                                                    type="password"
                                                    placeholder="Enter password"
                                                    onChange={
                                                        (event: React.ChangeEvent<HTMLInputElement>): void => {
                                                            updateUI(Object.assign(new UIObject(), UI, { userPassword: event.currentTarget.value}))
                                                        }
                                                    }
                                                />
                                            </Form.Group>
                                            <Form.Group controlId="formBasicCheckbox">
                                                <Form.Check
                                                    name="save_settings"
                                                    type="checkbox"
                                                    label="Remember me (requires cookies)"
                                                    onChange={
                                                        (event: React.ChangeEvent<HTMLInputElement>): void => {
                                                            updateUI(Object.assign(new UIObject(), UI, { saveCredentials: event.currentTarget.checked}))
                                                        }
                                                    }
                                                />
                                            </Form.Group>
                                            <Button variant="primary" type="submit">Login
                                            </Button>
                                        </Form>
                                    </div>
                            </div>
                            <br />
                                <label>
                                    <h5 style={{ color: 'red' }}>{UI.message}</h5>
                                </label>
                            <br />
                            <div style={Styles.sContainerCenter}>
                                <a href='#' onClick={(): void => { forgotPassword() }}>
                                    Forgot Password?
                                </a>
                            </div>
                            <div style={Styles.sContainerCenter}>
                                <a href="#" onClick={():void => { updateUI(Object.assign(new UIObject(), UI, { showUserManager: true, message: '' })) }}>
                                    New Users Register Here
                                </a>
                            </div>
                        </div>
                    </div>
            }
        </>
  );
}

