import React, {useState, useContext} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {Button} from 'react-native-elements';
import {iUserObject} from '../meta/interfaces';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { UserObject } from '../meta/constructors';
import {StyledInput, StyledCheckbox} from '../components/StyledInput';
import {OverlayAlert, iOverlayProps, OverlayObject} from '../components/Overlays';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

interface iUserManager{
    user:iUserObject;
    updated:boolean;
    userHook:Function;
    resetHook:Function;
}


export const UserManager:React.FunctionComponent<iUserManager> = function({...props}):React.ReactElement{
    const colorScheme = Colors[useColorScheme()];
    const [alertOverlay, _alertOverlay] = useState<iOverlayProps>(new OverlayObject(false));
    return(
        <View style={[Styles.container, {flex:1}]} >
            <OverlayAlert {...alertOverlay}/>
            <View style={[Styles.container,{flex:1}]} >
                <KeyboardAwareScrollView 
                    contentContainerStyle={[Styles.container]}
                    resetScrollToCoords={{ x: 0, y: 0 }}
                    viewIsInsideTabBar={true}
                    keyboardDismissMode={'on-drag'}
                >
                    <StyledCheckbox
                        label={'Apply Picks to All Groups'} 
                        inputObject = {props.user}
                        stateHook={props.userHook} 
                        propName={'user_group_pick_all'}
                    />
                    <StyledInput 
                        label={'User Name'} 
                        inputObject = {props.user}
                        stateHook={props.userHook} 
                        propName={'user_name'}
                    />
                    <StyledInput 
                        label={'User Alias'} 
                        inputObject = {props.user}
                        stateHook={props.userHook} 
                        propName={'user_alias'}
                    />
                    <StyledInput 
                        label={'New Password (Change Only)'} 
                        inputObject = {props.user}
                        stateHook={props.userHook} 
                        propName={'user_password'}
                    />
                </KeyboardAwareScrollView>
                <View style={[Styles.subcontainer]}>
                    <Button
                        title='Reset'
                        type='outline'
                        disabled={!props.updated}
                        raised
                        containerStyle={{borderColor:colorScheme.menuBackGround}}
                        titleStyle={{color:colorScheme.menuBackGround}}
                        onPress={()=>{props.resetHook()}}
                    />
                    <View style={{padding:20}}/>
                    <Button
                        title='Save'
                        type='outline'
                        disabled={!props.updated}
                        raised
                        containerStyle={{borderColor:colorScheme.menuBackGround}}
                        titleStyle={{color:colorScheme.menuBackGround}}
                    />
                </View>
            </View>
        </View>
    )
}

const Styles=StyleSheet.create({
    container:{
        alignContent:'center',
        padding:6
    },
    subcontainer:{
        flexDirection:'row',
        alignContent:'center',
        justifyContent:'center'
    },
    input:{
        fontSize:14,
        padding:6
    },
})