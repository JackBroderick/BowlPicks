import{
	iUserObject,
	iResponseObject,
	iRequestObject,
	iGameObject,
	iGroupObject,
	iTeamObject,
	iActionObject,
	iSmackObject,
	iPickObject,
	iPictureObject,
	}
	from './interfaces';


class UserObject implements iUserObject {
	constructor(user:iUserObject|null = null) {
		if (user) {
			//this.user_password = user.user_password;
			this.user_id = user.user_id;
			this.user_token = user.user_token;
			this.user_name = user.user_name??'';
			this.user_alias = user.user_alias??'';
			this.user_email = user.user_email??'';
			this.user_sms = user.user_sms??'';
			this.user_root = user.user_root??false;
			this.user_participating = user.user_participating??true;
			this.user_subscribed = user.user_subscribed??false;
			this.user_sms_contact = user.user_sms_contact?? false;
			this.user_picture_location = user.user_picture_location?? '_generic.png';
			this.user_group_pick_all = user.user_group_pick_all??true
		} else {
			this.user_id = 0;
			this.user_token = 0;
        }
	}
	user_id: number;
	user_token: number;
	user_password?: string;
	user_name?: string;
	user_alias?: string;
	user_email?: string;
	user_sms?: string;
	user_root?: boolean;
	user_participating?: boolean;
	user_subscribed?: boolean;
	user_sms_contact?: boolean;
	user_picture_location?: string;
	user_group_pick_all?:boolean;
	groups?: Array<iGroupObject>;
	picks?: Array<iPickObject>;
	picture?: iPictureObject|null;
	points?:number;
};

class GroupObject implements iGroupObject {
	constructor(group: iGroupObject | null = null, smack: Array<iSmackObject> | null = null) {
		if (group) {
			this.group_id = group.group_id;
			this.group_name = group.group_name;
			this.group_password = group.group_password;
			this.group_admin_id = group.group_admin_id;
			this.group_season = group.group_season;
			this.group_active = group.group_active;
			this.confidence_mode = group.confidence_mode;
			this.users = group.users;
			this.group_picture_location = group.group_picture_location ? group.group_picture_location : '_generic.png';
			smack ? this.smack = smack : this.smack = group.smack;
			this.score_win_points = group.score_win_points;
			this.score_cover_points = group.score_cover_points;
			this.score_margin_points = group.score_margin_points;
			this.score_margin_spread_adjusted_points = group.score_margin_spread_adjusted_points
		} else {
			this.group_id = 0;
			this.group_name = 'My Group';
			this.group_admin_id = 0;
			this.group_season = new Date().getFullYear();
			this.group_active = true;
			this.group_password = '';
			this.confidence_mode = true;
			this.score_win_points = 10;
			this.score_cover_points = 5;
			this.score_margin_points = false;
			this.score_margin_spread_adjusted_points = true;
        }
	}
	group_id: number;
	group_name: string;
	group_password: string;
	group_admin_id: number;
	group_season: number;
	group_active: boolean;
	confidence_mode: boolean;
	group_picture_location?: string;
	users?: Array<iUserObject>;
	smack?: Array<iSmackObject>;
	picture?: iPictureObject | null;
	score_win_points:number;
	score_cover_points:number;
	score_margin_points:boolean;
	score_margin_spread_adjusted_points:boolean;
}

class SmackObject implements iSmackObject {
	constructor(user:iUserObject, smack:string) {
		this.smack_id = 0;
		this.smack_time =  new Date();
		this.user_id = user.user_id;
		this.smack = smack;
	}
	smack_id: number;
	smack_time: Date;
	user_id: number;
	user_alias?: string;
	user_name?: string;
	user_picture_location?: string;
	smack: string;
}

