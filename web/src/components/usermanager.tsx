import React, { useRef, useState, useEffect } from 'react';
import { Modal, Container, Row, Col , Button, Form, InputGroup, Image} from 'react-bootstrap';
import { iUserObject, iUpdateResponseObject, iRequestObject, iGroupObject } from '../functions/interfaces';
import { UserObject, RequestObject, GroupObject } from '../functions/constructors';
import { hashPassword, goFetch, scramblePassword } from '../functions/functions';
import { Endpoints } from '../functions/constants';
import { ImageCircle } from './common';

interface iUserManagerProps {
    user: iUserObject
    show: boolean;
    showFunction: Function;
}

export const UserManager: React.FunctionComponent<iUserManagerProps> = function ({ ...props }): React.ReactElement {
    interface iUIObject {
        newGroup: boolean;
        errorMessage: string;
        inputChanged: boolean;
        user: iUserObject;
        group?: iGroupObject;
    }

    class UIObject implements iUIObject {
        constructor(user: iUserObject, group: iGroupObject | undefined | null = null) {
            this.newGroup = false;
            this.errorMessage = '';
            this.inputChanged = false;
            this.user = user;
            if (group) {
                this.group = group;
            } else {
                if (user && user.user_id === 0) {
                    this.group = new GroupObject();
                }
            }
        }
        newGroup: boolean;
        errorMessage: string;
        inputChanged: boolean;
        user: iUserObject;
        group?: iGroupObject;
    }

    const inputRefs = {
        user_name: useRef<HTMLInputElement>(null),
        user_email: useRef<HTMLInputElement>(null),
        user_sms: useRef<HTMLInputElement>(null),
        user_password: useRef<HTMLInputElement>(null),
        group_password: useRef<HTMLInputElement>(null),
    }

    const [UI, updateUI] = useState(new UIObject(new UserObject(props.user)));
    //console.log(UI);

    const validateInputs: Function = function (): boolean {
        const emailReg: RegExp = /\S+@\S+\.\S+/;
        const phoneReg: RegExp = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

        if (!UI.user.user_name || !UI.user.user_name.length) {
            updateUI(Object.assign(new UIObject(UI.user), { errorMessage: 'User name must be 4 characters' }))
            if (inputRefs.user_name.current) { inputRefs.user_name.current.focus() }
            return false;
        } else if (!UI.user.user_email || !emailReg.test(UI.user.user_email)) {
            updateUI(Object.assign(new UIObject(UI.user), { errorMessage: 'Not a valid email address' }))
            if (inputRefs.user_email.current) { inputRefs.user_email.current.focus() }
            return false;
        } else if (UI.user.user_sms_contact && !(UI.user.user_sms && phoneReg.test(UI.user.user_sms))) {
            updateUI(Object.assign(new UIObject(UI.user), { errorMessage: 'Not a valid SMS Number. Either enter a valid number or unselect.' }))
            if (inputRefs.user_sms.current) { inputRefs.user_sms.current.focus() }
            return false;
        } else if (UI.user.user_password && (UI.user.user_password.length && UI.user.user_password.length < 6)) {
            updateUI(Object.assign(new UIObject(UI.user), { errorMessage: 'New password must be 6 characters' }))
            if (inputRefs.user_password.current) { inputRefs.user_password.current.focus() }
            return false;
        } else if (UI.group && !UI.newGroup && UI.group.group_password.length < 6) {
            updateUI(Object.assign(new UIObject(UI.user), { errorMessage: 'Not a valid group password' }))
            if (inputRefs.group_password.current) { inputRefs.group_password.current.focus() }
            return false;
        } else {
            return true;
        }
    }

    const submitUserInput: Function = function (event: React.FormEvent):void {
        event.preventDefault();
        if (validateInputs()) {
            const callback: Function = function (responseObject: iUpdateResponseObject): void {
                if (responseObject.success) {
                    props.showFunction(false, 'New password has been sent to ' + UI.user.user_email);
                    updateUI(new UIObject(new UserObject()));
                } else {
                    updateUI(Object.assign(new UIObject(UI.user), UI, { errorMessage: responseObject.error }));
                }
            }

            let newUser: iUserObject = UI.user;
            let newGroup: iGroupObject | undefined = UI.group;
            if (newUser.user_password && newUser.user_password.length) {newUser.user_password = scramblePassword(UI.user.user_password)}
            if (newGroup && newGroup.group_password.length) { newGroup.group_password = hashPassword(newGroup.group_password) }
            let requestObject: iRequestObject = new RequestObject(props.user, props.user.user_id, null, newUser, newGroup);
            console.log("Request", requestObject);
            if (UI.user.user_id === 0) {
                goFetch(requestObject, Endpoints.newuser, callback)
            } else {
                goFetch(requestObject, Endpoints.updateuser, callback)
            }
        }
    }

    const resolvePicture: Function = function (): string {
        if (UI.user.picture && typeof (UI.user.picture.contents) === 'string' && UI.user.picture.contents.length) {
            return UI.user.picture.contents;
        } else {
            if (UI.user.user_id === 0) {
                return '/users/_generic.png';
            } else {
                return '/users/' + UI.user.user_picture_location;
            }
        }
    }

    useEffect(() => {
        inputRefs.user_name?.current && inputRefs.user_name.current.focus();
    }, [])

    return (
        <Modal
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={props.show}
            backdrop="static"
            keyboard={false}
            onHide={() => { props.showFunction(false, UI.inputChanged ? "New user created but not saved. Return to 'New User Registration' to complete" : '') }}
        >
            <Form onSubmit={(event: React.FormEvent):void => {submitUserInput(event) }}>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        <ImageCircle pictureLocation={resolvePicture()} dimensions={'60px'}/>
                        {UI.user.user_id ? 'Manage User Profile: ' + UI.user.user_name : 'New User Profile: ' + UI.user.user_name}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="show-grid">
                    <Container>
                        <Row>
                            <Col xs={12} md={10} lg={8} xl={6}>
                                <Form.Group controlId="formBasicText">
                                    <Form.Label>User Name</Form.Label>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Prepend>
                                            <InputGroup.Checkbox
                                                defaultChecked={UI.user.user_participating}
                                                onChange={(event: React.ChangeEvent<HTMLInputElement>):void => {
                                                    let newUser: iUserObject = UI.user;
                                                    newUser.user_participating = event.currentTarget.checked;
                                                    updateUI(Object.assign(new UIObject(newUser), UI, { inputChanged: true }))
                                                }}
                                            />
                                        </InputGroup.Prepend>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter name (required)"
                                            ref={inputRefs.user_name}
                                            defaultValue={UI.user.user_name}
                                            onChange={(event: React.ChangeEvent<HTMLInputElement>):void => {
                                                let newUser: iUserObject = UI.user;
                                                newUser.user_name = event.currentTarget.value;
                                                updateUI(Object.assign(new UIObject(newUser), UI, { inputChanged: true }))
                                            }}
                                        />
                                        <Form.Text className="text-muted">
                                            Select if you are participating in the Bowl Cup Tournament
                                        </Form.Text>
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group controlId="formBasicText">
                                    <Form.Label>Screen Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter screen name (default is User Name)"
                                        defaultValue={UI.user.user_alias}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>):void => {
                                            let newUser: iUserObject = UI.user;
                                            newUser.user_alias = event.currentTarget.value;
                                            updateUI(Object.assign(new UIObject(newUser), UI, { inputChanged: true }))
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label>email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        ref={inputRefs.user_email}
                                        placeholder="Enter email address (required)"
                                        defaultValue={UI.user.user_email}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>):void => {
                                            let newUser: iUserObject = UI.user;
                                            newUser.user_email = event.currentTarget.value;
                                            updateUI(Object.assign(new UIObject(newUser), UI, { inputChanged: true }))
                                        }}
                                    />
                                    <Form.Text className="text-muted">
                                        Must be a valid email address used once in the app
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group controlId="formBasicText">
                                    <Form.Label>SMS Number</Form.Label>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Prepend>
                                            <InputGroup.Checkbox
                                                defaultChecked={UI.user.user_sms_contact}
                                                onChange={(event: React.ChangeEvent<HTMLInputElement>):void => {
                                                    let newUser: iUserObject = UI.user;
                                                    newUser.user_sms_contact = event.currentTarget.checked;
                                                    updateUI(Object.assign(Object.assign(new UIObject(newUser), UI, { inputChanged: true })))
                                                }}
                                            />
                                        </InputGroup.Prepend>
                                        <Form.Control
                                            type="tel"
                                            placeholder="SMS Number"
                                            ref={inputRefs.user_sms}
                                            defaultValue={UI.user.user_sms}
                                            disabled={!UI.user.user_sms_contact}
                                            onChange={(event: React.ChangeEvent<HTMLInputElement>):void => {
                                                let newUser: iUserObject = UI.user;
                                                newUser.user_sms = event.currentTarget.value;
                                                updateUI(Object.assign(new UIObject(newUser), UI, { inputChanged: true }))
                                            }}
                                        />
                                    </InputGroup>
                                    <Form.Text className="text-muted">
                                        Select if you agree to receive SMS alerts from The Bowl Cup
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col >
                                {UI.user.user_id === 0
                                    ?
                                    <>
                                        <p style={{textAlign:'center'}}>
                                            A temporary password will be sent to your email address. You can change it later after you login.
                                        </p>
                                        <br />
                                    </>
                                    :
                                    <Form.Group controlId="formBasicPassword">
                                        <Form.Label>{UI.user.user_id === 0 ? 'Enter a password' : 'Change password'}</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="New password (at least 6 characters)"
                                            ref={inputRefs.user_password}
                                            onChange={(event: React.ChangeEvent<HTMLInputElement>):void => {
                                                let newUser: iUserObject = UI.user;
                                                newUser.user_password = event.currentTarget.value;
                                                updateUI(Object.assign(new UIObject(newUser), UI, { inputChanged: true }))
                                            }}
                                        />
                                        <Form.Text className="text-muted">
                                            {UI.user.user_id === 0 ? '' : 'Only change this if you want to update your password'}
                                        </Form.Text>
                                    </Form.Group>
                                }
                                <Form.Group>
                                    <Form.File
                                        id="exampleFormControlFile1"
                                        label="Upload a picture or logo to represent you"
                                        accept="image/*"
                                        onChange={(event:React.ChangeEvent<HTMLInputElement>):void => {
                                            let reader = new FileReader();
                                            if (event.currentTarget.files && event.currentTarget.files.length) {
                                                updateUI(Object.assign(new UIObject(UI.user), UI, { inputChanged: false }));
                                                let theFile = event.currentTarget.files[0];
                                                reader.readAsDataURL(theFile);
                                                reader.onload = function () {
                                                    let newPicture = {
                                                        file: theFile.name,
                                                        contents: reader.result,
                                                    }
                                                    let newUser: iUserObject = UI.user;
                                                    newUser.picture = newPicture;
                                                    updateUI(Object.assign(new UIObject(newUser), UI, { inputChanged: true }))
                                                }
                                            } else {
                                                let newUser: iUserObject = UI.user;
                                                newUser.picture = null;
                                                updateUI(Object.assign(new UIObject(newUser), UI, { inputChanged: true }));
                                            }
                                        }}
                                    />
                                </Form.Group>
                                {props.user.user_id === 0
                                    ?
                                    <div style={{textAlign:'center'}}>
                                        <br />
                                        <label>Choose or create a Bowl Cup Group</label>
                                        <Form.Group>
                                            <InputGroup>
                                                <InputGroup.Prepend>
                                                    <InputGroup.Radio
                                                        name="groupselect"
                                                        defaultChecked
                                                        onChange={(event: React.ChangeEvent<HTMLInputElement>):void => {
                                                            updateUI(Object.assign(new UIObject(UI.user), UI, { newGroup: !event.currentTarget.checked }))
                                                        }}
                                                    />
                                                </InputGroup.Prepend>
                                                <Form.Control
                                                    placeholder="Enter or Paste Group Password"
                                                    type="text"
                                                    disabled={UI.newGroup}
                                                    ref={inputRefs.group_password}
                                                    onChange={(event: React.ChangeEvent<HTMLInputElement>):void => {
                                                        let newGroup: iGroupObject | undefined = UI.group;
                                                        if (newGroup) {
                                                            newGroup.group_password = event.currentTarget.value;
                                                            newGroup.group_name = '';
                                                            updateUI(Object.assign(new UIObject(UI.user, newGroup), UI, { inputChanged: true }))
                                                        }
                                                    }}
                                                />
                                            </InputGroup>
                                            <Form.Text className="text-muted">
                                                If you have received an email or an SMS invitation with the Group Password, enter or paste it here
                                            </Form.Text>
                                            <br />
                                            <InputGroup>
                                                <InputGroup.Prepend>
                                                    <InputGroup.Radio
                                                        name="groupselect"
                                                        onChange={(event: React.ChangeEvent<HTMLInputElement>):void => {
                                                            updateUI(Object.assign(new UIObject(UI.user), UI, { newGroup: event.currentTarget.checked }))
                                                        }}
                                                    />
                                                </InputGroup.Prepend>
                                                <Form.Control
                                                    placeholder="New Group Name (at least 6 characters)"
                                                    disabled={!UI.newGroup}
                                                    onChange={(event: React.ChangeEvent<HTMLInputElement>):void => {
                                                        let newGroup: iGroupObject | undefined = UI.group;
                                                        if (newGroup) {
                                                            newGroup.group_name = event.currentTarget.value;
                                                            newGroup.group_password = '';
                                                            updateUI(Object.assign(Object.assign(new UIObject(UI.user, newGroup), UI, { inputChanged: true })))
                                                        }
                                                    }}
                                                />
                                                <Form.Text className="text-muted">
                                                    This is the name of your new group. You can change the name later if you change your mind. Default is 'My Group' if you decide to leave this blank.
                                                </Form.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </div>
                                    :
                                    null
                                }
                             </Col>
                        </Row>
                        <Row>
                            <Col>
                                <div style={{ textAlign: 'center', height:'2vh' }}>
                                    <b><label style={{ color: 'red' }}>{ UI.errorMessage}</label></b>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { props.showFunction(false) }}>
                        Close
                    </Button>
                    <Button variant={UI.inputChanged ? "primary" : "outline-primary"} type="submit" disabled={ !UI.inputChanged}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )

}