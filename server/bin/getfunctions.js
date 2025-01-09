const createToken = require('./commonfunctions').createToken;
const hashPassword = require('./commonfunctions').hashPassword;

const PENDING_STATUS = 'Pending';

const createResponseObject = function () {
    return {
        user: createUserObject(null, true),
        success: false,
        error: '',
        isAuthenticated: false,
        games: [],
        root: null,
    }
};

const createUserObject = function (record, itsMe) {
    if (itsMe) {
        return {
            user_id: record ? record.user_id : 0,
            user_name: record ? record.user_name : '',
            user_alias: record ? record.user_alias : '',
            user_email: record ? record.user_email : '',
            user_sms: record ? record.user_sms : '',
            user_root: record ? record.user_root: false,
            user_participating: record ? record.user_participating : false,
            user_token: record ? record.user_token: 0,
            user_subscribed: record ? record.user_subscribed : 0,
            user_sms_contact: record ? record.user_sms_contact : false,
            user_picture_location: record ? record.user_picture_location : '_generic.png',
            user_group_pick_all:record? record.user_group_pick_all:true,
            groups: [],
        };
    } else {
        return {
            user_id: record ? record.user_id : 0,
            user_name: record ? record.user_name : '',
            user_alias: record ? record.user_alias : '',
            user_picture_location: record ? record.user_picture_location : '_generic.png',
            picks: [],
        };
    }
};

const createGroupObject = function (record) {
    return {
        group_id: record.group_id,
        group_name: record.group_name,
        group_password: record.group_password,
        group_admin_id: record.group_admin_id,
        group_season: record.group_season,
        group_active: record.group_active,
        confidence_mode: record.confidence_mode,
        group_picture_location: record.group_picture_location,
        users: [],
        smack: [],
        score_win_points:record.score_win_points,
	    score_cover_points:record.score_cover_points,
	    score_margin_points:record.score_margin_points,
	    score_margin_spread_adjusted_points:record.score_margin_spread_adjusted_points,
    }
}

const createPickObject = function(record, group){
    const teamPoints = function(pickScore, opposingScore, spread){
        const winPoints = group.score_win_points;
        const spreadPoints = group.score_margin_points;
        let scoreCalc=0;

        if(+pickScore > +opposingScore){
            scoreCalc = winPoints;
        }
        if((+pickScore + +spread) > +opposingScore){
            scoreCalc = scoreCalc + spreadPoints
        }
        
        if(group.score_margin_points){
            scoreCalc = scoreCalc + (pickScore - opposingScore)
        }

        if(group.score_margin_spread_adjusted_points){
            scoreCalc = scoreCalc + ((+pickScore + +spread) - +opposingScore);
        }

        return scoreCalc;
    }

    return {
        pick_id:record.pick_id,
        group_id:record.group_id,
        user_id:record.user_id,
        game_id:record.game_id,
        pick_confidence:record.pick_confidence,

        ///Scoring win points + cover points + spread adjusted score margin - ignore pick_confidence

        get points() {
            let score = 0 
            if (this.pick_id === record.home_id){
                score = teamPoints(record.home_score, record.visitor_score, -1 * record.spread)
            }else if (this.pick_id === record.visitor_id){
                score = teamPoints(record.visitor_score, record.home_score, record.spread)
            };
            return score
        }
    }
}


const createGameObject = function (record) {
    return {
        game_id: record.game_id,
        espn_game_id: record.espn_game_id,
        season: record.season,
        game_date: record.game_date,
        bowl: record.bowl,
        location: record.location,
        network: record.network,
        game_status: record.game_status,
        last_play: record.last_play,
        home_team: {
            team_id: record.home_id,
            espn_team_id: record.home_espn_team_id,
            school_name: record.home_school_name,
            team_symbol: record.home_team_symbol,
            team_name: record.home_team_name,
            search_name: record.home_search_name,
            link: record.home_link,
            logo_link: record.home_logo_link,
            team_rank: record.home_rank,
            team_record: record.home_record,
            score: record.home_score,
            possession: record.possession !==0,
        },
        visitor_team: {
            team_id: record.visitor_id,
            espn_team_id: record.visitor_espn_team_id,
            school_name: record.visitor_school_name,
            team_symbol: record.visitor_team_symbol,
            team_name: record.visitor_team_name,
            search_name: record.visitor_search_name,
            link: record.visitor_link,
            logo_link: record.visitor_logo_link,
            team_rank: record.visitor_rank,
            team_record: record.visitor_record,
            score: record.visitor_score,
            possession: !record.possession,
        },
        spread: parseFloat(record.spread),
    }
};

const createTeamObject = function (record) {
    return {
        team_id: record.team_id,
        espn_team_id: record.espn_team_id,
        school_name: record.school_name,
        team_symbol: record.team_symbol,
        team_name: record.team_name,
        search_name: record.search_name,
        link: record.link,
        logo_link: record.logo_lin,
        team_rank: record.team_rank,
        team_record: record.team_record,
    }
}

const createSmackObject = function (record) {
    return {
        smack_id: record.smack_id,
        smack_time: record.smack_time,
        user_id: record.user_id,
        user_alias: record.user_alias,
        user_name: record.user_name,
        user_picture_location: record.user_picture_location,
        smack: record.smack,
    }
}

const addObject = function(array,object){
    array.push(object);
}

