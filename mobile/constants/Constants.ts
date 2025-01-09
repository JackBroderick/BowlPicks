import {Image} from 'react-native';
const testServer: string = 'http://node-server.local:3000';
export const productionServer:string = 'http://node-server.local:5000';
const endpointServer: string = productionServer + '/endpoints';

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
    makePick:{
        endpoint:endpointServer + '/_makepick',
        method:'POST',
        headers:{ "Content-Type": "application/json" },
    },
};

export const WebResources = {
    cfbSR_bowl: 'https://www.sports-reference.com/cfb/bowls/',
    cfbSR_team: 'https://www.sports-reference.com/cfb/schools/',
};


