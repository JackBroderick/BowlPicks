
interface iObjectKeys{
	[key:string]:any|unknown;
}

interface iUserObject extends iObjectKeys{
	user_id: number;
	user_password?: string;
	user_name?: string;
	user_alias?: string;
	user_email?: string;
	user_sms?: string;
	user_root?: boolean;
	user_participating?: boolean;
	user_token: number;
	user_subscribed?: boolean;
	user_sms_contact?: boolean;
	user_picture_location?: string;
	user_group_pick_all?:boolean;
	groups?: Array<iGroupObject>;
	picks?: Array<iPickObject>;
	picture?: iPictureObject|null;
	points?:number
};

interface iGroupObject extends iObjectKeys{
	group_id: number;
	group_name: string;
	group_password: string;
	group_admin_id: number;
	group_season: number;
	group_active: boolean;
	group_picture_location?: string;
	confidence_mode: boolean;
	users?: Array<iUserObject>;
	smack?: Array<iSmackObject>;
	picture?: iPictureObject | null;
	score_win_points:number;
	score_cover_points:number;
	score_margin_points:boolean;
	score_margin_spread_adjusted_points:boolean;
};

interface iPictureObject {
	file: string;
	contents: string | ArrayBuffer | null;
}

interface iTeamObject {
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
	possession?: boolean;
	score?: number;
	points?: number;
	pick?: boolean;
};

interface iGameObject {
	game_id: number;
	espn_game_id: number;
	season: number;
	game_date: Date|null;
	bowl: string;
	location: string;
	network: string;
	game_status: string;
	last_play?: string;
	home_team: iTeamObject;
	visitor_team: iTeamObject;
	spread: number;
};

interface iPickObject {
	user_id:number;
	group_id: number;
	game_id: number;
	pick_id: number;
	points?: number;
	pick_confidence?:number;
};

interface iResponseObject extends iObjectKeys{
	user: iUserObject;
	success: boolean;
	error: string;
	isAuthenticated: boolean;
	games?: Array<iGameObject>;
	root?: {
		teams: Array<iTeamObject>;
		bowls: Array<string>;
		venues: Array<string>;
	};
};

interface iUpdateResponseObject{
	success: boolean;
	error: string;
	smack?: Array<iSmackObject>;
	return_id?: number;
};

interface iActionObject{
	object_id: number | Array<number>;
	user?: iUserObject;
	game?: iGameObject;
	group?: iGroupObject;
	pick?: iPickObject;
	smack?: iSmackObject;
	messageRecipients?: Array<string>;
};

interface iRequestObject {
	token: number;
	user: iUserObject;
	actionObject?: iActionObject;
};

interface iSmackObject {
	smack_id: number;
	smack_time: Date;
	user_id: number;
	user_alias?: string;
	user_name?: string;
	user_picture_location?: string;
	smack: string;
};

interface iSocketObject {
	message: string;
	object_id?: number;
};

interface iLeaderBoardObject {
	user_id: number;
	group_id: number;
	user_name: string;
	user_alias: string;
	user_picture_location: string;
	total_points: number;
};

interface iComponentProps {
	dataObject: iResponseObject;
	updateFunction: Function;
};

interface iGameManagerObject {
	zoomScale: number;
	viewMode: string;
	tournamentStarted: boolean;
	showCalendar: boolean;
	itsMe: boolean;
}

interface iGlobalStatusContext{
	logonStatus:boolean|undefined;
	tournamentStarted:boolean|undefined;
	appData:iResponseObject|undefined;
	selectedGroup:iGroupObject|undefined;
	storeAvailable:boolean;
	defaultGroup:number;
	_storeAvailable:Function;
	_defaultGroup:Function;
	_logonStatus:Function;
	_tournamentStarted:Function;
	_appData:Function;
	_selectedGroup:Function;
}

export type {
	iObjectKeys,
	iResponseObject,
	iRequestObject,
	iActionObject,
	iUserObject,
	iTeamObject,
	iGameObject,
	iGroupObject,
	iPictureObject,
	iSmackObject,
	iPickObject,
	iSocketObject,
	iUpdateResponseObject,
	iLeaderBoardObject,
	iComponentProps,
	iGameManagerObject,
	iGlobalStatusContext
};