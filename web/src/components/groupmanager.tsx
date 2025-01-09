import React, { useState, useRef, useEffect } from 'react';
import { iGroupObject, iUserObject, iRequestObject, iUpdateResponseObject } from '../functions/interfaces';
import { GroupObject, RequestObject, UserObject } from '../functions/constructors';
import { Modal, Form, Image, Container, Row, Col, Button } from 'react-bootstrap';
import { ImageCircle } from './common';
import { goFetch } from '../functions/functions';
import { Endpoints } from '../functions/constants';
const emoji = require('node-emoji');


interface iGroupManagerProps {
    user: iUserObject;
    group: iGroupObject | null;
    show: boolean;
    showFunction: Function;
}

export const GroupManager: React.FunctionComponent<iGroupManagerProps> = function ({ ...props }): React.ReactElement {
    interface iUIObject {
        group: iGroupObject;
        inviteString: string;
        inputChanged: boolean;
        errorMessage: string;
        showInviteUsers: boolean;
    }

    class UIObject implements iUIObject {
        constructor(group: iGroupObject) {
            this.group = group;
            this.inviteString = '';
            this.inputChanged = false;
            this.errorMessage = '';
            this.showInviteUsers = false;
        }
        group: iGroupObject;
        inviteString: string;
        inputChanged: boolean;
        errorMessage: string;
        showInviteUsers: boolean;
    }
    const inputRefs = {
        group_name: useRef<HTMLInputElement>(null),
        invite_list: useRef<HTMLTextAreaElement>(null),
    }

    const [UI, updateUI] = useState(new UIObject(props.group?props.group:new GroupObject()));

    const validateInviteList: Function = function (): Array<string> {
        const emailReg: RegExp = /\S+@\S+\.\S+/;

        
        let inviteList: Array<string> = [];
        if (UI.inviteString.includes(';')) {
            inviteList = UI.inviteString.split(';');
        } else {
            inviteList.push(UI.inviteString);
        }
        
        console.log('Invite list', inviteList);
        let failList: string = '';
        let validate: Array<string> = [];
        for (let i: number = 0; i < inviteList.length; i++) {
            if (!emailReg.test(inviteList[i])) {
                failList = failList + (failList.length ? ';' : '') + inviteList[i];
            } else {
                validate.push(inviteList[i]);
            }
        }
        console.log('failList', failList);
        if (failList.length) {
            if (inputRefs.invite_list.current) { inputRefs.invite_list.current.value = failList } 
            let newUI: UIObject = new UIObject(UI.group);
            const errorMessage:string = 'One or more of the emails were invalid. Please check and try again.';
            updateUI(Object.assign(newUI, UI, {errorMessage:errorMessage}));
        }
        return validate;
    }

    const updateGroup: Function = function (callback: Function): void {
        if (UI.group.group_id === 0) {
            let requestObject: iRequestObject = new RequestObject(props.user, props.user.user_id, null, null, UI.group);
            goFetch(requestObject, Endpoints.newgroup, (responseObject: iUpdateResponseObject) => {
                if (responseObject.success) {
                    if (responseObject.return_id) {
                        let newGroup: iGroupObject = new GroupObject(UI.group);
                        newGroup.group_id = responseObject.return_id;
                        updateUI(Object.assign(new UIObject(newGroup), UI, { inputChanged: false }));
                        callback(responseObject.return_id);
                    };
                } else {
                    let newUI: UIObject = new UIObject(UI.group);
                    newUI.errorMessage = responseObject.error;
                    updateUI(Object.assign(UI, newUI));
                }
            })
        } else {
            let requestObject: iRequestObject = new RequestObject(props.user, UI.group.group_id, null, null, UI.group);
            goFetch(requestObject, Endpoints.updategroup, (responseObject: iUpdateResponseObject) => {
                if (responseObject.success) {
                    callback();
                } else {
                    let newUI: UIObject = new UIObject(UI.group);
                    newUI.errorMessage = responseObject.error;
                    updateUI(Object.assign(UI, newUI));
                }
            })
        }
    }

    const inviteParticipants: Function = function (): void {
        const sendInvites: Function = function (groupID: number = -1): void {
            let inviteList: Array<string> = validateInviteList();
            if (inviteList.length) {
                let requestObject = new RequestObject(props.user, groupID, null, new UserObject(props.user), null, inviteList);
                goFetch(requestObject, Endpoints.invitegroupusers, (responseObject: iUpdateResponseObject) => {
                    if (responseObject.success) {
                        alert('Invites successfully sent');
                    } else {
                        let newUI: UIObject = new UIObject(UI.group);
                        newUI.errorMessage = responseObject.error;
                        updateUI(Object.assign(UI, newUI));
                    }
                })
            }

        }

        if (UI.group.group_id === 0) {
            updateGroup(sendInvites);
        } else {
            sendInvites(UI.group.group_id);
        }
    }

    const submitGroupInput: Function = function (event: React.FormEvent): void {
        event.preventDefault();
        updateGroup((newGroupID: number = -1) => {
            props.showFunction(false);
        })
    }

    const resolvePicture: Function = function (): string {
        if (UI.group.picture && typeof (UI.group.picture.contents) === 'string' && UI.group.picture.contents.length) {
            return UI.group.picture.contents;
        } else {
            if (UI.group.group_id === 0) {
                return '/groups/_generic.png';
            } else {
                return '/groups/' + UI.group.group_picture_location;
            }
        }
    }

    return (
        <Modal
            size="lg"
            centered
            show={props.show}
            backdrop="static"
            keyboard={false}
            onHide={() => { props.showFunction(false) }}
        >
            <Form onSubmit={(event: React.FormEvent): void => { submitGroupInput(event) }}>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        <ImageCircle pictureLocation={resolvePicture()} dimensions={'60px'}/>
                        {UI.group.group_id ? 'Manage Group Profile: ' + UI.group.group_name : 'New User Profile: ' + UI.group.group_name}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="show-grid">
                    <Container>
                        <Row>
                            <Col xs={12} md={10} lg={8} xl={6}>
                                <Form.Group controlId="formBasicText">
                                    <Form.Label>Group Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter group name (required)"
                                        ref={inputRefs.group_name}
                                        defaultValue={UI.group.group_name}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
                                            let newGroup: iGroupObject = UI.group;
                                            newGroup.group_name = event.currentTarget.value;
                                            updateUI(Object.assign(new UIObject(newGroup), UI, { inputChanged: true }))
                                        }}
                                    />
                                    <p style={{textAlign:'center'}}>
                                        <Form.Text className="text-muted">
                                            This is the name that this group will go by. It needs to be at least 6 characters or it will default to 'My Group'.
                                        </Form.Text>
                                    </p>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>
                                        <label>Group Password:</label><span hidden={false}>{'  '}</span><label><b>{UI.group.group_password}</b></label>
                                    </Form.Label>
                                    <p style={{ textAlign: 'center' }}>
                                        <Form.Text className="text-muted">
                                            You can send this password to people that you want to participate in this group by either pasting it into an email or using the invite features of the app.
                                        </Form.Text>
                                    </p>
                                    <label>Group Season:</label><span hidden={false}>{'  '}</span><label><b>{UI.group.group_season}</b></label>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Check
                                        label="Confidence Mode"
                                        defaultChecked={UI.group.confidence_mode}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                            let newGroup: iGroupObject = new GroupObject(UI.group);
                                            newGroup.confidence_mode = event.currentTarget.checked;
                                            updateUI(Object.assign(new UIObject(newGroup), UI, {inputChanged:true}))
                                        }}
                                    >
                                    </Form.Check>
                                    <p style={{ textAlign: 'center' }}>
                                        <Form.Text className="text-muted">
                                            In Confidence Mode, each user must rank their picks in order of level of confidence. This cannot be changed after the tournament starts.
                                        </Form.Text>
                                    </p>
                                </Form.Group>
                                <br />
                                <Form.Group>
                                    <Form.File
                                        id="exampleFormControlFile1"
                                        label="Upload a picture or logo to represent this group"
                                        accept="image/*"
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
                                            let reader = new FileReader();
                                            if (event.currentTarget.files && event.currentTarget.files.length) {
                                                updateUI(Object.assign(new UIObject(UI.group), UI, { inputChanged: false }));
                                                let theFile = event.currentTarget.files[0];
                                                reader.readAsDataURL(theFile);
                                                reader.onload = function () {
                                                    let newPicture = {
                                                        file: theFile.name,
                                                        contents: reader.result,
                                                    }
                                                    let newGroup: iGroupObject = new GroupObject(UI.group);
                                                    newGroup.picture = newPicture;
                                                    updateUI(Object.assign(new UIObject(newGroup), UI, { inputChanged: true }))
                                                }
                                            } else {
                                                let newGroup: iGroupObject = new GroupObject(UI.group);
                                                newGroup.picture = null;
                                                updateUI(Object.assign(new UIObject(newGroup), UI, { inputChanged: true }));
                                            }
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col >
                                <div style={{ height: '90%' }}>
                                    <Form.Group>
                                        {UI.showInviteUsers
                                            ?
                                            <>
                                                <Form.Label>{'Invite new partipants'}</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={13}
                                                    style={{ resize: 'none' }}
                                                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                                                        let newUI: iUIObject = UI;
                                                        newUI.inviteString = event.currentTarget.value;
                                                        updateUI(Object.assign(UI, newUI));
                                                    }}
                                                >
                                                </Form.Control>
                                                <p style={{textAlign:'center'}}>
                                                    <Form.Text className="text-muted">
                                                        Enter the emails of the participants that you would like to invite. Seperate multiple emails by a semicolon (';').
                                                    </Form.Text>
                                                </p>
                                            </>
                                            :
                                            <div style={{ height: '90%' }}>
                                                <p>{'Participents'} </p>
                                                {
                                                    props.group?.users
                                                        ?
                                                        <div style={{ height: '100%' }}>
                                                            <div style={{overflow:'auto'}}>
                                                                <Container>
                                                                    {props.group.users.map((el: iUserObject, index: number) => (
                                                                        <Row>
                                                                            <Col xl={2} lg={2} md={2} sm={2} xs={2}>
                                                                                <ImageCircle pictureLocation={'/users/' + el.user_picture_location} dimensions={'30px'}/>
                                                                            </Col>
                                                                            <Col style={{ textAlign: 'left' }}>
                                                                                <label>{el.user_name}</label>
                                                                            </Col>
                                                                            <Col style={{ textAlign: 'right' }}>
                                                                                <label hidden={props.user.user_id === UI.group.group_admin_id} style={{ cursor: 'pointer' }} title={'Remove ' + el.user_name + ' from ' + UI.group.group_name}>
                                                                                    {emoji.emojify(':x:')}
                                                                                </label>
                                                                            </Col>
                                                                        </Row>
                                                                    ))}
                                                                </Container>
                                                            </div>
                                                            <div>
                                                                <p style={{textAlign:'center'}}>
                                                                    <Form.Text className="text-muted">
                                                                        Removing a participant from a group will not remove their picks. If you decide to invite them back later, the picks that they made will still be there.
                                                                    </Form.Text>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        :
                                                        null
                                                }
                                            </div>
                                        }
                                    </Form.Group>
                                </div>
                                <Container>
                                    <Row>
                                        <Col style={{textAlign:'right'}}>
                                            {UI.showInviteUsers
                                                ?
                                                <Button
                                                    size="sm"
                                                    variant="outline-warning"
                                                    onClick={() => {
                                                        updateUI(Object.assign(new UIObject(UI.group), UI, { showInviteUsers: !UI.showInviteUsers }))
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                :
                                                null
                                            }
                                        </Col>
                                        <Col style={{ textAlign: 'left' }}>
                                            <Button
                                                size="sm"
                                                variant="outline-info"
                                                onClick={() => {
                                                    if (UI.showInviteUsers) {
                                                        inviteParticipants();
                                                    } else {
                                                        updateUI(Object.assign(new UIObject(UI.group), UI, { showInviteUsers: !UI.showInviteUsers }))
                                                    }
                                                }}
                                            >
                                                {UI.showInviteUsers ? 'Send Invites' : 'Invite participants'}
                                            </Button>
                                        </Col>
                                    </Row>
                                </Container>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <div style={{ textAlign: 'center', height: '2vh' }}>
                                    <b><label style={{ color: 'red' }}>{UI.errorMessage}</label></b>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { props.showFunction(false) }}>
                        Close
                    </Button>
                    <Button variant={UI.inputChanged ? "primary" : "outline-primary"} type="submit" disabled={!UI.inputChanged}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Form>


        </Modal>

    )
}