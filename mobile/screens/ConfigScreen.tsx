import React,{useState, useContext, useEffect} from 'react';
import { View, StyleSheet, Modal, Platform, ActivityIndicator} from 'react-native';
import { Text, Button, Icon, Image} from 'react-native-elements';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import {UserManager} from '../components/UserManager';
import {GroupManager} from '../components/GroupManager';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import {Image as CachedImage} from 'react-native-expo-image-cache';
import {productionServer} from '../constants/Constants';
import {useAppContext} from '../components/AppContext';
import {iGlobalStatusContext, iUserObject, iGroupObject} from '../meta/interfaces';
import {UserObject, GroupObject} from '../meta/constructors';
import * as ImagePicker from 'expo-image-picker'


interface iConfigScreen{
    isVisible:boolean;
    closeModal:Function;
}

export const ConfigScreen:React.FunctionComponent<iConfigScreen> =  function({...props}):React.ReactElement {
    const colorScheme=Colors[useColorScheme()];
    const Tab = createMaterialTopTabNavigator();
    const globalProps:iGlobalStatusContext = useAppContext();
    const [allowPictureRoll, _allowPictureRoll] = useState<boolean>(false);
    const [allowCamera, _allowCamera] = useState<boolean>(false);
    const [userObject, _userObject] = useState<iUserObject>(new UserObject(globalProps.appData?.user??null));

    const resetUser:Function = function():void{
        _userObject(new UserObject(globalProps.appData?.user))
    }

    const userUpdated:Function=function():boolean{
        return(
            userObject.user_name !== globalProps.appData?.user.user_name || 
            userObject.user_alias !== globalProps.appData?.user.user_alias || 
            userObject.user_password !== globalProps.appData?.user.user_password || 
            (userObject.picture?.file??'').length > 0
        )
    }

    const getPicture:Function= function():string|ArrayBuffer{
        if(userObject.picture && userObject.picture.contents){
            return 'data:image/jpg;base64,' + userObject.picture.contents;
        } else {
            if (userObject.user_id===0){
                return '/users/_generic.png';
            }else{
                return encodeURI(productionServer + '/users/' + userObject.user_picture_location)
            }
        }
    }  

    const pickImage:Function = async function():Promise<void>{
        let chosenImage:any = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowMultipleSelection:false,
            allowsEditing: true,
            quality: 1,
            base64:true,
          });

        if(!chosenImage.cancelled){
            _userObject(Object.assign(new UserObject(userObject),
                {
                    picture:{
                        file:chosenImage.uri.split('/').pop(),
                        contents:chosenImage.base64
                    }
                }
            ))
        }
    }

    const takePhoto:Function=async function():Promise<void>{
        let photo:any = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing:true,
            quality:1,
            base64:true,
        })

        if (!photo.cancelled){
            _userObject(Object.assign(new UserObject(userObject),
                {
                    picture:{
                        file:photo.uri.split('/').pop(),
                        contents:photo.base64
                    }
                }
            ))
        }
    }

    const getUserLine:Function = function():string{
        if (userObject.user_alias && userObject.user_alias.length>0){
            return userObject.user_name + ' (aka "' + userObject.user_alias + '")'
        }else{
            return userObject.user_name||''
        }
    }

    useEffect(()=>{
        (async()=>{
            if(Platform.OS !== 'web'){
                try{
                    let {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if(status === 'granted'){
                        _allowPictureRoll(true)
                    }

                    ({status} = await ImagePicker.requestCameraPermissionsAsync());
                    if(status === 'granted'){
                            _allowCamera(true)
                    }
                }catch(error){
                    console.log(error)
                }
            }
        })()
    },[])

    return (
        <Modal
                animationType='slide'
                transparent={true}
                visible={props.isVisible}
            >
            <View style={Styles.modal} >
                <View style={ [Styles.parent,{backgroundColor:colorScheme.background, borderColor:colorScheme.menuBackGround}]}>
                    <View style={{alignItems:'center', backgroundColor:colorScheme.userSelectBackground, borderRadius:6, padding:5}}>
                        <View style={{flexDirection:'row',paddingBottom:6, justifyContent:'center', alignItems:'center'}}>
                            <Icon
                                type="ionicon"
                                name="camera-outline"
                                color={colorScheme.background}
                                size={26}
                                onPress={()=>{if(allowCamera){takePhoto()}}}
                            />
                            <View style={{paddingLeft:20, paddingRight:20}}>
                                <Image
                                    source={{uri:getPicture()}}
                                    style={[Styles.image]}
                                    PlaceholderContent={
                                    <ActivityIndicator
                                        color={colorScheme.background}
                                        size='large'
                                        animating
                                    />
                                }
                                    placeholderStyle={{backgroundColor:colorScheme.userSelectBackground}}
                                />
                            </View>
                            <Icon
                                type="ionicon"
                                name="image-outline"
                                color={colorScheme.background}
                                size={26}
                                onPress={()=>{if(allowPictureRoll){pickImage()}}}
                            />
                        </View>
                        <Text style={{color:colorScheme.background}}>{getUserLine()}</Text>
                        <Text style={{color:colorScheme.background}}>{userObject.user_email}</Text>
                    </View>
                    <NavigationContainer>
                        <Tab.Navigator
                            initialRouteName="Games"
                            sceneContainerStyle={{overflow:'scroll'}}
                            screenOptions={{
                            tabBarStyle:{justifyContent:'center', borderColor:colorScheme.tabBorder},
                            tabBarLabelStyle:{ paddingTop:0, paddingBottom:0, fontWeight:'bold'},
                            tabBarInactiveTintColor:colorScheme.tabLabelDefault,
                            tabBarActiveTintColor:colorScheme.menuBackGround,
                            tabBarShowIcon:false,
                            tabBarIndicatorStyle:{backgroundColor:colorScheme.menuBackGround},
                            tabBarContentContainerStyle:{justifyContent:'center', marginTop:0, alignItems:'center'}
                            }}
                        >
                            <Tab.Screen name='Profile'>
                                {()=>
                                    <UserManager 
                                    user={userObject}
                                    updated={userUpdated()}
                                    userHook={_userObject} 
                                    resetHook={resetUser}
                                />}
                            </Tab.Screen>
                            <Tab.Screen
                                name='Groups'
                                component = {GroupManager}
                                options={({
                                    title:globalProps?.selectedGroup?.group_name,
                                })}
                            />
                        </Tab.Navigator>
                    </NavigationContainer>
                    
                    <Button
                    containerStyle={{borderColor:colorScheme.label}}
                    titleStyle = {{color:colorScheme.label, fontWeight:'bold'}}
                    title="Close"
                    type="clear"
                    onPress={()=>{props.closeModal()}}
                    />
                </View>
            </View>
        </Modal>
    )
}

const Styles = StyleSheet.create({
    modal:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor: '#00000080'
    },
    parent:{
        borderRadius:6,
        borderWidth:2,
        padding:6,
        height:'90%',
        width:'90%',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabTitle:{
        fontSize:14
    },
    image:{
        width:80,
        height:80,
        borderRadius:80/2,
    }, 
    cameraText:{
        fontSize:20,
        fontWeight:'bold',
    }
});
