const routes = require('express').Router();
const postGres = require('./database').pool;
const authenticateUser = require('./getfunctions').authenticateUser;
const refreshResponseObject = require('./getfunctions').refreshResponseObject;
const getSmackObject = require('./getfunctions').getGroupSmack;
const newSmackObject = require('./updatefunctions').newGroupSmack;
const inviteGroupUsers = require('./smtpfunctions').inviteGroupUsers;
const newUserObject = require('./updatefunctions').newUser;
const updateUserObject = require('./updatefunctions').updateUser;
const passwordReset = require('./smtpfunctions').passwordReset;
const newGroup = require('./updatefunctions').newGroup;
const updateGroup = require('./updatefunctions').updateGroup;
const makeUserPick = require('./updatefunctions').makeUserPick;
const gameTimeCheck=require('./scoreChange').gameTimeCheck_New;

//REAL TIME SCORING MODULE***************************************************************************************************************************************************

//Score auto update constants
const minute_interval = 1; //Interval to check for a score change during game day in minutes
const game_duration = 4; //Length of game in hours
//****************************

const checkInterval = minute_interval * 60 * 1000;
const gameDuration = game_duration * 60 * 60 * 1000;
let RTScheduler = null;

const RealTimeScheduling_FN = function (socketServer) {
    if (RTScheduler) { RTScheduler.cancel() };
    RTScheduler = gameTimeCheck(REAL_TIME_SCORING, checkInterval, gameDuration, postgres, socketServer);
}

//REAL TIME SCORING MODULE***************************************************************************************************************************************************



const endpoints = function (socketServer) {

    routes.get('/', function (request, response) {
        response.send('<html><body>Bitches<</body></html>');
    });

    routes.post('/endpoints/_authenticate', function (request, response) {
        authenticateUser(postGres, request.body, response);
    });

    routes.post('/endpoints/_refreshdata', function (request, response) {
        refreshResponseObject(postGres, request.body, response);
    });

    routes.post('/endpoints/_getsmack', function (request, response) {
        getSmackObject(postGres, request.body, response);
    });

    routes.post('/endpoints/_newsmack', function (request, response) {
        newSmackObject(postGres, request.body, response, socketServer);
    });

    routes.post('/endpoints/_newuser', function (request, response) {
        newUserObject(postGres, request.body, response, socketServer);
    });

    routes.post('/endpoints/_updateuser', function (request, response) {
        updateUserObject(postGres, request.body, response, socketServer);
    })

    routes.post('/endpoints/_passwordreset', function (request, response) {
        passwordReset(postGres, request.body, response);
    })

    routes.post('/endpoints/_newgroup', function (request, response) {
        newGroup(postGres, request.body, response, socketServer);
    })

    routes.post('/endpoints/_updategroup', function (request, response) {
        updateGroup(postGres, request.body, response, socketServer);
    })

    routes.post('/endpoints/_invitegroupusers', function (request, response) {
        inviteGroupUsers(postGres, request.body, response);
    });

    routes.post('/endpoints/_makepick', function(request, response) {
        makeUserPick(postGres, request.body, response)        
    })
    return routes;
}

module.exports = { endpoints, RealTimeScheduling_FN };
