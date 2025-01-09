/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome5 } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, Pressable } from 'react-native';
import {LeaderBoardScreen} from '../screens/LeaderBoardScreen';
import {GamesScreen} from '../screens/GamesScreen';
import {iGlobalStatusContext} from '../meta/interfaces';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../meta/types';
import LinkingConfiguration from './LinkingConfiguration';
import {useAppContext} from'../components/AppContext';
import Layout from '../constants/Layout';

export function Navigation() {
  const globalProps:iGlobalStatusContext|undefined = useAppContext();
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={useColorScheme() === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  
  return (
    <Stack.Navigator>
      <Stack.Screen name="Root" component={TopTabNavigator} options={{ headerShown: false }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
  {/*      <Stack.Screen name="ConfigScreen" component={ConfigScreen} />*/}
      </Stack.Group>
    </Stack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
//const BottomTab = createBottomTabNavigator<RootTabParamList>();
const TopTab = createMaterialTopTabNavigator<RootTabParamList>();


function TopTabNavigator() {
  const colorScheme = Colors[useColorScheme()];
  
  return (
    <TopTab.Navigator
      initialRouteName="Games"
      sceneContainerStyle={{overflow:'scroll'}}
      screenOptions={{
        tabBarStyle:{backgroundColor:colorScheme.tabBackGround, justifyContent:'center', borderColor:colorScheme.tabBorder,maxHeight:Layout.isSmallDevice?25:50},
        tabBarLabelStyle:{paddingTop:0, paddingBottom:0},
        tabBarInactiveTintColor:colorScheme.tabLabelDefault,
        tabBarActiveTintColor:colorScheme.tabLabelSelected,
        tabBarShowIcon:false,
        tabBarIndicatorStyle:{backgroundColor:colorScheme.tabIndicator},
        tabBarContentContainerStyle:{justifyContent:'center', marginTop:0, alignItems:'center'}
      }}>
      <TopTab.Screen 
        name="Games"
        component={GamesScreen}
        options={({
          title:'Games',
          //tabBarIcon: ({color}) => <TabBarIcon name="trophy" color={color} />,
        })}
      />
      <TopTab.Screen
        component={LeaderBoardScreen}
        name='LeaderBoard'
        options={{
          title:'LeaderBoard',
          //tabBarIcon: ({ color }) => <TabBarIcon name="football-ball" color={color} />,
        }}
      />
    </TopTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome5>['name'];
  color: string;
}) {
  return <FontAwesome5 size={22} style={{ marginBottom: 1 }} {...props} />;
}
