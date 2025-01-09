import React, { FunctionComponent, useState, useEffect, useRef, ReactHTMLElement} from 'react';
import { Styles, Sockets, Endpoints } from '../functions/constants';
import { Navbar, Nav, NavDropdown, Container, Row, Col, Tabs, Tab, Button, Dropdown, ButtonGroup } from 'react-bootstrap';
import { iComponentProps, iGameObject, iPicksObject, iUserObject, iGroupObject, iSocketObject, iRequestObject, iUpdateResponseObject, iLeaderBoardObject, iGameManagerObject} from '../functions/interfaces';
import { RequestObject, SmackObject, GroupObject, UserObject } from '../functions/constructors';
import { goFetch,  getGroupLeaderBoard } from '../functions/functions';
import { Smack } from './smack';
import { Picks } from './picks';
import { UserManager } from './usermanager';
import { GroupManager } from './groupmanager';
import { socketClient } from '../functions/socketclient';
import { ImageCircle, LeaderBoard } from './common';
import { GameManager } from './gamemanager';
//import io from 'socket.io-client';

import { select } from 'react-cookies';
const emoji = require('node-emoji');
const dateFormat = require('dateformat');

export const Main: FunctionComponent<iComponentProps> = function ({ ...props }): React.ReactElement {

    const tournamentStarted: boolean = props.dataObject.pending_games ? props.dataObject.pending_games.length === 0 : true;

    interface iUIObject {
        showUserManager: boolean;
        showSmackWindow: boolean;
        showGroupManager: boolean;
        tournamentStarted: boolean;
    }

    class UIObject implements iUIObject {
        constructor() {
            this.showUserManager = false;
            this.showSmackWindow = true;
            this.showGroupManager = false;
            this.tournamentStarted = tournamentStarted;
        }
        showUserManager: boolean;
        showSmackWindow: boolean;
        showGroupManager: boolean;
        tournamentStarted: boolean;
    }

    interface iSelectedUser {
        group: iGroupObject;
        user: iUserObject;
        picks: Array<iGameObject>;
    }

    class SelectionObject implements iSelectedUser {
        constructor(group: iGroupObject | null, user: iUserObject | null, picks:Array<iGameObject>|null = null) {
            this.group = group? group :new GroupObject();
            this.user = user ? new UserObject(user) : new UserObject();
            if (picks) {
                this.picks = picks;
            } else {
                if (user && user.picks && user.picks.length) {
                    this.picks = user.picks;
                } else {
                    this.picks = props.dataObject.pending_games ? props.dataObject.pending_games : [];
                    for (let i: number = 0; i < this.picks.length; i++) {
                        this.picks[i].pick_id = 0;
                        this.picks[i].pick_confidence = this.group.confidence_mode? i + 1 : 0;
                        this.picks[i].game_index = i;
                    }
                }
            }
        }
        group: iGroupObject;
        user: iUserObject;
        picks: Array<iGameObject>;
    }

    class GameManagerObject implements iGameManagerObject {
        constructor() {
            this.zoomScale = 1;
            this.viewMode = 'list';
            this.tournamentStarted = tournamentStarted;
            this.showCalendar = false;
            this.itsMe = props.dataObject.user.user_id === Selection.user.user_id;
        }
        zoomScale: number;
        viewMode: string;
        tournamentStarted: boolean;
        showCalendar: boolean;
        itsMe: boolean;
    }

    const getGroupUserbyID: Function = function (userID: number, selectedGroup: iGroupObject | undefined): iUserObject | null {
        if (selectedGroup?.users) {
            for (let i: number = 0; i < selectedGroup.users.length; i++) {
                if (selectedGroup.users[i].user_id === userID) { return selectedGroup.users[i] }
            }
            return null;
        } else {
            return null;
        }
    }

    const changeGroupSelection: Function = function (index: number): void {
        if (props.dataObject.user.groups) {
            updateSelection(new SelectionObject(props.dataObject.user.groups[index], getGroupUserbyID(props.dataObject.user.user_id, props.dataObject.user.groups[index])));
        };
    };

    let initialGroup: iGroupObject | null = props.dataObject.user?.groups?.length ? props.dataObject.user.groups[0] : null;

    const [Selection,updateSelection] = useState(new SelectionObject(initialGroup, getGroupUserbyID(props.dataObject.user.user_id, initialGroup)));

    //const [selectedGroup, updateselectedGroup] = useState(initialGroup);
    //const [selectedUser, updateselectedUser] = useState(getGroupUserbyID(props.dataObject.user.user_id, initialGroup));

    const [UI, updateUI] = useState(new UIObject());
    const [GameManagerUI, updateGameManagerUI] = useState(new GameManagerObject);
    
    const savePicks: Function = function (allGroups:boolean=false): void {

        const validatePickList: Function = function (): boolean {
            for (let i: number = 0; i < Selection.picks.length; i++) {
                if (Selection.picks[i].pick_id !== Selection.picks[i].home_team.team_id && Selection.picks[i].pick_id !== Selection.picks[i].visitor_team.team_id) { return false }
            }
            return true;
        }

        const constructPickList: Function = function (groupList:Array<number>): Array<iPicksObject> {
            let submitPickList: Array<iPicksObject> = [];

            for (let i: number = 0; i < groupList.length; i++) {
                for (let j: number = 0; j < Selection.picks.length; j++) {
                    if (Selection.picks[j].pick_id) {
                        submitPickList.push({
                            user_id: props.dataObject.user.user_id,
                            group_id: groupList[i],
                            game_id: Selection.picks[j].game_id,
                            pick_id: Selection.picks[j].pick_id,
                            pick_confidence: Selection.picks[j].pick_confidence ? Selection.picks[j].pick_confidence : 0,
                        })
                    }
                }
            }
            return submitPickList;
        }

        if (validatePickList()) {
            updateSelection(new SelectionObject(Selection.group, Selection.user, Selection.picks));
            let groupList: Array<number> = [];
            if (allGroups) {
                let userGroups: Array<iGroupObject> = props.dataObject.user.groups ? props.dataObject.user.groups : [];
                for (let i: number = 0; i < userGroups.length; i++) {
                    groupList.push(userGroups[i].group_id);
                }
            } else {
                groupList.push(Selection.group.group_id);
            }


        } else {
            alert('Your picks are incomplete. Please make sure you have picked a winner for each game.');
        }

    }
    

    useEffect(() => {
        socketClient.on(Sockets.handshake, (returnObject: iSocketObject) => {
            console.log(returnObject);
        });

        socketClient.on(Sockets.refresh, (returnObject: iSocketObject) => {
            console.log(returnObject);
            goFetch(new RequestObject(props.dataObject.user, props.dataObject.user.user_id), Endpoints.refresh, props.updateFunction);
        });

        return () => {
            socketClient.off(Sockets.handshake);
            socketClient.off(Sockets.refresh);
        }
    },[])

    return (
        <Container fluid>
            <UserManager show={UI.showUserManager} user={props.dataObject.user} showFunction={(show: boolean) => { updateUI(Object.assign(new UIObject(), UI, { showUserManager: show })) }} />
            <GroupManager show={UI.showGroupManager} user={ new UserObject(props.dataObject.user)} group={Selection.group} showFunction={(show: boolean) => {updateUI(Object.assign(new UIObject(), UI, { showGroupManager: show }))}} />
            <Navbar expand="md" fixed="top" sticky="top">
                <Navbar.Brand href="#home">
                    <ImageCircle pictureLocation={ '/users/' + props.dataObject.user.user_picture_location } dimensions={'40px'}/>
                    {props.dataObject.user?props.dataObject.user.user_alias:null}
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="justify-content-end">
                        <NavDropdown title={Selection.group.group_name} id="basic-nav-dropdown">
                            {
                                getGroupLeaderBoard(Selection.group).map((el: iLeaderBoardObject, index: number) => (
                                    <NavDropdown.Item style={{backgroundColor:Selection.user.user_id===el.user_id?'azure':'transparent'}} onSelect={() => { /*Switched User */ }}>
                                        <ImageCircle pictureLocation={'/users/' + el.user_picture_location} dimensions={'30px'}/>
                                        {el.user_alias + ' total: ' + el.total_points }
                                    </NavDropdown.Item>
                                ))
                            }
                            <NavDropdown.Divider />
                            {Selection.group.group_admin_id === props.dataObject.user.user_id
                                ?
                                <>
                                    <NavDropdown.Item onClick={() => { updateUI(Object.assign(new UIObject(), UI, { showGroupManager: true })) }}>
                                        <ImageCircle pictureLocation={'/groups/' + Selection.group.group_picture_location} dimensions={'30px'} />
                                        Edit Group Profile
                                    </NavDropdown.Item>
                                </>
                                :
                                null
                            }
                            <NavDropdown.Item href="#action/3.4"><div style={{textAlign:'center'}}>Join Group</div></NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.4"><div style={{textAlign:'center'}}>Create New Group</div></NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="My Profile" id="basic-nav-dropdown">
                            <NavDropdown.Item
                                onClick={() => { updateUI(Object.assign(new UIObject(), UI, { showUserManager: true })) }}>
                                <ImageCircle pictureLocation={'/users/' + props.dataObject.user.user_picture_location} dimensions={'30px'} />
                                Edit User Profile
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={(): void => {props.updateFunction()} }>
                                <div style={{textAlign:'center'}}>Logout</div>
                            </NavDropdown.Item>
                        </NavDropdown>
                        {props.dataObject.user.user_root
                            ?
                            <Nav.Link href="#">Tournament Management</Nav.Link>
                            :
                            null
                        }
                        
                </Nav>
                </Navbar.Collapse>
                <Nav>
                    <Nav.Link href="#" onClick={() => { updateUI(Object.assign(new UIObject, UI, { showSmackWindow: !UI.showSmackWindow })) }}>
                        {UI.showSmackWindow ? 'Close Leader Board' : 'Open Leader Board'}
                    </Nav.Link>
                </Nav>
            </Navbar>
            <Container fluid>
                <Row className="justify-content-md-center">
                    <Col xl={UI.showSmackWindow ? 10 : true} lg={UI.showSmackWindow ? 10 : true} md={UI.showSmackWindow ? 9 : true} sm={UI.showSmackWindow ? 9 : true} style={{padding:'5px'}}>
                        <Tabs onSelect={(key: string | null) => { if (key !== 'pendingGames') { changeGroupSelection(parseInt(key ? key : '0')) } }}>
                            {props.dataObject.user.groups?.map((el: iGroupObject, index: number) => (
                                <Tab
                                    eventKey={index.toString()}
                                    title={
                                        <span>
                                            <ImageCircle pictureLocation={'/groups/' + el.group_picture_location} dimensions='30px' />
                                            {el.group_name}
                                            <span style={{visibility:'hidden'}}>X</span>
                                            <ImageCircle pictureLocation={'/users/' + Selection.user.user_picture_location} dimensions='30px' />
                                            {Selection.user.user_alias + "'s picks"}
                                        </span>}
                                >
                                    <Container fluid>
                                        <Row >
                                            <Col xl={11} lg={11} md={11} sm={11}>
                                                <div style={{ height: '82vh', overflow:'auto'}}>
                                                    <GameManager
                                                        confidenceMode={Selection.group.confidence_mode}
                                                        UI={GameManagerUI}
                                                        games={Selection.picks}
                                                        updatePicks={(picks: Array<iGameObject>) => { updateSelection(new SelectionObject(Selection.group, Selection.user, picks)) } }
                                                    />
                                                </div>
                                            </Col>
                                            <Col >
                                                <div style={{ display: 'block', textAlign: 'center' }}>
                                                    <br />
                                                    <Button
                                                        variant="outline-primary"
                                                        block
                                                        size="sm"
                                                        onClick={() => { updateGameManagerUI(Object.assign(new GameManagerObject(), GameManagerUI, { zoomScale: GameManagerUI.zoomScale + .05 })) }}
                                                    >
                                                        Zoom in
                                                    </Button>
                                                    <Button
                                                        variant="outline-primary"
                                                        block
                                                        size="sm"
                                                        onClick={() => { updateGameManagerUI(Object.assign(new GameManagerObject(), GameManagerUI, { zoomScale: GameManagerUI.zoomScale - .05 })) }}
                                                    >
                                                        Zoom out
                                                    </Button>
                                                    <Button
                                                        variant="outline-primary"
                                                        block
                                                        size="sm"
                                                        onClick={() => { updateGameManagerUI(Object.assign(new GameManagerObject(), GameManagerUI, { showCalendar: !GameManagerUI.showCalendar })) }}
                                                    >
                                                        {GameManagerUI.showCalendar? 'Hide Calendar':'Calendar'}
                                                    </Button>
                                                    <br />
                                                    <Dropdown as={ButtonGroup} size="sm" style={{ width: '100%' }}>
                                                        <Button variant="outline-primary">View</Button>
                                                        <Dropdown.Toggle variant='outline-primary' split id="dropdown-split-basic" />
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item
                                                                href="#"
                                                                onClick={() => { updateGameManagerUI(Object.assign(new GameManagerObject(), GameManagerUI, { viewMode: 'list' })) }}
                                                            >List
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                href="#"
                                                                onClick={() => { updateGameManagerUI(Object.assign(new GameManagerObject(), GameManagerUI, { viewMode: 'card' })) }}
                                                            >Cards
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                    <br />
                                                    <br />
                                                    <br />
                                                    <Dropdown as={ButtonGroup} size="sm" style={{width:'100%'}}>
                                                        <Button variant="primary">SAVE</Button>
                                                        <Dropdown.Toggle split id="dropdown-split-basic" />
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item href="#/action-1">This group</Dropdown.Item>
                                                            <Dropdown.Item href="#/action-2">All groups</Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Container>

                                </Tab>
                            ))}
                        </Tabs>
                    </Col>
                    {UI.showSmackWindow
                        ?
                        <Col xl="2" lg="2" md="3" sm="3" style={{ padding: '5px' }}>
                            <div style={{ height: '87vh' }}>
                                <div style={{ display:'flex-grow', overflow: 'auto', height:'60%' }}>
                                    <LeaderBoard group={Selection.group} selectedUser={Selection.user} selectUserFunction={(user: iUserObject) => { updateSelection(new SelectionObject(Selection.group, user))}}/>
                                </div>
                                <div style={{ height: '1%' }}>
                                </div>
                                <div style={{ ...Styles.sContainerBorder, display: 'flex-grow', overflow: 'auto', height: '39%' }}>
                                    <Smack user={new UserObject(props.dataObject.user)} group={Selection.group} closeWindow={() => { updateUI(Object.assign(new UIObject, UI, { showSmackWindow: false })) }} />
                                </div>
                            </div>
                        </Col>
                    :
                    null
                }
                </Row>
            </Container>
        </Container>
  );
}

