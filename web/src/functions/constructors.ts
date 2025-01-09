import{
	iUserObject,
	iResponseObject,
	iRequestObject,
	iGameObject,
	iGroupObject,
	iTeamObject,
	iActionObject,
	iSmackObject,
	iPicksObject,
	iPictureObject,
	}
	from './interfaces';

class UserObject implements iUserObject {
	constructor(user:iUserObject|null = null) {
		if (user) {
			//this.user_password = user.user_password;
			this.user_id = user.user_id;
			this.user_token = user.user_token;
			this.user_name = user.user_name ? user.user_name : '';
			this.user_alias = user.user_alias ? user.user_alias : '';
			this.user_email = user.user_email ? user.user_email : '';
			this.user_sms = user.user_sms ? user.user_sms : '';
			this.user_root = user.user_root ? user.user_root : false;
			this.user_participating = user.user_participating ? user.user_participating : true;
			this.user_subscribed = user.user_subscribed ? user.user_subscribed : false;
			this.user_sms_contact = user.user_sms_contact ? user.user_sms_contact : false;
			this.user_picture_location = user.user_picture_location ? user.user_picture_location : '_generic.png';
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
	groups?: Array<iGroupObject>;
	picks?: Array<iGameObject>;
	picture?: iPictureObject|null;
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
		} else {
			this.group_id = 0;
			this.group_name = 'My Group';
			this.group_admin_id = 0;
			this.group_season = new Date().getFullYear();
			this.group_active = true;
			this.group_password = '';
			this.confidence_mode = true;
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
	pick_confidence?: number;
	pick_id?: number;
	game_index?: number;
	spread: number;
	points?: number;
};

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
		games: Array<iGameObject>;
		groups: Array<iGroupObject>;
		teams: Array<iTeamObject>;
		bowls: Array<string>;
		venues: Array<string>;
		networks: Array<string>;
	};
}

class ActionObject implements iActionObject {
	constructor(object_id:number|Array<number>, smack:iSmackObject|null=null, user:iUserObject|null=null, group:iGroupObject|null=null, messageRecipients:Array<string>|null) {
		this.object_id = object_id;
		if (smack) { this.smack = smack };
		if (user) { this.user = user };
		if (group) { this.group = group };
		if (messageRecipients) {this.messageRecipients = messageRecipients}
	}
	object_id: number | Array<number>;
	user?: iUserObject;
	game?: iGameObject;
	group?: iGroupObject;
	picks?: iPicksObject;
	smack?: iSmackObject;
	messageRecipients?: Array<string>;
}

class RequestObject implements iRequestObject {
	constructor(userObject: iUserObject | null = null, object_id: number | Array<number> = -1, smack: iSmackObject | null = null,
		user: iUserObject | null = null, group: iGroupObject | null = null, messageRecipients:Array<string>|null = null) {
		this.user = new UserObject();
		if (userObject) {
			this.user.user_id = userObject.user_id;
			this.user.user_token = userObject.user_token;
		} 
		if (object_id !== -1) {
			this.actionObject = new ActionObject(object_id, smack, user, group, messageRecipients);
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
	GameObject
};