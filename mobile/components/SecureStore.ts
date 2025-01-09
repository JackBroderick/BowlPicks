import * as S_Store from 'expo-secure-store';

export const SecureStoreConstants={
    userEmailKey:'email',
    userPasswordKey:'password',
    defaultGroupIndex:'defaultgroupindex',
    userAutoLogon:'autologon',
    userAutoLogon_True:'true',
    userAutoLogon_False:'false'
};

export const SecureStore = S_Store;