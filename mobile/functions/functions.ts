import { iResponseObject, iRequestObject, iGroupObject, iLeaderBoardObject, iUserObject, iGameObject, iPickObject } from '../meta/interfaces';
//import cookie from 'react-cookies'; 
//import { Cookies } from './constants';
import { ResponseObject, RequestObject } from '../meta/constructors';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { PickerIOS } from 'react-native';

interface iFunctionObject {
    endpoint: string;
    method: string;
    function: Function;
    headers: { key: string; value: string;}
};

export const validateEmail:Function = function(emailString:string):boolean{
    return(emailString.includes('@') && emailString.includes('.') && emailString.length > 8)
}

export const getLeaderBoardPlace:Function = function(user:iUserObject, group:iGroupObject):{place:number, description:string}{
    const placeString:Function = function(place:number):string{
        switch(place){
            case 1:
                return place + 'st'
            case 2:
                return place + 'nd'
            case 3:
                return place + 'rd'
            default:
                return place + 'th'
        }
    }

    if (user &&  group.users){
        const sortedUsers:Array<iUserObject> = group.users.sort((a:iUserObject, b:iUserObject)=>((a.points??0) - (b.points??0)))
        if(sortedUsers.filter((fuser:iUserObject)=>(fuser.points === user.points)).length>1){
            return {
                place:sortedUsers.findIndex((fuser:iUserObject, index:number)=>(fuser.points===user.points))+1,
                get description(){ return 'Tied for ' + placeString(this.place) + ' place'}
            }
        }else{
            return {
                place:sortedUsers.findIndex((fuser:iUserObject, index:number)=>(fuser.points===user.points))+1,
                get description(){return placeString(this.place) + ' place'}
            }
        }
    }else{
        return {place:0, description:''}
    }
}

export const hashPassword: Function = function (password: string):number {
    const min = 10000;
    const max = 10000000;
    let hash: number = 0;
    for (let i: number = 0; i < password.length; i++) {
        hash = hash + password.charCodeAt(i) * i;
    }
    return ((Math.floor(Math.random() * (max - min) + min)) * hash) + 1559;
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

export const dayDifference:Function = function(endDate:Date, beginDate:Date):number{
    if(endDate){
        return(
            Math.floor(
                (
                    Math.abs(
                        Date.UTC(new Date(endDate).getFullYear(), new Date(endDate).getMonth(), new Date(endDate).getDate()) - Date.UTC(new Date(beginDate).getFullYear(), new Date(beginDate).getMonth(), new Date(beginDate).getDate())
                    )/1000/60/60/24
            )
        ))
    }else{
        return 0
    }
}

export const getUserPoints:Function= function(user:iUserObject){
    let points:number = 0
    if(user){
        for (let i:number = 0; i < (user.picks?.length||0); i++)
            {
                const pickPoints = user.picks&&user.picks[i]?(user.picks[i].points||0):0
                points = points + pickPoints
            }
        }
    return points;
}

export const goFetch: Function = function (requestObject: iRequestObject, functionObject: iFunctionObject, callback: Function): void {
    console.log("Fetch", functionObject);
        fetch(functionObject.endpoint, { method: functionObject.method, headers: functionObject.headers, body: JSON.stringify({ ...requestObject }) })
            .then((res:any) => (res.json()))
            .then((returnjson: iResponseObject) => {
                callback(returnjson);
            });
};

