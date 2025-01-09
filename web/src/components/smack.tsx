import React, { FunctionComponent, useState, useEffect } from 'react';
import { iGroupObject, iUserObject, iSmackObject, iUpdateResponseObject, iRequestObject, iSocketObject } from '../functions/interfaces';
import { SmackObject, RequestObject } from '../functions/constructors';
import { Endpoints, Sockets } from '../functions/constants';
import { goFetch } from '../functions/functions';
import { socketClient } from '../functions/socketclient';
import { GiftedChat, IMessage } from 'react-native-gifted-chat'
import { View } from 'react-native';
import { Card } from 'react-bootstrap';
import {PopImage} from './common'

interface iSmackProps {
    user: iUserObject;
    group: iGroupObject | null;
    closeWindow: Function;
}

export const Smack: FunctionComponent<iSmackProps> = function ({ ...props }): React.ReactElement {

    let initsmack: Array<IMessage> = [];
    const [smack, updatesmack] = useState(initsmack);
    const [popImage, updatepopImage] = useState(false);

    const newSmack: Function = function (smack: Array<IMessage> = []): void {
        console.log("Smack.smakc");
        if (props.group) {
            for (let i: number = 0; i <smack.length ; i++) {
                let request = new RequestObject(props.user, props.group.group_id, new SmackObject(props.user, smack[i].text));
                goFetch(request, Endpoints.newsmack, (responseObject: iUpdateResponseObject) => { console.log("Smack", responseObject) });
            }
        }
    }

    useEffect(() => {
        const getGroupSmack: Function = function (): void {
            if (props.group) {
                const callback: Function = function (responseObject: iUpdateResponseObject) {
                    if (responseObject.success) {
                        if (responseObject.smack) {
                            let smackArray: Array<IMessage> = [];
                            for (let i: number = 0; i < responseObject.smack.length; i++) {
                                let smackObject: IMessage = {
                                    _id: i,
                                    text: responseObject.smack[i].smack,
                                    createdAt: responseObject.smack[i].smack_time,
                                    user: {
                                        _id: responseObject.smack[i].user_id,
                                        name: responseObject.smack[i].user_alias,
                                        avatar: '/users/' + responseObject.smack[i].user_picture_location,
                                    },
                                }
                                smackArray.push(smackObject)
                            }
                            updatesmack(smackArray);
                        };
                    } else {
                        console.log(responseObject.error);
                    }
                }
                let request: iRequestObject = new RequestObject(props.user, props.group.group_id);
                goFetch(request, Endpoints.getsmack, callback);
            }
        }

        socketClient.on(Sockets.smack, (returnObject: iSocketObject) => {
            if (props.group && returnObject.object_id === props.group.group_id) {
                console.log("Smack Update", returnObject);
                getGroupSmack();
            }
        });
        getGroupSmack();
        return () => {
            socketClient.off(Sockets.smack);
        }
    }, [props.group])

    return (
        <View style={{ width: '100%', height: '100%' }}>
            <PopImage show={popImage} picture={'/users/' + props.user.user_picture_location} showFunction={(show: boolean) => { updatepopImage(show) }} />
                <GiftedChat
                    messages={smack}
                    onSend={(smack: Array<IMessage>) => { newSmack(smack) }}
                    inverted={false}
                isTyping={true}
                showUserAvatar={true}
                showAvatarForEveryMessage={true}
                onPressAvatar={() => { updatepopImage(true)}}
                placeholder={'Speak your smack...'}
                alwaysShowSend={false}
                user={{
                    _id: props.user.user_id,
                    name: props.user.user_alias ? props.user.user_alias : props.user.user_name,
                    avatar: '/users/' + props.user.user_picture_location,
                }}
                />
            </View>
    )
}