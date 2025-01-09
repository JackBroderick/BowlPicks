
const emailClient = require('emailjs').SMTPClient;
const fs = require('fs');
const path = require('path');
const EmailSettings = require('./constants').EmailSettings;
const createNewPassword = require('./commonfunctions').createNewPassword;
const cr = '\r\n';

const server = new emailClient({
    name:EmailSettings.name,
    user: EmailSettings.account,
    password: EmailSettings.password,
    host: EmailSettings.server,
    port: EmailSettings.port,
    ssl: EmailSettings.SSL,
    tls: EmailSettings.TLS,
    authentication:EmailSettings.authentication,
});



const newUserEmail = function (requestObject, response) {

}

const forgotPasswordEmail = function (email, password, response) {
    const messageText = 'Your new BowlCup Tournament password is: ' + password + cr + cr + 'You can change this password after you login to the Bowl Cup Tournament on your mobile App'

    const message = {
        from: EmailSettings.account,
        to: email,
        subject: 'Your new Bowl Cup Tournament password',
        text: messageText,
    };

    server.send(message, function (error, message) {
        if (error) {
            console.log('Error sending new Password to ' + email + ' ' + error.message, error);
            response.json({
                success: false,
                error: error.message,
            })
        } else {
            console.log('New password sent to ' + message.header.to);
            response.json({
                success: true,
                error: '',
            })
        }
    });

}

const passwordReset = function(db, requestObject, response){
    const updateSQL = 'update users set user_password = $1 where user_email = $2';
    const theEmail = requestObject.user.user_email;
    if (theEmail.toLowerCase() === 'bowlcuptournament@gmail.com') {
        response.json({
            success: false,
            error: 'Invalid request',
        })
    } else {
        const newPassword = createNewPassword(5);
        db.query(updateSQL, [newPassword, theEmail], (error, results) => {
            if (error) {
                response.json({
                    success: false,
                    error: error.message,
                })
            } else {
                if (results.rowCount) {
                    forgotPasswordEmail(theEmail, newPassword, response);
                    
                } else {
                    response.json({
                        success: false,
                        error: theEmail + ' does not exist as a credential in the Bowl Cup',
                    })
                }
            }
        })
    }
}

const inviteGroupUsers = function (db, requestObject, response) {
    const sendInvitations = function (groupObject) {

        //const uriText = 'data:image/jpeg;base64,'
        //const scoreImage = fs.readFileSync(path.join(__dirname, EmailSettings.header_image))
        //const scoreImageBase64 = uriText + (new Buffer.from(scoreImage).toString('base64'));

        const pictureLocation = EmailSettings.destination + '/groups/' + groupObject.group_picture_location;
        console.log("Picture", pictureLocation);

        const mailSubject = requestObject.actionObject.user.user_name + ' has invited you to join ' + groupObject.group_name + ' in the ' + groupObject.group_season + ' Bowl Cup Tournament'
        const mailText = '<html><body><div style="display:inline-block; justify-content:center; text-align:center">';
        const mailHeader = '<img height="100" width="100" alt="' + groupObject.group_name + '" style="-webkit-border-radius:50%; -moz-border-radius:50%; border-radius:50%" src="' + pictureLocation  + '"></img>';
        const mailInvite = '<p>The Bowl Cup Tournament is a competition between you and your friends to determine who can pick the most winners during the College ' +
            'Football Bowl Season. Points are awarded for picking winners while covering the spread. The margin of victory matters, so a blowout is worth more than a close game. ' +
            'Points are deducted for losses and for not covering the spread. Your picks are ranked by confidence level, so the more confident you are...the more points you get for picking the winner.</p>';

        const groupLine = '<label>Group password:' + '<b>' + groupObject.group_password + '</b></label>';

        const linkLine = '<label>Go to <a href= ' + EmailSettings.destination + '>The Bowl Cup Tournament</a> to join the group</label>';
        const mailFooter = '<label>Do not reply to this email</label>'

        const messageHTML = mailText + mailHeader + '<br/><br/>' + mailInvite + '<br/><br/>' + groupLine + '<br/><br/>' + linkLine + '<br/><br/>' + mailFooter;

        const message = {
            //text: mailText,
            from: EmailSettings.account,
            to: groupObject.recipients,
            subject: mailSubject,
            attachment: { data: messageHTML, alternative: true },
        };

        //console.log(message);

        server.send(message, function (error, message) {
            if (error) {
                console.log('Error sending invitations to ' + groupObject.recipients + ' ' + error.message, error);
                response.json({
                    success: false,
                    error: error.message,
                })
            } else {
                console.log('Group:[' + groupObject.group_name + '] Invitations sent to ' + message.header.to) ;
                response.json({
                    success: true,
                    error: '',
                })
            }

        });
    }

    const getSQL = 'select group_name, group_password, group_season, group_picture_location from groups where group_id = $1';
    db.query(getSQL, [requestObject.actionObject.object_id], (error, results) => {
        if (error) {
            response.json({
                success: false,
                error: error.message,
            })
        } else {
            if (results.rows.length) {
                let groupObject = {
                    group_id: requestObject.actionObject.object_id,
                    group_name: results.rows[0].group_name,
                    group_password: results.rows[0].group_password,
                    group_season: results.rows[0].group_season,
                    group_picture_location: results.rows[0].group_picture_location,
                    recipients: requestObject.actionObject.messageRecipients,
                }
                sendInvitations(groupObject);
            } else {
                response.json({
                    success: false,
                    error: 'Cannot find group',
                })
            }
        }
    })
}

module.exports = {
    inviteGroupUsers,
    passwordReset,
    newUserEmail,
}