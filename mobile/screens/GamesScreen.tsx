import React, {useContext, useEffect, useState, useRef} from 'react';
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import {RootTabScreenProps} from '../meta/types';
import {iUserObject, iGameObject, iGlobalStatusContext, iPickObject, iResponseObject, iGroupObject} from '../meta/interfaces';
import {GameList} from '../components/GameList';
import {useAppContext} from '../components/AppContext'
import Colors from '../constants/Colors'
import useColorScheme from '../hooks/useColorScheme';
import dateFormat from 'dateformat';
import {SliderBox} from 'react-native-image-slider-box';
import {productionServer, Endpoints} from '../constants/Constants';
import {OverlayAlert, OverlayObject, OverlayTypes, iOverlayProps} from '../components/Overlays';
import CalendarStrip from 'react-native-calendar-strip'
import {dayDifference, getLeaderBoardPlace, goFetch, getUserPoints} from '../functions/functions'
import { RequestObject,  UserObject, GroupObject } from '../meta/constructors';
import Layout from '../constants/Layout';

interface iGamesScreenProps{
    navigation:RootTabScreenProps<'Games'>;
}

interface iGroupPicks{
    group_id:number;
    picks:Array<iPickObject>;
}

export const GamesScreen:React.FunctionComponent<iGamesScreenProps> = function({...props}):React.ReactElement{
    const globalProps:iGlobalStatusContext = useAppContext();
    const colorScheme = Colors[useColorScheme()];
    const [gamePicks, _gamePicks] = useState<Array<iPickObject>>([]);
    const [selectedUser, _selectedUser] = useState<iUserObject|undefined>((globalProps?.selectedGroup?.users??[]).
        filter((user:iUserObject)=>(user.user_id===globalProps?.appData?.user.user_id))
        .pop());
    const [groupPicks, _groupPicks] = useState<Array<iGroupPicks>>(
        (globalProps?.appData?.user.groups??[]).map(
            (group:iGroupObject)=>(
                {group_id:group.group_id,
                picks: (group.users??[]).filter((user:iUserObject)=>(user.user_id===globalProps?.appData?.user.user_id))
                .pop()?.picks??[]
                }
        ))
    )
    const [selectedDate, _selectedDate] = useState<Date|undefined>();
    const [alertOverlay, _alertOverlay] = useState<iOverlayProps>(new OverlayObject(false));
    const tournamentDates:Array<Date>=(globalProps?.appData?.games??[]).map((game:iGameObject)=>(game.game_date)).filter((date):date is Date =>(date !==undefined))
    
    const pickFunction:Function = function(selectID:number, gameID:number, callback:Function=()=>{}):void{
        const selectedPicks:Array<iPickObject>=groupPicks.filter
            ((groupPick:iGroupPicks)=>(groupPick.group_id===globalProps?.selectedGroup?.group_id))
            .pop()?.picks??[]
        if(!selectedPicks.map((pick:iPickObject)=>(pick.pick_id)).includes(selectID)){
            let pickArray:Array<iPickObject>=selectedPicks.filter((pick:iPickObject)=>(pick.game_id !== gameID));
            const groupArray:Array<iGroupObject> = (()=>{
                if (globalProps?.appData.user.user_group_pick_all){
                    return globalProps.appData.user.groups??[]
                }else{
                    return [globalProps?.selectedGroup??new GroupObject()]
                }
            })();
            for(let i:number = 0; i < groupArray.length;i++){
                const pickObject:iPickObject = {
                    pick_id:selectID,
                    group_id:groupArray[i].group_id,
                    game_id:gameID,
                    user_id:globalProps?.appData.user.user_id||-1,
                };
                pickArray.push(pickObject);
                const newGroupPicks:Array<iGroupPicks>=groupPicks.filter((groupPick:iGroupPicks)=>(groupPick.group_id !==groupArray[i].group_id))
                newGroupPicks.push({
                    group_id:groupArray[i].group_id,
                    picks:pickArray,
                })
                _groupPicks(newGroupPicks);
                goFetch( 
                    new RequestObject(new UserObject(globalProps?.appData.user),globalProps?.appData.user.user_id, null,null,null,pickObject ),
                    Endpoints.makePick,
                    (response:iResponseObject)=>{
                        if(!response.success){
                            _alertOverlay(new OverlayObject(true, OverlayTypes.alert, 'Error making pick', ()=>{_alertOverlay(new OverlayObject(false))}))
                        }
                    }
                )
            }
        }
        callback()

/*

        if (!gamePicks.map((pick:iPickObject)=>(pick.pick_id)).includes(selectID)){
            let pickArray:Array<iPickObject>=gamePicks.filter((pick:iPickObject)=>(pick.pick_id !== unselectID));
            const groupArray:Array<iGroupObject> = (()=>{
                if (globalProps?.appData.user.user_group_pick_all){
                    return globalProps.appData.user.groups??[]
                }else{
                    return [globalProps?.selectedGroup??new GroupObject()]
                }
            })();
            for(let i:number = 0; i < groupArray.length;i++){
                const pickObject:iPickObject = {
                    pick_id:selectID,
                    group_id:groupArray[i].group_id,
                    game_id:gameID,
                    user_id:globalProps?.appData.user.user_id||-1,
                };
                if (groupArray[i].group_id === globalProps?.selectedGroup.group_id){
                    pickArray.push(pickObject);
                    _gamePicks(pickArray);
                }
                goFetch( 
                    new RequestObject(new UserObject(globalProps?.appData.user),globalProps?.appData.user.user_id, null,null,null,pickObject ),
                    Endpoints.makePick,
                    (response:iResponseObject)=>{
                        if(!response.success){
                            _alertOverlay(new OverlayObject(true, OverlayTypes.alert, 'Error making pick', ()=>{_alertOverlay(new OverlayObject(false))}))
                        }
                    }
                )
            }

        }
        */
    }
    
    const getMarkedDatesArray:Function = function():Array<{date:Date,dots:Array<{color:string, selectedColor?:string}>}>{
        let dupTournamentDates:Array<Date> = [...new Set(tournamentDates)];
        return (
            dupTournamentDates.map(
                (date:Date)=>(
                    {
                        date:date,
                        dots:tournamentDates.filter((thedate:Date)=>(
                            thedate === date
                        )).map((dot:Date)=>(
                            {
                                color:colorScheme.gameText,
                                //selectedColor:colorScheme.gameBackgound,
                            }
                        ))
                    }
                )
            )
        )
    }

    useEffect(()=>{
        if(selectedUser?.user_id===globalProps?.appData?.user.user_id){
            _gamePicks((groupPicks??[]).filter((groupPick:iGroupPicks)=>(groupPick.group_id===globalProps?.selectedGroup?.group_id))
            .pop()?.picks??[])
        }else{
            _gamePicks(selectedUser?.picks||[]);
        }
    },[selectedUser, groupPicks])
      
    useEffect(()=>{
        _selectedUser((globalProps?.selectedGroup?.users??[]).
        filter((user:iUserObject)=>(user.user_id===globalProps?.appData?.user.user_id))
        .pop())
    }, [globalProps?.selectedGroup])

    useEffect(()=>{
        if (tournamentDates.map((date:Date)=>(dateFormat(date,'mm-dd-yyyy'))).includes((dateFormat(new Date(), 'mm-dd-yyyy')))){
            _selectedDate(new Date())
        }
    },[])

    return(
            <View style={{flex:1, paddingTop:10, backgroundColor:colorScheme.userSelectBackground}}>
                <View style={[Styles.container, {backgroundColor:colorScheme.userSelectBackground, maxHeight:Layout.isSmallDevice?80:120}]}>
                    <Text 
                        style={{color:colorScheme.userSelectText, fontWeight:'bold', padding:3}}
                    >
                        {selectedUser?.user_name + ' ' + selectedUser?.points + ' points (' + getLeaderBoardPlace(selectedUser, globalProps?.selectedGroup).description + ')'} 
                    </Text>
                    <SliderBox 
                        sliderBoxHeight={Layout.isSmallDevice?80:120}
                        images = {(globalProps?.selectedGroup?.users??[]).map((user:iUserObject)=>(productionServer + '/users/' + user.user_picture_location))}
                        ImageComponentStyle={Styles.sliderimage}
                        dotColor={colorScheme.tabBackGround}
                        currentImageEmitter={(index:number)=>{_selectedUser((globalProps?.selectedGroup?.users??[])[index])}}
                        circleLoop
                        firstItem={globalProps?.selectedGroup?.users?.map((user:iUserObject)=>(user.user_id)).indexOf(globalProps?.appData?.user.user_id??0)}
                    />
                </View>
                <CalendarStrip
                        scrollable
                        style={[Styles.calendar,{borderColor:colorScheme.gameBorder, minHeight:Layout.isSmallDevice?50:120}]}
                        calendarColor={colorScheme.gameBackgound}
                        calendarHeaderStyle={{color: colorScheme.gameText, paddingBottom:5}}
                        dateNumberStyle={{color: colorScheme.gameText}}
                        dateNameStyle={{color: colorScheme.gameText}}
                        iconContainer={{flex: 0.1}}
                        startingDate={new Date()}
                        minDate={tournamentDates[0]}
                        maxDate={tournamentDates[tournamentDates.length-1]}
                        markedDates={getMarkedDatesArray()}
                        selectedDate={selectedDate}
                        onDateSelected={(date:moment.Moment)=>{
                            const newDate:Date = date.toDate();
                            if(dateFormat(newDate,'mm-dd-yyyy')===dateFormat(selectedDate,'mm-dd-yyyy')){
                                _selectedDate(undefined)
                            }else{
                                _selectedDate(newDate)
                            }
                        }}
                        onHeaderSelected={()=>{_selectedDate(undefined)}}
                        daySelectionAnimation={
                            {
                                type:'background',
                                duration:50,
                                highlightColor:colorScheme.gameBorder
                            }
                        }
                    />
                <ScrollView style={{borderRadius:3}}>
                    <GameList 
                        allowPicks={!globalProps?.tournamentStarted && (selectedUser?.user_id === globalProps?.appData?.user.user_id)}
                        gamePicks={gamePicks}
                        pickFunction={pickFunction}
                        dateRange={selectedDate}
                    />
                </ScrollView>
                <View style={[Styles.container]}>
                    {globalProps?.tournamentStarted
                    ?
                        <Text style={[Styles.bottomview, {color:colorScheme.userSelectText}]}>Tournament Has Started</Text>
                    :
                        <Text 
                            style={[Styles.bottomview, {color:colorScheme.userSelectText}]}
                            onPress={()=>{_selectedDate(undefined)}}
                        >
                            {'Picks Remaining:' + ((globalProps?.appData?.games||[]).length - gamePicks.length) + 
                            ' (' + dayDifference(tournamentDates[0],new Date()) + ' days left)' }
                        </Text>
                    }
                </View>
                <OverlayAlert {...alertOverlay}/>
            </View>
    )
}

const Styles=StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        textAlignVertical:'center',
        padding: 4,
        borderWidth:1,
        fontSize:14,
      },
      subcontainer:{
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'center',
        textAlignVertical:'center',
        paddingTop:2,
        paddingBottom:2
      },
      sliderimage:{
          height:Layout.isSmallDevice?55:85,
          width:Layout.isSmallDevice?55:85,
          borderRadius:Layout.isSmallDevice?55/2:85/2,
          padding:2
      },
      bottomview:{
          fontWeight:'bold',

      },
      calendar:{
          height:65,
          width:'100%',
          paddingTop:2,
          paddingBottom:5,
          borderWidth:1
      }
})