import React, { useEffect, useState, useContext, StyleHTMLAttributes } from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Linking, Image, ViewStyle, StyleSheetProperties} from 'react-native';
import {Icon, Avatar} from 'react-native-elements';
import {iGameObject, iTeamObject, iPickObject, iGlobalStatusContext} from '../meta/interfaces';
import {useAppContext} from '../components/AppContext';
import {OverlayAlert, OverlayObject, OverlayTypes, iOverlayProps} from '../components/Overlays';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import {WebResources} from '../constants/Constants';
import dateFormat from 'dateformat';
import {Image as CachedImage} from 'react-native-expo-image-cache';

//WebResources.cfbSR_bowl + props.game.bowl.replace(/ /g, "-").toLowerCase() + ".html"

interface iGameProps{
    game:iGameObject;
    teamPick:iPickObject|null;
    allowPicks:boolean;
    pickFunction:Function;
}

const gamePlaying:Function=function(status:string|undefined):boolean{
    if(status && !['pending', 'canceled'].includes(status.toLowerCase())){
        return true
    }else{
        return false
    }
}

export const Game:React.FunctionComponent<iGameProps> = function({...props}){
    const colorScheme = Colors[useColorScheme()];
    const globalProps:iGlobalStatusContext = useAppContext();
    const [pickID, _pickID] = useState<number|undefined>(undefined)
    const [alertOverlay, _alertOverlay] = useState<iOverlayProps>(new OverlayObject(false));

    const spreadString:Function = function(spread:number|undefined, homeTeam:boolean):string{
        if (spread && spread !== 0){
            if(homeTeam){
                if(spread>0){
                    return ' (-' + spread.toString() + ')'
                }else{
                    return ' (+' + spread.toString() + ')'
                }
            }else{
                if(spread>0){
                    return ' (+' + spread.toString() + ')'
                }else{
                    return ' (-' + spread.toString() + ')'
                } 
            }
        }else{
            return ''
        }
    }

    const truncateTeamName:Function = function(teamString:string):string{
        const maxLength:number = 21;
        if(teamString.length>maxLength){
            return teamString.substring(0,maxLength);
        }else{
            return teamString;
        }
    }

    interface iTeamViewProps{
            team:iTeamObject;
            flex:number;
            opposingScore:number|undefined;
            spread:string;
            gameStatus:string;
            allowPick:boolean;
    }

    const TeamView:React.FunctionComponent<iTeamViewProps>=function({...props}){
        const [scoreColor, _scoreColor] = useState({score:colorScheme.gameScoreTie, team:colorScheme.gameText});
        
        useEffect(()=>{
            if(props.opposingScore && props.team.score){
                if (props.team.score > props.opposingScore){
                    _scoreColor({score:colorScheme.gameScoreWinning, team:colorScheme.gameTeamWinning})
                }else if(props.team.score < props.opposingScore){
                    _scoreColor({score:colorScheme.gameScoreLosing, team:colorScheme.gameText})
                }
            }else{
                _scoreColor({score:colorScheme.gameText, team:colorScheme.gameText})
            }
        },[])

        return(
            <View style={[Styles.container, {flex:props.flex, borderWidth:0}]} >
                <View style={[Styles.subcontainer]}>
                    <TouchableOpacity onPress={()=>Linking.openURL(props.team.link)}>
                        <Image
                            style={Styles.logo}
                            source = {{uri:encodeURI(props.team.logo_link), cache:'reload'}}
                            />
                    </TouchableOpacity>
                    <Text 
                        style={[Styles.text, {color:scoreColor.team}]}
                    >{truncateTeamName((props.team.team_rank?' #' + props.team.team_rank:'') + ' ' + props.team.school_name)}
                    </Text>
                </View>
                <Text style={[Styles.text, {color:scoreColor.team}]}>{'Record:' + props.team.team_record}</Text>
                <View style={[Styles.subcontainer]}>
                    {
                        props.team.possession && gamePlaying(props.gameStatus)
                        ?<Icon size={10} name='ios-american-football' type='ionicon' color='brown'/>
                        :null
                    }
                    {gamePlaying(props.gameStatus)
                        ?
                        <Text style={[Styles.score, {color:scoreColor.score}]}>{props.team.score}</Text>
                        :
                        null
                    }
                    <Text style={[Styles.score, {color:scoreColor.team}]}>{props.spread}</Text>
                </View>
            </View>
        )
    }

   useEffect(()=>{
        if(pickID && pickID !== props.teamPick?.pick_id){props.pickFunction(pickID, props.game.game_id)}
    },[pickID]) 


   useEffect(()=>{
       _pickID(props.teamPick?.pick_id)
    },[props.teamPick])

    return(
        <View style={[Styles.container, {borderColor:colorScheme.gameBorder, backgroundColor:colorScheme.gameBackgound, borderRadius:3}]}>
            <OverlayAlert {...alertOverlay}/>
            <View style={[Styles.container, {borderWidth:0}]}>
                <Text 
                    style={[Styles.text, {color:colorScheme.gameText, fontWeight:'bold'}]}
                    onPress={()=>Linking.openURL(WebResources.cfbSR_bowl + props.game.bowl.replace(/ /g, "-").toLowerCase() + ".html")}
                >{props.game.bowl}
                </Text>
                <Text style={[Styles.text, {color:colorScheme.gameText}]}>
                    {props.game.location +' (' +  dateFormat(props.game.game_date?props.game.game_date:new Date(),"h:MM TT") + ' on ' + props.game.network + ')'}
                </Text>
            </View>
            <View style={[Styles.subcontainer,{ flex:1}]}>
                <TouchableOpacity disabled={!props.allowPicks} activeOpacity={props.allowPicks?5:1}
                    style={[Styles.subcontainer, 
                        {flex:.5, borderRadius:5, borderWidth:pickID===props.game.visitor_team.team_id?1:0,
                        backgroundColor:pickID===props.game.visitor_team.team_id?colorScheme.pickBackground:'transparent'}]}
                    onPress={()=>{_pickID(props.game.visitor_team.team_id)}}
                >
                    <TeamView 
                        team={props.game.visitor_team} 
                        flex={1} 
                        opposingScore={props.game.home_team.score} 
                        spread={spreadString(props.game.spread, false)}
                        gameStatus={props.game.game_status}
                        allowPick = {props.allowPicks}
                    />
                </TouchableOpacity>
                <TouchableOpacity disabled={!props.allowPicks} activeOpacity={props.allowPicks?5:1}
                    style={[Styles.subcontainer, {flex:.5, borderRadius:5, borderWidth:pickID === props.game.home_team.team_id?1:0,
                        backgroundColor:pickID===props.game.home_team.team_id?colorScheme.pickBackground:'transparent'}]}
                    onPress={()=>{_pickID(props.game.home_team.team_id)}}
                >
                    <TeamView 
                        team={props.game.home_team} 
                        flex={1} 
                        opposingScore={props.game.visitor_team.score} 
                        spread = {spreadString(props.game.spread, true)}
                        gameStatus={props.game.game_status}
                        allowPick={props.allowPicks}
                    />
                </TouchableOpacity>
            </View>
            {globalProps?.tournamentStarted
                ?
                <View style={[Styles.container, {borderWidth:0}]}>
                    <View style={[Styles.subcontainer, {borderWidth:0}]}>
                        <Text>{'Total Points: '}</Text>
                        <Text style={
                            {fontWeight:'bold',color:((props.teamPick?.points||0)&&(props.teamPick?.points||0)>=0)?colorScheme.gameScoreWinning:colorScheme.gameScoreLosing}}
                        >{props.teamPick?.points||0}</Text>
                    </View>
                    <Text style={{color:colorScheme.gameText}}>{props.game.game_status}</Text>
                    <Text style={{color:colorScheme.gameText}}>{'Last Play: ' + props.game.last_play}</Text>
                </View>
                :
                null
            }
        </View>
    )
}

const Styles=StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        textAlignVertical:'center',
        borderWidth:1,
        padding:4,
        fontSize:14
      },
      subcontainer:{
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'center',
        textAlignVertical:'center',
        padding:2
      },
      text:{
      },
      score:{
          fontSize:16,
          fontWeight:'normal',
      },
      logo:{
          height:18,
          width:18,
          resizeMode:'cover'
      }
})