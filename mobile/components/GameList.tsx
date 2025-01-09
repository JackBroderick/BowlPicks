import React, { useEffect, useState, useContext} from 'react';
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import {iGameObject, iGlobalStatusContext, iPickObject} from '../meta/interfaces';
import {useAppContext} from '../components/AppContext';
import {Game} from '../components/Game';

import Colors from '../constants/Colors'
import useColorScheme from '../hooks/useColorScheme';
import dateFormat from 'dateformat';

interface iGamesListProps{
    allowPicks:boolean;
    dateRange?:Date|undefined;
    gamePicks:Array<iPickObject>;
    pickFunction?:Function;
}

export const GameList:React.FunctionComponent<iGamesListProps> = function({...props}):React.ReactElement{
    //const globalProps:iGlobalStatusContext|undefined= useContext(AppContext);
    const globalProps:iGlobalStatusContext = useAppContext();
    const [gameDates, _gameDates] = useState<Array<string>>([]);
    const colorScheme = Colors[useColorScheme()];
    const dateFilter:string = 'dddd, mmmm dd, yyyy';
    const pickFunction:Function = props.pickFunction?props.allowPicks?props.pickFunction:()=>{}:()=>{};

    const getPick:Function = function(homeID:number, visitorID:number):iPickObject|undefined{
            //console.log(props.gamePicks?.filter((pick:iPickObject)=>(pick.pick_id === homeID || pick.pick_id === visitorID)).pop())
            return props.gamePicks?.filter((pick:iPickObject)=>(pick.pick_id === homeID || pick.pick_id === visitorID)).pop();
    }

    useEffect(()=>{
        const games:Array<iGameObject> = globalProps.appData?.games??[]
        _gameDates(
            [...new Set(games.map((game:iGameObject)=>(game.game_date))
            .filter((date): date is Date => (date !== undefined))
            .filter((date:Date)=>(props.dateRange?(dateFormat(date, dateFilter)===dateFormat(props.dateRange,dateFilter)):date))
            .map((date:Date)=>(dateFormat(date,dateFilter))
            ))]);
            //console.log(globalProps?.appData?.user.groups)
    },[props.dateRange])

    return(
        <ScrollView style={Styles.container}>
                {
                    (globalProps?.appData?.games||[]).length && gameDates.length
                    ?
                        gameDates.map((gameDate:string)=>
                            {
                                return(
                                <View key = {gameDate} style={[Styles.divider,{borderColor:colorScheme.gameDividerBackground, backgroundColor:colorScheme.gameDividerBackground}]}>
                                    <View style={[Styles.divider, {backgroundColor:colorScheme.gameDividerBackground, borderWidth:0}]}>
                                        <Text style={{color:colorScheme.gameText}}>{gameDate}</Text>
                                    </View>
                                    {
                                        (globalProps?.appData?.games||[]).filter((game:iGameObject)=>
                                        {
                                            const theDate:Date|null = game.game_date?game.game_date:new Date()
                                            return dateFormat(theDate,dateFilter)===gameDate
                                        }).map((game:iGameObject)=>(
                                            <Game 
                                            key={game.game_id} 
                                            game={game} 
                                            teamPick={getPick(game.home_team.team_id, game.visitor_team.team_id)} 
                                            pickFunction={props.allowPicks?pickFunction:()=>{}}
                                            allowPicks={props.allowPicks}
                                            />
                                        ))
                                    }
                                </View>
                                )
                            }
                        )
                    :
                    null
                }
        </ScrollView>
    )
}

const Styles=StyleSheet.create({
    container:{
        flex:1,
        overflow:'hidden',
    },
    divider:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        textAlignVertical:'center',
        borderWidth:2,
        fontSize:14
    }
})