import React, { useState } from 'react';
import { Image, Card, Container, Row, Col, Modal } from 'react-bootstrap';
import { Dimensions } from 'react-native';
import { iGroupObject, iUserObject } from '../functions/interfaces'; 
import { getGroupLeaderBoard } from '../functions/functions';
import { iLeaderBoardObject } from '../functions/interfaces'

interface iPopImage {
    show: boolean;
    picture: string;
    showFunction: Function;
}

export const PopImage: React.FunctionComponent<iPopImage> = function ({ ...props }): React.ReactElement {
    return (
        <Modal
            size="sm"
            centered
            show={props.show}
            onHide={() => { props.showFunction(false) }}
            style={{background:'transparent'}}
        >
            <Image src={props.picture}/>
        </Modal>
    )
}

interface iImageCircle {
    pictureLocation: string;
    dimensions: string;
    title?: string;
    onClickFunction?: Function;
    borderSelect?: boolean;
}

export const ImageCircle: React.FunctionComponent<iImageCircle> = function ({ ...props }): React.ReactElement {
    let clickFunction: Function = props.onClickFunction ? props.onClickFunction : () => { updatepopImage(!popImage)};
    const [popImage, updatepopImage] = useState(false);

    return (
        <>
            <PopImage show={popImage} picture={props.pictureLocation} showFunction={(show: boolean) => { updatepopImage(show) }}/>
            <Image
                roundedCircle={!props.borderSelect}
                rounded={props.borderSelect}
                title={props.title?props.title:''}
                className="d-inline-block align-middle mr-sm-2"
                height={props.dimensions}
                width={props.dimensions}
                src={props.pictureLocation}
                style={{ cursor: "pointer", border: props.borderSelect?'2px solid Green':''}}
                onClick={() => { clickFunction() }}
                />
        </>

    )
}

interface iLeaderBoard {
    group: iGroupObject | null;
    selectedUser: iUserObject | null;
    selectUserFunction?: Function;
}

export const LeaderBoard: React.FunctionComponent<iLeaderBoard> = function ({ ...props }): React.ReactElement {
    let selectFunction: Function = props.selectUserFunction ? props.selectUserFunction : () => { }
    let selectedUserID: number = props.selectedUser ? props.selectedUser.user_id : 0;

    const getUserByID: Function = function (userID: number): iUserObject|null {
        if (props?.group?.users) {
            for (let i: number = 0; i < props.group.users.length; i++) {
                if (props.group.users[i].user_id === userID) {return props.group.users[i]}
            }
        }
        return null;
    }

    return (
        <Card style={{height:'100%'}}>
            <Card.Body>
                <p style={{ textAlign: 'center' }}> {props.group?.group_name + ' Leader Board'} </p>
                <Container>
                    {getGroupLeaderBoard(props.group).map((el: iLeaderBoardObject, index: number) => (
                        <Row style={{ cursor: 'pointer', backgroundColor: el.user_id === selectedUserID ? 'Azure' : 'transparent' }} onClick={() => selectFunction(getUserByID(el.user_id))}>
                            <Col xl={2} lg={2} md={2} sm={2} xs={2}>
                                <ImageCircle dimensions='30px' pictureLocation={'/users/' + el.user_picture_location}/>
                            </Col>
                            <Col style={{ textAlign: 'left' }}>
                                <label>{el.user_alias}</label>
                            </Col>
                            <Col style={{ textAlign: 'right' }}>
                                <label> {'total: ' + el.total_points}</label>
                            </Col>
                        </Row>
                    ))}
                </Container>
            </Card.Body>
        </Card>
    )
}