class TeamObject implements iTeamObject {
	constructor() {
		this.team_id = 0;
		this.espn_team_id = 0;
		this.school_name = '';
		this.team_symbol = '';
		this.team_name = '';
		this.search_name = '';
		this.link = '';
		this.logo_link = '';
		this.team_rank = 0;
		this.team_record = '';
		this.score = 0;
		this.points = 0;
		this.pick = false;
	}
	team_id: number;
	espn_team_id: number;
	school_name: string;
	team_symbol: string;
	team_name: string;
	search_name: string;
	link: string;
	logo_link: string;
	team_rank: number;
	team_record: string;
	score: number;
	points: number;
	pick: boolean;
}

class GameObject implements iGameObject {
	constructor() {
		this.game_id = 0;
		this.espn_game_id = -0;
		this.season = 0;
		this.game_date = new Date();
		this.bowl = '';
		this.location =  '';
		this.network = '';
		this.game_status = '';
		this.last_play = '';
		this.possession = 0;
		this.home_team = new TeamObject();
		this.visitor_team = new TeamObject();
		this.spread = 0;
	}
	game_id: number;
	espn_game_id: number;
	season: number;
	game_date: Date | null;
	bowl: string;
	location: string;
	network: string;
	game_status: string;
	last_play: string;
	possession: number;
	home_team: iTeamObject;
	visitor_team: iTeamObject;
	spread: number;
};

class PickObject implements iPickObject{
	constructor(userID:number, groupID:number, gameID:number, pickID:number){
		this.user_id = userID;
		this.group_id = groupID;
		this.game_id = gameID;
		this.pick_id = pickID;
	}
	user_id:number;
	group_id:number;
	game_id:number;
	pick_id:number;
	pick_confidence?:number;
}

class ResponseObject implements iResponseObject {
	constructor() {
		this.user = new UserObject();
		this.success = false;
		this.error = '';
		this.isAuthenticated = false;
	}
	user: iUserObject;
	success: boolean;
	error: string;
	isAuthenticated: boolean;
	pending_games?: Array<iGameObject>;
	root?: {
		groups: Array<iGroupObject>;
		teams: Array<iTeamObject>;
		bowls: Array<string>;
		venues: Array<string>;
		networks: Array<string>;
	};
}

class ActionObject implements iActionObject {
	constructor(object_id:number|Array<number>, 
				smack:iSmackObject|null=null, 
				user:iUserObject|null=null, 
				group:iGroupObject|null=null, 
				pick:iPickObject|null = null,
				) 
	{
		this.object_id = object_id;
		if (smack) { this.smack = smack };
		if (user) { this.user = user };
		if (group) { this.group = group };
		if (pick) {this.pick = pick};
	}
	object_id: number | Array<number>;
	user?: iUserObject;
	game?: iGameObject;
	group?: iGroupObject;
	pick?: iPickObject;
	smack?: iSmackObject;
}

class RequestObject implements iRequestObject {
	constructor(
			userObject: iUserObject | null = null, 
			object_id: number | Array<number> = -1, 
			smack: iSmackObject | null = null,
			user: iUserObject | null = null, 
			group: iGroupObject | null = null, 
			pick:iPickObject|null = null
		) 
		{
		this.user = new UserObject();
		if (userObject) {
			this.user.user_id = userObject.user_id;
			this.user.user_token = userObject.user_token;
		} 
		if (object_id !== -1) {
			this.actionObject = new ActionObject(object_id, smack, user, group, pick);
        }
		const min: number = 100;
		const max: number = 100000;
		if (this.user.user_id && this.user.user_token) {
			this.token = (Math.floor(Math.random() * (max - min) + min)) * this.user.user_token * this.user.user_id + 1559;
		} else {
			this.token = (Math.floor(Math.random() * (max - min) + min)) * 1559;
        }
	}
	token: number;
	user: iUserObject;
	actionObject?: iActionObject;
}

export {
	GroupObject,
	ResponseObject,
	RequestObject,
	SmackObject,
	UserObject,
	GameObject,
	PickObject
};