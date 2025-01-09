import { iResponseObject, iRequestObject, iGroupObject, iLeaderBoardObject, iUserObject, iGameObject } from './interfaces';
//import cookie from 'react-cookies'; 
//import { Cookies } from './constants';
import { ResponseObject, RequestObject } from './constructors';

interface iFunctionObject {
    endpoint: string;
    method: string;
    function: Function;
    headers: { key: string; value: string;}
};

export const validateEmail:Function = function(emailString:string):boolean{
    return(emailString.includes('@') && emailString.includes('.') && emailString.length > 8)
}

export const getGroupLeaderBoard: Function = function (group: iGroupObject | null): Array<iLeaderBoardObject>{
    let lbArray: Array<iLeaderBoardObject> = [];
    if (group?.users) {
        for (let i: number = 0; i < group.users.length; i++) {
            let lbUser: iUserObject = group.users[i];
            if (lbUser.picks) {
                let lbScore: number = 0;
                for (let j: number = 0; j < lbUser.picks.length; j++) {
                    let lbGame: iGameObject = lbUser.picks[j];
                    if (lbGame.points) { lbScore = lbScore + lbGame.points };
                }
                lbArray.push({
                    user_id: lbUser.user_id,
                    group_id: group.group_id,
                    user_name: lbUser.user_name ? lbUser.user_name : 'No User Name',
                    user_alias: lbUser.user_alias ? lbUser.user_alias : 'No User Alias',
                    user_picture_location: lbUser.user_picture_location ? lbUser.user_picture_location : '',
                    total_points: lbScore,
                })
            }
        }
        lbArray = lbArray.sort((item1: iLeaderBoardObject, item2: iLeaderBoardObject) => (
            item2.total_points - item1.total_points
        ))
        return lbArray;
    } else {
        return [];
    }
};

export const hashPassword: Function = function (password: string):number {
    const min = 10000;
    const max = 10000000;
    let ag: number = 0;
    for (let i: number = 0; i < password.length; i++) {
        ag = ag + password.charCodeAt(i) *i;
    }
    return ((Math.floor(Math.random() * (max - min) + min)) * ag) + 1559;
};

export const scramblePassword: Function = function (password: string): String {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let result:string = '';
    for (let i = 0; i < 7; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result + password;
}

export const goFetch: Function = function (requestObject: iRequestObject, functionObject: iFunctionObject, callback: Function): void {
    console.log("Fetch", functionObject);
        fetch(functionObject.endpoint, { method: functionObject.method, headers: functionObject.headers, body: JSON.stringify({ ...requestObject }) })
            .then((res:any) => (res.json()))
            .then((returnjson: iResponseObject) => {
                callback(returnjson);
            });
};

