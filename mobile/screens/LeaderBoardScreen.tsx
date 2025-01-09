import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {RootStackScreenProps, RootTabScreenProps} from '../meta/types'

export const LeaderBoardScreen:React.FunctionComponent<{navigation:RootTabScreenProps<'LeaderBoard'>}> = function({...props}):React.ReactElement{

    return(
        <>
        <Text style={{color:'white'}}>LeaderBoard Screen</Text>
        </>
    )
}