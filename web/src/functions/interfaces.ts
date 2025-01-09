
interface iUserObject {
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
	groups?: Array<iGroupObject>;
	picks?: Array<iGameObject>;
	picture?: iPictureObject|null
};

interface iGroupObject {
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
	pick_id?: number;
	pick_confidence?: number;
	game_index?: number;
	spread: number;
	points?: number;
};

interface iPicksObject {
	user_id: number;
	group_id: number;
	game_id: number;
	pick_id: number | undefined;
	pick_confidence: number | undefined;
};

interface iResponseObject {
	user: iUserObject;
	success: boolean;
	error: string;
	isAuthenticated: boolean;
	pending_games?: Array<iGameObject>;
	root?: {
		games: Array<iGameObject>;
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
	picks?: iPicksObject;
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

interface iJSONKeyPair {
	key: string;
	value: string | number | boolean ;
}

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
	logonStatus:boolean;
	appData:iResponseObject;
	_logonStatus:Function;
	_appData:Function;
}

export type {
	iResponseObject,
	iRequestObject,
	iActionObject,
	iUserObject,
	iTeamObject,
	iGameObject,
	iGroupObject,
	iPictureObject,
	iSmackObject,
	iPicksObject,
	iSocketObject,
	iUpdateResponseObject,
	iLeaderBoardObject,
	iJSONKeyPair,
	iComponentProps,
	iGameManagerObject,
	iGlobalStatusContext
};