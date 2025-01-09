const Sockets = require('./constants').Sockets;
const createToken = require('./commonfunctions').createToken;
const hashPassword = require('./commonfunctions').hashPassword;
const createNewPassword = require('./commonfunctions').createNewPassword;
const writeUserPicture = require('./filefunctions').writeUserPicture;
const genericPicture = require('./constants').genericPicture;
const newUserEmail = require('./smtpfunctions').newUserEmail;
const writeGroupPicture = require('./filefunctions').writeGroupPicture;

const newGroupSmack = function (db, requestObject, response, socketObject) {
    const insertSQL = 'insert into smack (smack_time, group_id, user_id, smack) values ($1, $2, $3, $4)';
    db.query(insertSQL, [new Date(), requestObject.actionObject.object_id, requestObject.actionObject.smack.user_id, requestObject.actionObject.smack.smack], (error, results) => {
        if (!error) {
            socketObject.emit(Sockets.smack.verb,
                {
                    message: Sockets.smack.message,
                    object_id: requestObject.actionObject.object_id,
                }
            );
        }
        response.json({
            success: error ? false : true,
            error: error ? error.message : '',
        })
    })
}

const checkUserEmail = function (db, requestObject, response, callback) {
    const checkSQL = 'select user_id from users where user_email = $1';
    db.query(checkSQL, [requestObject.actionObject.user.user_email], (error, results) => {
        const duplicateEmail = function () {
            response.json({
                success: false,
                error: requestObject.actionObject.user.user_email + ' already exists. Choose a different email or login with that email.',
            })
        }
        if (error) {
            errorHandler(error, reponse);
        } else {
            if (results.rows.length === 0) {
                callback();
            } else if (results.rows.length === 1) {
                if (results.rows[0].user_id === requestObject.actionObject.user.user_id) {
                    callback();
                } else {
                    duplicateEmail();
                }
            } else {
                duplicateEmail();
            }
        }
    })
}

const newUser = function (db, requestObject, response, socketObject) {
    let newPassword = '';
    let userEmail = '';
    const newUserFN = function () {
        let userSQL = '';
        let params = [];
        userSQL = 'insert into users (user_password, user_name, user_alias, user_email, user_sms, user_root, user_participating, user_token, user_subscribed, user_picture_location) ' +
            'values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning user_id';
        let user = requestObject.actionObject.user;
        newPassword = createNewPassword(5);
        userEmail = user.user_email;
        params = [
            newPassword,
            user.user_name,
            user.user_alias?.length ? user.user_alias : user.user_name,
            userEmail,
            user.user_sms,
            false,
            user.user_participating,
            createToken(),
            false,
            genericPicture,
        ];
        db.query(userSQL, params, (error, results) => {
            if (error) {
                errorHandler(error, response);
            }
            else {
                if (results.rows.length) {
                    let newrequestObject = requestObject;
                    let group = requestObject.actionObject.group;
                    newrequestObject.actionObject.object_id = results.rows[0].user_id;
                    if (group.group_password.length) {
                        if (newrequestObject.actionObject.user.picture) {
                            writeUserPicture(results.rows[0].user_id, '', newrequestObject.actionObject.user.picture, () => { authenticateGroup(db, newrequestObject, response, socketObject)})
                        } else {
                            authenticateGroup(db, newrequestObject, response, socketObject);
                        }
                    } else {
                        if (newrequestObject.actionObject.picture) {
                            writeUserPicture(results.rows[0].user_id, '', newrequestObject.actionObject.user.picture, () => { newGroup(db, newrequestObject, reponse, socketObject) })
                        } else {
                            newGroup(db, newrequestObject, response, socketObject);
                        }
                    }
                } else {
                    response.json({
                        success: false,
                        message: "User added but could not create or join group.",
                    })
                }
                if (newPassword.length && userEmail.length) {
                    console.log("New Password", newPassword);
                    newUserEmail(userEmail, newPassword)
                }
            }
        })
    }

    checkUserEmail(db, requestObject, response, newUserFN);
}

const updateUser = function (db, requestObject, response, socketObject) {
    const updateUserFN = function () {
        const userSQL = 'update users set user_password = coalesce($1, user_password), user_name = $2, user_alias = $3, user_email = coalesce($4, user_email) , user_sms = $5, '
            + 'user_root = $6, user_participating = $7, user_token = $8, user_subscribed = $9 where user_id = $10'
        let user = requestObject.actionObject.user;
        const params = [
            user.user_password?.length > 7 ? user.user_password.substring(7) : null,
            user.user_name,
            user.user_alias?.length ? user.user_alias : user.user_name,
            user.user_email.length ? user.user_email : null,
            user.user_sms,
            user.user_root,
            user.user_participating,
            createToken(),
            user.user_subscribed,
            user.user_id,
        ];
        db.query(userSQL, params, (error, results) => {
            if (error) {
                errorHandler(error, response);
            }
            else {
                if (user.picture) {
                    writeUserPicture(db, user.user_id, user.user_picture_location, user.picture, () => {
                        response.json(successHandler());
                        socketObject.emit(Sockets.refresh.verb, { message: Sockets.refresh.message });
                    })
                } else {
                    response.json(successHandler());
                    socketObject.emit(Sockets.refresh.verb, { message: Sockets.refresh.message });
                }
            }
        })
    }

    if (requestObject.actionObject.user.user_email.length) {
        checkUserEmail(db, requestObject, response, updateUserFN)
    } else {
        updateUserFN();
    }
}

