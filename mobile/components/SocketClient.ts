import io from 'socket.io-client';
import { productionServer } from '../constants/Constants';

export const SocketsParams = {
    location: productionServer,
    path: '/_sockets/',
    handshake: 'handshake',
    refresh: 'refresh',
    smack: 'smack',
};

export const socketClient = io(SocketsParams.location, { path: SocketsParams.path });