const authenticateUser = function(db, requestObject, response){
    let responseObject = createResponseObject();
    const authenticateSQL = 'select * from users where user_email = $1';
    db.query(authenticateSQL, [requestObject.user.user_email], (error, results) => {
        if (error) {
            errorHandler(responseObject, error);
        } else {
            if (results.rows.length && hashPassword(results.rows[0].user_password, requestObject.user.user_password)) {
                responseObject.user = createUserObject(results.rows[0], true);
                getResponseObject(db, responseObject, response);
            } else {
                responseObject.isAuthenticated = false;
                responseObject.success = false;
                responseObject.error = 'Authentication failed: wrong username or password';
                response.json(responseObject);
            }
        }
    })

}

const refreshResponseObject = function (db, requestObject, response) {
    let responseObject = createResponseObject();
    const refreshSQL = 'select * from users where user_id = $1';
    db.query(refreshSQL, [requestObject.actionObject.object_id], (error, results) => {
        if (error) {
            errorHandler(responseObject, error, response);
        } else {
            responseObject.user = createUserObject(results.rows[0], true);
            getResponseObject(db, responseObject, response);
        }
    })
}

const getResponseObject = function (db, responseObject, response) {
    const getUserSQL = 'select * from group_picks_details where user_id = $1'
    db.query(getUserSQL, [responseObject.user.user_id], (error, results) => {
        function getUserGroups(user, record) {
            let findGroup = user.groups.filter((el) => (el.group_id === record.group_id));
            let newGroup;
            if (findGroup.length) {
                newGroup = findGroup[0];
            } else {
                newGroup = createGroupObject(record);
                addObject(user.groups, newGroup);
            }
            getGroupUsers(newGroup, record );
        };
        function getGroupUsers(group, record ) {
            /////HERE
            let findUser = group.users.filter((el) => (el.user_id === record.user_id));
            let newPick = createPickObject(record, group);
            if (findUser.length) {
                addObject(findUser[0].picks, newPick);
            } else {
                let newUser = createUserObject(record, false);
                addObject(group.users, newUser);
                addObject(newUser.picks, newPick);
            };
        }
        function getGames() {
            const pendingGamesSQL = 'select * from game_results order by game_date asc';
            db.query(pendingGamesSQL, (error, results) => {
                if (error) {
                    errorHandler(responseObject, error, response);
                } else {
                    for (let i = 0; i < results.rows.length; i++) {
                        addObject(responseObject.games, createGameObject(results.rows[i]));
                    }
                    getRoot();
                }
            });
        }
        function getRoot() {
            function getTeams() {
                const teamSQL = 'select * from teams';
                db.query(teamSQL, (error, results) => {
                    if (error) {
                        errorHandler(responseObject, error, response);
                    } else {
                        for (let i = 0; i < results.rows.length; i++) {
                            addObject(responseObject.root.teams, createTeamObject(results.rows[i]));
                        }
                    }
                    getLookups();
                })
            }
            function getLookups() {
                const bowlsSQL = 'select * from bowls';
                db.query(bowlsSQL, (error, results) => {
                    if (error) {
                        errorHandler(responseObject, error, response);
                    } else
                        for (let i = 0; i < results.rows.length; i++) {
                            responseObject.root.bowls.push(results.rows[i].bowl);
                        }
                    const venuesSQL = 'select * from venues';
                    db.query(venuesSQL, (error, results) => {
                        if (error) {
                            errorHandler(responseObject, error, response);
                        } else {
                            for (let i = 0; i < results.rows.length; i++) {
                                responseObject.root.venues.push(results.rows[i].location);
                            }
                            const networksSQL = 'select * from networks';
                            db.query(networksSQL, (error, results) => {
                                if (error) {
                                    errorHandler(responseObject, error, response);
                                } else {
                                    for (let i = 0; i < results.rows.length; i++) {
                                        responseObject.root.networks.push(results.rows[i].network);
                                    }
                                    respondToken();
                                }
                            })
                        }
                    })
                })
            }
            if (responseObject.user.user_root) {
                responseObject.root = {
                    teams: [],
                    bowls: [],
                    venues: [],
                    networks: [],
                };
                getTeams();
            } else {
                respondToken();
            }
        }
        function respondToken() {
            const newToken = createToken();
            const newTokenSQL = 'update users set user_token = $1 where user_id = $2';
            db.query(newTokenSQL, [newToken, responseObject.user.user_id], (error, results) => {
                let validToken;
                if (error) {
                    console.log("Error updating token for user:" + responseObject.user.user_name)
                    validToken =  default_token;
                } else {
                    //console.log('New User Token for user:' + responseObject.user.user_name + ' - ' + newToken);
                    validToken =  newToken;
                }
                responseObject.success = true;
                responseObject.isAuthenticated = true;
                responseObject.user.user_token = validToken;
                response.json(responseObject);
            });
        };
        if (error) {
            errorHandler(responseObject, error, response);
        } else {
            if (results.rows.length) {
                for (let i = 0; i < results.rows.length; i++) {
                    getUserGroups(responseObject.user, results.rows[i]);
                };
            }
            getGames();
        }
    })
};

const getGroupSmack = function (db, requestObject, response) {
    const smackSQL = 'select * from group_smack where group_id = $1 order by smack_time asc';
    db.query(smackSQL, [requestObject.actionObject.object_id], (error, results) => {
        if (error) {
            response.json({
                success: false,
                error: error.message,
            })
        } else {
            let responseObject = {
                success: true,
                error: '',
                smack: [],
            }
            for (let i = 0; i < results.rows.length; i++) {
                addObject(responseObject.smack, createSmackObject(results.rows[i]));
            }
            response.json(responseObject);
        }
    })
}

const errorHandler = function (responseObject, error, response) {
    console.log(error.message);
    let responseObject_fn = responseObject;
    responseObject_fn.success = false;
    responseObject_fn.error = error.message;
    response.json(responseObject_fn);
};

module.exports = {
    authenticateUser,
    refreshResponseObject,
    getGroupSmack,
}