const joinGroup = function (db, requestObject, response, socketObject = null) {
    let actionObject = requestObject.actionObject;
    const joinSQL = 'insert into user_groups_join (user_id, group_id) values ($1, $2)';
    db.query(joinSQL, [actionObject.object_id, actionObject.group.group_id], (error, results) => {
        if (error) {
            errorHandler(error, respones);
        } else {
            response.json({ ...successHandler(), return_id:actionObject.group.group_id});
            if (socketObject) {
                socketObject.emit(Sockets.refresh.verb, { message: Sockets.refresh.message });
            }
        }

    })
}

const authenticateGroup = function (db, requestObject, response, socketObject = null) {
    let actionObject = requestObject.actionObject;
    const groupSQL = 'select group_id from groups where group_password = $1';
    db.query(groupSQL, [hashPassword(actionObject.group.group_password)], (error, results) => {
        if (error) {
            errorHandler(error, response);
        } else {
            if (results.rows.length) {
                const groupID = results.rows[0].group_id;
                let newrequestObject = requestObject;
                newrequestObject.actionObject.group.group_id = groupID;
                joinGroup(db, newrequestObject, response, socketObject);
            } else {
                response.json({
                    success: false,
                    message: "Group password is invalid, please check the spelling carefully.",
                })
            }
        }
    })
}

const newGroup = function (db, requestObject, response, socketObject = null) {
    let actionObject = requestObject.actionObject;
    let group = actionObject.group;
    const groupSQL = 'insert into groups (group_name, group_password, group_admin_id, group_season, group_active, confidence_mode, group_picture_location) values ($1, $2, $3, $4, $5, $6, $7) returning group_id';
    const params = [
        group.group_name.length < 6 ? group.group_name : 'My Group',
        createNewPassword(10),
        actionObject.object_id,
        group.group_season,
        group.group_active,
        group.confidence_mode,
        group.group_picture_location ? group.group_picture_location: '_generic.png',
    ];
    db.query(groupSQL, params, (error, results) => {
        if (error) {
            errorHandler(error, response);
        } else {
            if (results.rows.length) {
                let newrequestObject = requestObject;
                newrequestObject.actionObject.group.group_id = results.rows[0].group_id;
                if (requestObject.actionObject.group.picture) {
                    writeGroupPicture(db, results.rows[0].group_id, '', group.picture, () => { joinGroup(db, newrequestObject, response, socketObject)})
                } else {
                    joinGroup(db, newrequestObject, response, socketObject);
                }
            } else {
                response.json({
                    success: false,
                    message: "Group created but could not join group",
                })
            }
        }
    })
}

const updateGroup = function (db, requestObject, response, socketObject) {
    const updateSQL = 'update groups set group_name = $1, group_active = $2, confidence_mode = $3, group_picture_location = $4 where group_id = $5';
    const params = [
        requestObject.actionObject.group.group_name,
        requestObject.actionObject.group.group_active,
        requestObject.actionObject.group.confidence_mode,
        requestObject.actionObject.group_picture_location ? group.group_picture_location : '_generic.png',
        requestObject.actionObject.object_id
    ];
    db.query(updateSQL, params, (error, results) => {
        if (error) {
            errorHandler(error, response);
        } else {
            if (requestObject.actionObject.group.picture) {
                writeGroupPicture(
                    db,
                    requestObject.actionObject.object_id,
                    requestObject.actionObject.group.group_picture_location,
                    requestObject.actionObject.group.picture, () => {
                        response.json(successHandler());
                        socketObject.emit(Sockets.refresh.verb, { message: Sockets.refresh.message });
                    }
                );
            } else {
                response.json(successHandler());
                socketObject.emit(Sockets.refresh.verb, { message: Sockets.refresh.message });
            }
        }
    })
}

const makeUserPick=function(db,requestObject,response){
    if(requestObject.actionObject.pick.group_id > 0 && requestObject.actionObject.pick.pick_id>0){
        const delpickSQL = 'delete from picks where user_id = $1 and group_id = $2 and game_id = $3'
        db.query(delpickSQL,
            [
                requestObject.actionObject.object_id, 
                requestObject.actionObject.pick.group_id, 
                requestObject.actionObject.pick.game_id,
            ], (error, results)=>{
                if(error){
                    errorHandler(error, response)
                }else{
                    const pickSQL = 'insert into picks (user_id, group_id, game_id, pick_id) values ($1, $2, $3, $4)'
                    db.query(pickSQL, 
                        [
                            requestObject.actionObject.object_id, 
                            requestObject.actionObject.pick.group_id, 
                            requestObject.actionObject.pick.game_id,
                            requestObject.actionObject.pick.pick_id,
                    ], (error, results)=>{
                        if (error){
                            errorHandler(error)
                        }else{
                            response.json(successHandler());
                        }
                    })
                }
            })
    }else{
        response.json({
                success:false,
                error:'Invalid pick'
            })
    }
}

const errorHandler = function (error, response) {
    console.log(error);
    response.json({
        success: false,
        error: error.message,
    })
};

const successHandler = function () {
    return ({
        success:true,
        message: '',
    })
}

module.exports = {
    newGroupSmack,
    newUser,
    updateUser,
    newGroup,
    updateGroup,
    makeUserPick,
}