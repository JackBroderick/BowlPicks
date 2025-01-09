import React, {useState, useEffect} from 'react';
import {StyleSheet, View, TouchableOpacity, Image} from 'react-native';
import {Header, Icon, Text, BottomSheet, ListItem} from 'react-native-elements';
import {useAppContext} from './AppContext';
import {iGroupObject, iGlobalStatusContext} from '../meta/interfaces';
import {SecureStore, SecureStoreConstants} from './SecureStore';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import {ConfigScreen} from '../screens/ConfigScreen';
import {productionServer} from '../constants/Constants';
import {Image as CachedImage} from 'react-native-expo-image-cache';

export const HeaderBar:React.FunctionComponent = function():React.ReactElement{
    const globalProps:iGlobalStatusContext = useAppContext();
    const colorScheme = Colors[useColorScheme()];

    const logOff:Function=function():void{
        const updateAutoLogon:Function = async function():Promise<void>{
            let storeAvailable = await SecureStore.isAvailableAsync()
            if(storeAvailable){
                console.log((globalProps.appData?.user.groups??[]).indexOf(globalProps.selectedGroup!).toString())
                SecureStore.setItemAsync(SecureStoreConstants.userAutoLogon,SecureStoreConstants.userAutoLogon_False)
                if ((globalProps.appData?.user.groups??[]).indexOf(globalProps?.selectedGroup!) < 0){
                    SecureStore.setItemAsync(SecureStoreConstants.defaultGroupIndex, '0')
                }else{
                    SecureStore.setItemAsync(SecureStoreConstants.defaultGroupIndex, 
                        (globalProps.appData?.user.groups??[]).indexOf(globalProps.selectedGroup!).toString())
                }
            }
        }
        updateAutoLogon().then(()=>{
            globalProps?._logonStatus(false)
        })
    }

    const GroupSelecter:React.FunctionComponent = function():React.ReactElement{
        const [pause, _pause] = useState<boolean>(false);
        const [showGroups, _showGroups]= useState<boolean>(false);

        useEffect(()=>{
            setTimeout(() => { 
                _pause(true)
            }, 1000)
        },[]);

        return(
            <>
                {pause
                    ?
                    <>
                        <TouchableOpacity onPress={()=>{_showGroups(!showGroups)}}>
                            <View style={[Styles.subcontainer, {backgroundColor:'transparent'}]}>
                                <View>
                                    <CachedImage
                                        style={{width:25, height:25, borderRadius:25/2}}
                                        {...{uri:encodeURI(productionServer + '/groups/' + globalProps?.selectedGroup?.group_picture_location)}}
                                    />
                                </View>
                                <View style={{paddingLeft:10, paddingRight:6}}>
                                    <Text style={{fontWeight:'bold', color:colorScheme.background}}>
                                        {globalProps?.selectedGroup?.group_name}
                                    </Text>
                                </View>
                                <View >
                                    <Icon
                                        name='chevron-up-outline'  
                                        type='ionicon'  
                                        color={colorScheme.background}
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                        <BottomSheet
                            isVisible={showGroups}
                            containerStyle={{backgroundColor:'#00000080'}}
                        >
                            {(globalProps?.appData?.user.groups??[]).map((group:iGroupObject, index:number) => 
                                (<ListItem 
                                    key={index} 
                                    containerStyle={{backgroundColor:colorScheme.menuBackGround}} 
                                    bottomDivider={true}
                                    onPress={()=>{
                                        if(globalProps.appData?.user.groups?.indexOf(globalProps.selectedGroup!) !== index){
                                            globalProps._selectedGroup((globalProps?.appData?.user?.groups??[])[index])
                                        }
                                        _showGroups(false)
                                    }}
                                >      
                                    <CachedImage
                                        style={{width:25, height:25, borderRadius:25/2}}
                                        {...{uri:encodeURI(productionServer + '/groups/' + group.group_picture_location??'')}}
                                    />
                                    <ListItem.Content>        
                                        <ListItem.Title style={{color:colorScheme.background}}>
                                            {group.group_name + ' (Players: ' + (group.users??[]).length + ')'}
                                        </ListItem.Title>      
                                    </ListItem.Content>    
                                    {group.group_id===globalProps.selectedGroup?.group_id
                                        ?
                                        <Icon
                                            name='checkmark-outline'  
                                            type='ionicon'  
                                            color={colorScheme.background}
                                        />
                                        :
                                        null
                                    }
                                </ListItem>  
                            ))}
                        </BottomSheet>
                    </>
                    :
                    null
                }
            </>
        )
    }

    const UtilityMenu:React.FunctionComponent = function():React.ReactElement{
        const [showConfig, _showConfig] = useState(false);
        return(
            <View style={{flexDirection:'row'}}>
                <ConfigScreen isVisible={showConfig} closeModal={()=>{_showConfig(false)}}/>
                <Icon
                    color = {colorScheme.menuLabel}
                    name = 'settings'
                    onPress={()=>{_showConfig(true)}}
                    containerStyle={{paddingRight:10}}
                />
                <Icon
                    type='font-awesome'
                    color = {colorScheme.menuLabel}
                    name = 'question-circle'
                    containerStyle={{paddingLeft:10}}
                />
            </View>
            
        )
    }
      
    return(
        <Header
            backgroundColor="darkred"
            placement="center"
            leftComponent={{ 
                type:'fontawesome',
                icon: 'reply', 
                color: colorScheme.menuLabel, 
                iconStyle: { color: colorScheme.menuLabel }, 
                onPress:()=>{logOff()}
            }}  
            centerComponent={<GroupSelecter/>}
            rightComponent={<UtilityMenu/>}
        />
    )
}

const Styles = StyleSheet.create(
    {
        text:{
            fontSize:20,
            fontWeight:"bold",
        },
        subcontainer:{
            flexDirection:'row',
            justifyContent:'center',
            alignItems:'center',
        }
        
    }
)