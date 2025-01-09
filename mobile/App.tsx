import React, {useState, useEffect} from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {LogonScreen} from './screens/LogonScreen';
import {AppContextProvider, useAppContext} from './components/AppContext';
import {HeaderBar} from './components/Header';

import {useCachedResources} from './hooks/useCachedResources';
import {Navigation} from './navigation/navigation';
import { iGlobalStatusContext } from './meta/interfaces';

const App:React.FunctionComponent<{}>= function({}):React.ReactElement|null {
  const isLoadingComplete = useCachedResources();

  const AppBody:React.FC = function():JSX.Element{
    const globalParams:iGlobalStatusContext = useAppContext();

   //useEffect(()=>{alert(globalParams.logonStatus)},[globalParams.logonStatus])
    return(
      <SafeAreaProvider>
            {globalParams.logonStatus
            ?
              <>
                <HeaderBar/>
                <Navigation/>
              </>
            :
                <LogonScreen/>
            }
            </SafeAreaProvider>
    )
  }

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
        <AppContextProvider >
          <AppBody/>
        </AppContextProvider>
    );
  }
}

export default App;