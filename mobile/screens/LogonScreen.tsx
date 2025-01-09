import React, {useState, useEffect, useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Input, CheckBox, Button, Image } from 'react-native-elements';
import {iRequestObject, iResponseObject, iGlobalStatusContext, iGroupObject} from '../meta/interfaces';
import { RequestObject, GroupObject, ResponseObject} from '../meta/constructors';
import {Endpoints} from '../constants/Constants';
import {hashPassword, goFetch, validateEmail} from '../functions/functions';
import {SecureStore, SecureStoreConstants} from '../components/SecureStore';
import { OverlayAlert, iOverlayProps, OverlayObject, OverlayTypes } from '../components/Overlays';
import { useAppContext } from '../components/AppContext';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { productionServer } from '../constants/Constants';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Image as CachedImage} from 'react-native-expo-image-cache';

export const LogonScreen:React.FunctionComponent<{}>=function({}):React.ReactElement{
  const [rememberMe, _rememberMe] = useState<boolean>(false);
  const [alertOverlay, _alertOverlay] = useState<iOverlayProps>(new OverlayObject(false));
  const [validCredentials, _validCredentials] = useState<boolean>(false);
  const [userEmail, _userEmail] = useState<string>('');
  const [userPassword, _userPassword] = useState<string>('');
  const globalProps:iGlobalStatusContext = useAppContext();
  const colorScheme = Colors[useColorScheme()];

  const closeOverlay:()=>void = function():void{
    _alertOverlay(new OverlayObject(false))
  }

  const attemptLogon:Function = function(autoLogon:boolean, u_name:string, u_password:string):void{
    const callback: Function = function (responseObject:iResponseObject): void {
      if (responseObject.success) {
        if(!autoLogon){
          if(rememberMe){
            SecureStore.setItemAsync(SecureStoreConstants.userEmailKey,u_name);
            SecureStore.setItemAsync(SecureStoreConstants.userPasswordKey, u_password);
            SecureStore.setItemAsync(SecureStoreConstants.userAutoLogon, SecureStoreConstants.userAutoLogon_True);
          }else{
            SecureStore.deleteItemAsync(SecureStoreConstants.userAutoLogon)
          }
        }
          globalProps._appData(responseObject);
      } else {
          _alertOverlay(new OverlayObject(true,OverlayTypes.alert,responseObject.error,closeOverlay));
      }
      
    }

    _alertOverlay(new OverlayObject(true, OverlayTypes.working, "Loading game data..."));
    let newRequest:iRequestObject = new RequestObject();
    newRequest.user.user_password = hashPassword(u_password);
    newRequest.user.user_email = u_name;
    goFetch(newRequest, Endpoints.logon, callback);
  }

  const resetPassword:Function = function():void{
    if(validateEmail(userEmail)){
      const callback: Function = function (responseObject:iResponseObject): void {
        if (responseObject.success) {
          _alertOverlay(new OverlayObject(true,OverlayTypes.info,'Temporary password sent to ' + userEmail + '\n\nPlease change it once logged in...', closeOverlay))
        } else {
          alert(responseObject.error)
        }
      }
  
      let newRequest:iRequestObject = new RequestObject();
      newRequest.user.user_email = userEmail;
      goFetch(newRequest, Endpoints.resetpassword, callback);
    }else{
      _alertOverlay(new OverlayObject(true,OverlayTypes.alert, userEmail +  'is not a valid amail address', closeOverlay))
    }
  }
  
  useEffect(()=>{
    _validCredentials(validateEmail(userEmail) && userPassword.length > 3)
  },[userEmail, userPassword])

  useEffect(()=>{
    if (globalProps.storeAvailable){
      let autoLogon:boolean = false;
      let userEmail_ks:string;
      let userPassword_ks:string;
      (async function():Promise<void> {
        try{
            userEmail_ks = await SecureStore.getItemAsync(SecureStoreConstants.userEmailKey)??''
            _userEmail(userEmail_ks)
            
            userPassword_ks = await SecureStore.getItemAsync(SecureStoreConstants.userPasswordKey)??''
            _userPassword(userPassword_ks)

            const userAutoLogon_ks:string|void|null = await SecureStore.getItemAsync(SecureStoreConstants.userAutoLogon)
            if(userAutoLogon_ks === SecureStoreConstants.userAutoLogon_True){autoLogon = true}
          }catch(e:unknown){
            console.log((e as Error).message)
        }
      })().then(()=>{
        if(autoLogon){
          attemptLogon(autoLogon,userEmail_ks, userPassword_ks)
        }
      });
    } 
    return function cleanup(){
      closeOverlay()
    }
  },[globalProps.storeAvailable])

  return(
      <View style={[Styles.container, {backgroundColor:colorScheme.background}]}>
          <KeyboardAwareScrollView 
              contentContainerStyle={[Styles.container]}
              resetScrollToCoords={{ x: 0, y: 0 }}
              viewIsInsideTabBar={true}
              keyboardDismissMode={'on-drag'}
            >
              <Text style = {[Styles.title,{color:colorScheme.label}]}>{'\nThe Bowl Cup Challenge'}</Text>
              <CachedImage 
                  style = {Styles.image}
                  {...{uri:productionServer + '/images/umd_logon.png'}}
              />
              <View style={{width:'100%'}} >
                  <Input 
                      placeholder='email@address.com'
                      leftIcon={{ type: 'font-awesome', name: 'envelope', color:colorScheme.label }}
                      inputStyle={[Styles.input, {color:colorScheme.text}]}
                      onChangeText={(e:string)=>{_userEmail(e)}}
                      defaultValue={userEmail}
                      autoCapitalize="none"
                  />
                  <Input 
                      placeholder='Password'
                      secureTextEntry={true}
                      leftIcon={{ type: 'font-awesome', name: 'lock', color:colorScheme.label }}
                      inputStyle={[Styles.input,{color:colorScheme.text}]}
                      onChangeText={(e:string)=>{_userPassword(e)}}
                      defaultValue={userPassword}
                      autoCapitalize="none"
                  />
          
                  <View style={Styles.subcontainer}>
                    <View style={{flex:.7}}>
                      <CheckBox
                          textStyle={[Styles.input, {color:colorScheme.text}]}  
                          title='Remember Me'
                          center  
                          checkedIcon='check'  
                          checkedColor='green'
                          containerStyle={{backgroundColor:'transparent', borderColor:'transparent'}}
                          checked={rememberMe}
                          onPress={()=>_rememberMe(!rememberMe)}
                          disabled = {globalProps.storeAvailable}
                      />
                    </View>
                    <View style={{flex:.3}}>
                      <Button
                        titleStyle={[Styles.input, {color:colorScheme.text}]}  
                        title={" Forgot"}  
                        type="clear"
                        icon = {<Icon      
                                  name="question-circle"      
                                  size={25}      
                                  color={colorScheme.label}
                                />}
                        onPress={()=>{resetPassword()}}
                      />
                    </View>
                  </View>
                  <Button
                    containerStyle={{borderColor:colorScheme.neutralBorder}}
                    titleStyle={{color:colorScheme.label}}
                    raised
                    title="Sign In"  
                    type="outline"
                    onPress={()=>attemptLogon(false, userEmail, userPassword)}
                    disabled={!validCredentials || alertOverlay.showOverLay}
                  />
                  <Text>{'\n'}</Text>
                  <Button
                    containerStyle={{borderColor:'tranparent'}}
                    titleStyle = {{color:colorScheme.label}}
                    title="Create an account"
                    type="clear"
                    onPress={()=>{alert(globalProps.storeAvailable)}}
                  />
              </View>
        </KeyboardAwareScrollView>
        <OverlayAlert {...alertOverlay}/>
      </View>
  )
}

const Styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      textAlignVertical:'center',
    },
    subcontainer:{
      flexDirection:'row',
      alignItems: 'center',
      justifyContent: 'center',
      textAlignVertical:'center',
    },
    title: {
      fontSize: 26,
      fontWeight: 'normal',
      paddingBottom:10
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: '80%',
    },
    image:{
      width:230,
      height:200,
      resizeMode:'contain'
    },
    input:{
      fontSize:20,
      fontWeight:'normal'
    }
})