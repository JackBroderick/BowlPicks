import React,{useState, useEffect} from 'react';
import { iResponseObject, iGlobalStatusContext, iGroupObject, iUserObject } from '../meta/interfaces';
import {SecureStore, SecureStoreConstants} from './SecureStore';
import dateFormat from 'dateformat';

const AppContext = React.createContext<Partial<iGlobalStatusContext>>({});

export const AppContextProvider:React.FunctionComponent = function({...props}):React.ReactElement{

    const [logonStatus, _logonStatus] = useState<boolean>(false);
    const [appData, _appData] = useState<iResponseObject>();
    const [selectedGroup, _selectedGroup] = useState<iGroupObject>();
    const [tournamentStarted, _tournamentStarted]= useState<boolean>();
    const [storeAvailable, _storeAvailable] = useState<boolean>(false);
    const [defaultGroup, _defaultGroup] = useState<number>(0);

    
    
    const globalParams:iGlobalStatusContext = {
        logonStatus:logonStatus,
        tournamentStarted:tournamentStarted,
        appData:appData,
        selectedGroup:selectedGroup,
        storeAvailable:storeAvailable,
        defaultGroup:defaultGroup,
        _storeAvailable:(status:boolean)=>{_storeAvailable(status)},
        _defaultGroup:(groupIndex:number)=>{_defaultGroup(groupIndex)},
        _logonStatus:(status:boolean)=>{_logonStatus(status)},
        _tournamentStarted:(started:boolean)=>{_tournamentStarted(started)},
        _appData:(newDataset:iResponseObject)=>{_appData(newDataset)},
        _selectedGroup:(newGroup:iGroupObject)=>{
            if(newGroup){
                let groupExt:iGroupObject = newGroup;
                for (let j:number=groupExt.users?.length??0;j--;){
                    const user:iUserObject|undefined = groupExt.users && groupExt?.users[j]?groupExt.users[j]:undefined
                    if (user){
                        user.points=(()=>{
                            let count:number = 0
                            for (let i:number = user.picks?.length??0;i--;){
                                count+= user.picks&&user.picks[i]?user.picks[i].points??0:0
                            }
                            return count
                        })()
                    }
                }
                groupExt.users?.sort((a:iUserObject, b:iUserObject)=>((a.points??0) - (b.points??0)));
                _selectedGroup(groupExt);
            }
        },
    }  

    useEffect(()=>{
        if(appData?.user.groups && appData.user.groups.length){
            if (!selectedGroup){
                globalParams._selectedGroup(appData.user.groups[globalParams.defaultGroup])
            }else{
                globalParams._selectedGroup(appData.user.groups.map((group:iGroupObject)=>(group.group_id)).indexOf(selectedGroup.group_id))
            }
          }
          _tournamentStarted(
            dateFormat(new Date(), 'yyyy-mm-dd') < dateFormat(appData?.games?.shift()?.game_date??new Date(),'yyyy-mm-dd')?false:true
          );
          _logonStatus(appData?.isAuthenticated??false)
    },[appData])

    useEffect(()=>{
        (async()=>{
            const store:boolean = await SecureStore.isAvailableAsync()??false
            _storeAvailable(store);
            if (store){
                const returnString:string = await SecureStore.getItemAsync(SecureStoreConstants.defaultGroupIndex)??'0'
                if (parseInt(returnString) < 0 ){
                    _defaultGroup(0)
                }else{
                    _defaultGroup(parseInt(returnString));
                }
            }
        })();
    },[])

    return(
        <AppContext.Provider value={globalParams}>
            {props.children}
        </AppContext.Provider>
    )
}

export const useAppContext:Function = function():Partial<iGlobalStatusContext>{
    return React.useContext(AppContext);
}