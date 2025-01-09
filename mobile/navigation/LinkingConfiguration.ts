/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import { RootStackParamList } from '../meta/types';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        screens: {
          Games: {
            screens: {
              Games: 'Games',
            },
          },
          LeaderBoard: {
            screens: {
              LeaderBoard: 'LeaderBoard',
            },
          },
        },
      },
    },
  },
};

export default linking;
