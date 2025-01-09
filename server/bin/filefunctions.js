const fs = require('fs');
const path = require('path');
const testRoot = 'c:/projects/bowlcuptng/web/';
const genericPicture = require('./constants').genericPicture;

const userPictureLocation = path.join(testRoot, '/public/users/');
const groupPictureLocation = path.join(testRoot, '/public/groups');

const writeUserPicture = function (db, user_id, oldFileLocation, pictureObject, callback) {

    const prefix = user_id.toString() + '_';
    let base64Image = pictureObject.contents.split(';base64,').pop();
    if (oldFileLocation.length  && oldFileLocation !== genericPicture) {
        fs.unlink(userPictureLocation + oldFileLocation, (error) => {
            if (error) { console.log(oldFileLocation + ' cannot be deleted.') }
        })
    }
    const updateSQL = 'update users set user_picture_location = $1 where user_id = $2';
    db.query(updateSQL, [prefix + pictureObject.file, user_id], (error, results) => {
        if (error) {
            console.log("Error updating file location");
            if (callback) { callback() };
        } else {
            fs.writeFile(userPictureLocation + prefix + pictureObject.file, base64Image, { encoding: 'base64' }, function (error) {
                if (error) { console.log('Cannot write file ' + pictureObject.file) }
                if (callback) { callback()};
            })
        }
    })
}

const writeGroupPicture = function (db, group_id, oldFileLocation, pictureObject, callback) {
    const prefix = group_id + '_';
    let base64Image = pictureObject.contents.split(';base64,').pop();
    if (oldFileLocation.length && oldFileLocation !== genericPicture) {
        fs.unlink(groupPictureLocation + oldFileLocation, (error) => {
            if (error) { console.log(oldFileLocation + ' cannot be deleted.') }
        })
    }
    const updateSQL = 'update groups set group_picture_location = $1 where group_id = $2'
    db.query(updateSQL, [prefix + pictureObject.file, group_id], (error, results) => {
        if (error) {
            console.log("Error updating file location");
            if (callback) { callback() };
        } else {
            fs.writeFile(groupPictureLocation + prefix + pictureObject.file, base64Image, { encoding: 'base64' }, function (error) {
                if (error) { console.log('Cannot write file ' + pictureObject.file) }
                if (callback) { callback() };
            })
        }

    })
}


module.exports = {
    writeUserPicture,
    writeGroupPicture,
}