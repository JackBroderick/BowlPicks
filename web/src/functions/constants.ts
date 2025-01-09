const testServer: string = 'http://node-server.local:3000';
export const productionServer:string = 'http://node-server.local:5000';
const endpointServer: string = productionServer + '/endpoints';

export const Styles = {
    sContainerCenter: {
        width: '100%',
        height: '100%',
        padding: '5px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        textAlign: 'center' as const,
    },
    sContainerFont: {
        fontFamily: 'Spectral,serif',
        fontSize: '1rem',
    },
    sContainerBorder: {
        border: '1px solid gainsboro',
        borderRadius: '6px',
        padding: '5px',
        width: '100%',
        height: '100%',
    }
};

export const Endpoints = {
    main: {
        endpoint: testServer,
        method: 'GET',
        headers: { "Content-Type": "application/json" },
    },
    logon: {
        endpoint: endpointServer + '/_authenticate',
        method: 'POST',
        headers: { "Content-Type": "application/json" },
    },
    refresh: {
        endpoint: endpointServer + '/_refreshdata',
        method: 'POST',
        headers: { "Content-Type": "application/json" },
    },
    getsmack: {
        endpoint: endpointServer + '/_getsmack',
        method: 'POST',
        headers: { "Content-Type": "application/json" },
    },
    newsmack: {
        endpoint: endpointServer + '/_newsmack',
        method: 'POST',
        headers: { "Content-Type": "application/json" },
    },
    newuser: {
        endpoint: endpointServer + '/_newuser',
        method: 'POST',
        headers: { "Content-Type": "application/json" },
    },
    updateuser: {
        endpoint: endpointServer + '/_updateuser',
        method: 'POST',
        headers: { "Content-Type": "application/json" },
    },
    resetpassword: {
        endpoint: endpointServer + '/_passwordreset',
        method: 'POST',
        headers: { "Content-Type": "application/json" },
    },
    newgroup: {
        endpoint: endpointServer + '/_newgroup',
        method: 'POST',
        headers: { "Content-Type": "application/json" },
    },
    updategroup: {
        endpoint: endpointServer + '/_updategroup',
        method: 'POST',
        headers: { "Content-Type": "application/json" },
    },
    invitegroupusers: {
        endpoint: endpointServer + '/_invitegroupusers',
        method: 'POST',
        headers: { "Content-Type": "application/json" },
    },
};

export const Cookies = {
    userEmail: 'bc_useremail',
    userPassword: 'bc_userpassword',
    userDefaultGroup: 'bc_userdefaultgroup',
};

export const Sockets = {
    location: productionServer,
    path: '/_sockets/',
    handshake: 'handshake',
    refresh: 'refresh',
    smack: 'smack',
};

export const WebResources = {
    cfbSR_bowl: 'https://www.sports-reference.com/cfb/bowls/',
    cfbSR_team: 'https://www.sports-reference.com/cfb/schools/',
};

