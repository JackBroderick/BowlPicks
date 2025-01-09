require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const endpoints = require('./bin/routes').endpoints;
const normalizePort = require('./bin/middleware').normalizePort;
const logger = require('./bin/middleware').logger;
const cryptoFunction = require('./bin/middleware').cryptoFunction;
const crashProtect = require('./bin/middleware').crashProtect;
const Sockets = require('./bin/constants').Sockets;
const helmet = require('helmet');
const cors = require('cors');
const dateFormat = require('dateformat');
const http = require('http');
const io = require('socket.io');
const RealTimeScoring_FN = require('./bin/routes').RealTimeScoring_FN;

const app = express();

app.use(bodyParser.urlencoded({ limit:'10mb', extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));

app.use(helmet());
app.use(cors());
app.use(logger);
app.use(express.static(path.join(__dirname, 'public')));
app.use(cryptoFunction);
//app.use(crashProtect);

const httpServer = http.createServer(app);

const socketServer = io(httpServer, Sockets.options);
socketServer.on('connection', (socket) => {
    console.log('Client (' + socket.handshake.address + ') connected at ' + dateFormat(socket.handshake.time, 'mm-dd-yyyy hh:mm:ss'));
    socket.emit(Sockets.handshake.verb, { message: Sockets.handshake.message });

    socket.on("disconnect", () => {
        console.log('Client (' + socket.handshake.address + ') disconnected at ' + dateFormat(socket.handshake.time, 'mm-dd-yyyy hh:mm:ss'));
    })
});

app.use('/_sockets', endpoints(socketServer));

const HTTP_PORT = normalizePort(process.env.PORT || '5000');
const HTTPserver = httpServer.listen(HTTP_PORT, () => {
    console.log('The Bowl Cup HTTP Server is Running at http://' + HTTPserver.address().address + ':' + HTTPserver.address().port);
    //RealTimeScoring_FN(socketServer);
});
