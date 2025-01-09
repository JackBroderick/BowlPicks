import React, {useState} from 'react';
import {View, StyleSheet, Text, ActivityIndicator} from 'react-native';
import {Overlay, Icon, Button} from 'react-native-elements';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';

interface iOverlayType{
    showSpinner:boolean;
    icon:string|null
}

export const OverlayTypes = {
    working:{
        showSpinner:true,
        icon:null,
    },
    alert:{
        showSpinner:false,
        icon:'exclamation-triangle'
    },
    info:{
        showSpinner:false,
        icon:'info-circle'
    }
}

export interface iOverlayProps{
    showOverLay:boolean;
    OverlayType?:iOverlayType
    OverlayMessage?:string;
    dismissFunction?:(()=>void);
}


export class OverlayObject implements iOverlayProps{
    constructor(showOverLay:boolean, OverlayType:iOverlayType = OverlayTypes.working, message:string = '', dismiss_fn:()=>void = ()=>{}){
      this.showOverLay=showOverLay;
      this.OverlayType=OverlayType;
      this.OverlayMessage = message;
      this.dismissFunction = dismiss_fn;
    }
    showOverLay:boolean;
    OverlayType:iOverlayType;
    OverlayMessage:string;
    dismissFunction:(()=>void)
}

export const OverlayAlert:React.FunctionComponent<iOverlayProps> = function({...props}):React.ReactElement{
    const colorScheme = Colors[useColorScheme()];
    return(
        <Overlay overlayStyle={[Styles.overlay, {borderColor:colorScheme.alertBorder}]} isVisible={props.showOverLay} onBackdropPress={props.dismissFunction?props.dismissFunction:()=>{}}>
            {props.OverlayType?.icon
                ?
                <Icon
                    name={props.OverlayType?.icon}
                    type='font-awesome'
                    color={colorScheme.label}
                    iconStyle={Styles.icon}
                />
                :
                null
            }
            <Text style={{color:colorScheme.label, fontWeight:'bold'}}>
                {props.OverlayMessage +'\n'}
            </Text>
            {props.OverlayType?.showSpinner
                ?
                <ActivityIndicator size='large' color={colorScheme.label} />
                :
                <Button
                    type='outline'
                    raised={true}
                    title='Dismiss'
                    onPress={()=>{props.dismissFunction?props.dismissFunction():()=>{}}}
                    buttonStyle={{borderColor:colorScheme.label }}
                    titleStyle={{color:colorScheme.label}}
                />
            }
        </Overlay>
    )
}

const Styles = StyleSheet.create(
        {
            overlay:{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                textAlignVertical:'center',
                minHeight:'5%',
                maxHeight:'30%',
                minWidth:'45%',
                maxWidth:'50%',
                borderWidth:1,
                borderRadius:8,
            },
            icon:{
                fontSize:30,
                fontWeight:'bold',
                paddingBottom:5,
            }
        }
    )
