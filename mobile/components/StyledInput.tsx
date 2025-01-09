
import React, {useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Input, CheckBox} from 'react-native-elements';
import {iUserObject, iGroupObject} from '../meta/interfaces';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { UserObject , GroupObject } from '../meta/constructors';

interface iStyledInput{
    label:string;
    inputObject:iUserObject|iGroupObject;
    propName:string;
    stateHook:Function;
}

const getDefaultValue:Function = function(inputObject:iUserObject|iGroupObject, propName:string):string{
    if((inputObject as iUserObject) instanceof UserObject  || (inputObject as iGroupObject) instanceof GroupObject){
        return inputObject[propName]
    }else{
        return ''
    }
}

export const StyledInput:React.FunctionComponent<iStyledInput>=function({...props}):React.ReactElement{
    const colorScheme = Colors[useColorScheme()];

    return (
        <Input 
            labelStyle={[Styles.input, {color:colorScheme.menuBackGround}]}
            inputStyle={[Styles.input, {color:colorScheme.text}]}
            label={props.label}
            autoCapitalize="none"
            defaultValue={getDefaultValue(props.inputObject, props.propName)}
            onChangeText={(input:string)=>{
                if(props.inputObject instanceof UserObject){
                    props.stateHook(
                        Object.assign(new UserObject(props.inputObject),{[props.propName]:input})
                    )
                }else if(props.inputObject instanceof GroupObject){
                    props.stateHook(
                        Object.assign(new GroupObject(props.inputObject),{[props.propName]:input})
                    )
                }
            }}
        />
    )
}

export const StyledCheckbox:React.FunctionComponent<iStyledInput> = function({...props}):React.ReactElement{
    const colorScheme = Colors[useColorScheme()];

    return (
        <CheckBox
            textStyle={[Styles.input, {color:colorScheme.menuBackGround}]}  
            title={props.label}
            center  
            checkedIcon='check'  
            checkedColor='green'
            containerStyle={{backgroundColor:'transparent', borderColor:'transparent'}}
            checked={getDefaultValue(props.inputObject, props.propName)}
            onPress={()=>{
                const checked:boolean = props.inputObject[props.propName]
                if(props.inputObject instanceof UserObject){
                    props.stateHook(
                        Object.assign(new UserObject(props.inputObject),{[props.propName]:!checked})
                    )
                }else if(props.inputObject instanceof GroupObject){
                    props.stateHook(
                        Object.assign(new GroupObject(props.inputObject),{[props.propName]:!checked})
                    )
                }
            }}
        />
    )
}


const Styles=StyleSheet.create({
    input:{
        fontSize:14,
        padding:6
    }

})