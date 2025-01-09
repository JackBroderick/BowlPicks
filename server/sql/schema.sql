drop view if exists networks;
drop view if exists bowls;
drop view if exists venues;
drop view if exists group_smack;
drop view if exists user_totals;
drop view if exists user_results;
drop view if exists group_picks;
drop view if exists group_picks_all;
drop view if exists group_picks_details
drop view if exists group_picks_new;
drop view if exists user_groups;
drop view if exists game_results;
drop table if exists smack;
drop table if exists picks;
drop table if exists games;
drop table if exists teams;
drop table if exists groups;
drop table if exists user_groups_join;
drop table if exists users;

create table users (
	user_id SERIAL PRIMARY KEY,
	user_password TEXT,
	user_name TEXT,
	user_alias TEXT,
	user_email TEXT,
	user_sms TEXT,
	user_root BOOLEAN,
	user_participating BOOLEAN,
	user_token INT,
	user_subscribed BOOLEAN,
	user_sms_contact BOOLEAN,
	user_picture_location TEXT,
	user_group_pick_all BOOLEAN
);

create table groups (
	group_id SERIAL PRIMARY KEY,
	group_name TEXT,
	group_password TEXT,
	group_admin_id INT REFERENCES users(user_id),
	group_season INT,
	group_active BOOLEAN,
	confidence_mode BOOLEAN,
	group_picture_location TEXT,
	score_win_points INT,
	score_cover_points INT,
	score_margin_points BOOLEAN,
	score_margin_spread_adjusted_points BOOLEAN
);

create table user_groups_join (
	user_id INT,
	group_id INT
);

create table teams (
	team_id SERIAL PRIMARY KEY,
	espn_team_id INT,
	school_name TEXT,
	team_symbol TEXT,
	team_name TEXT,
	search_name TEXT,
	link TEXT,
	logo_link TEXT
);

create table games (
	game_id SERIAL PRIMARY KEY,
	espn_game_id INT,
	season INT,
	game_date TIMESTAMP,
	bowl TEXT,
	location TEXT,
	network TEXT,
	game_status TEXT,
	last_play TEXT,
	possession INT,
	home_id INT REFERENCES teams(team_id),
	home_rank INT,
	home_record TEXT,
	visitor_id INT REFERENCES teams(team_id),
	visitor_rank INT,
	visitor_record TEXT,
	spread NUMERIC, --Spread is relative to the home team
	home_score INT,
	visitor_score INT
);

create table picks (
	user_id INT REFERENCES users(user_id),
	game_id INT REFERENCES games(game_id),
	pick_id INT REFERENCES teams(team_id),
	group_id INT REFERENCES groups(group_id),
	pick_confidence INT
);

create table smack (
	smack_id SERIAL PRIMARY KEY,
	smack_time TIMESTAMP,
	group_id INT REFERENCES groups(group_id),
	user_id INT REFERENCES users(user_id),
	smack TEXT
);

create view bowls as (
	select distinct(bowl) from games order by bowl asc
);

create view venues as (
	select distinct(location) from games order by location asc
);

create view networks as (
	select distinct(network) from games order by network asc
);

create view group_smack as (
	select smack.*, users.user_alias, users.user_name, users.user_picture_location
	from smack, users
	where smack.user_id = users.user_id
	order by smack_time desc
);

create view user_groups as (
	select users.*, groups.*, user_groups_join.user_id as join_user_id, user_groups_join.group_id as join_group_id
	from users, groups, user_groups_join 
	where user_groups_join.user_id = users.user_id 
	and user_groups_join.group_id = groups.group_id
	and users.user_participating = true
);

create view game_results as ( 
	select games.*, 
	home.school_name as home_school_name, home.team_symbol as home_team_symbol, home.team_name as home_team_name, home.search_name as home_search_name, home.link as home_link, home.logo_link as home_logo_link, home.espn_team_id as home_espn_team_id,
	visitor.school_name as visitor_school_name, visitor.team_symbol as visitor_team_symbol, visitor.team_name as visitor_team_name, visitor.search_name as visitor_search_name, visitor.link as visitor_link, visitor.logo_link as visitor_logo_link,visitor.espn_team_id as visitor_espn_team_id,
	(games.home_score + games.spread - games.visitor_score) as home_points, (games.visitor_score - games.spread - games.home_score) as visitor_points -- Scoring is spread adjusted score differential
	from games
	join teams home on home.team_id=games.home_id
	join teams visitor on visitor.team_id=games.visitor_id
	where games.season = (select max(season) from games)
	order by season
);

--New SQL as of 11/14/2021

create view group_picks as (
	select picks.user_id as picks_user_id, picks.game_id, picks.pick_id, picks.pick_confidence, games.home_id, games.home_score, games.visitor_id, games.visitor_score, games.spread, groups.group_id as picks_group_id
	from picks, games, groups
	where picks.game_id = games.game_id 
	and picks.group_id = groups.group_id 
	and groups.group_active = true
	and (groups.group_season = (select max(group_season) from groups) or groups.group_season is null)
);

create view group_picks_details as (
	select * from user_groups
	full outer join group_picks
	on user_groups.user_id = group_picks.picks_user_id 
	and user_groups.group_id = group_picks.picks_group_id
);

--##########


--Need to be dropped

create view group_picks_new as (
	select picks.pick_id, picks.pick_confidence, game_results.*, users.user_id as picks_user_id, groups.group_id as picks_group_id
	from picks, game_results, groups, users
	where picks.user_id = users.user_id 
	and picks.game_id = game_results.game_id 
	and picks.group_id = groups.group_id 
	and groups.group_active = true
	and (groups.group_season = (select max(group_season) from groups) or groups.group_season is null)
);


create view group_picks_all as (
	select * from user_groups
	full outer join group_picks_new
	on user_groups.user_id = group_picks_new.picks_user_id 
	and user_groups.group_id = group_picks_new.picks_group_id
);

--########

--######## Legacy - need to be dropped

create view user_results as (
	select picks.user_id, picks.pick_id as pick_id, users.user_name, users.user_alias, users.user_email, users.user_sms, users.user_participating, groups.*, game_results.*, game_results.home_points as total_points
	from picks
	join game_results on picks.pick_id = game_results.home_id
	join users on picks.user_id = users.user_id
	join groups on picks.group_id = groups.group_id
	union
	select picks.user_id, picks.pick_id as pick_id, users.user_name, users.user_alias, users.user_email, users.user_sms, users.user_participating, groups.*, game_results.*, game_results.visitor_points as total_points
	from picks
	join game_results on picks.pick_id = game_results.visitor_id
	join users on picks.user_id = users.user_id
	join groups on picks.group_id = groups.group_id
	order by season, group_id, user_id desc
);

--##########

create view user_totals as (
	select season, group_id, group_name, user_id, user_name, user_alias, sum(total_points) as total_points from user_results
	where user_participating = true
	group by season, group_id, group_name, user_name, user_alias, user_id
);

insert into users (user_password, user_name, user_alias,user_email, user_sms, user_root, user_participating, user_subscribed, user_sms_contact, user_token, user_picture_location) values ('cb155900','bcadmin','Bowl Cup Administrator','bowlcuptournament@gmail.com','703-415-6266',true,true, false, true,1111, '_generic.png');
insert into groups (group_name, group_password, group_admin_id, group_active) values ('root', '_rootadmin_', 1, true);
insert into user_groups_join (user_id, group_id) values (1,1);

\copy teams(team_id, espn_team_id, school_name, team_symbol, team_name, search_name, link, logo_link) from 'teams_2-2-2021.csv' delimiter ',' csv header;
\copy games(espn_game_id, season, game_date, bowl,location, network, game_status, last_play, possession, home_id, home_rank, home_record, visitor_id, visitor_rank, visitor_record, spread, home_score, visitor_score) from 'games_test.csv' delimiter ',' csv header;

--\copy users(user_password, user_name, user_alias, user_email, user_sms, user_root, user_participating, user_token, user_subscribed, user_sms_contact, user_picture_location) from 'users.csv' delimiter ',' csv header;
--\copy groups(group_name, group_password, group_admin_id, group_season, group_active, confidence_mode) from 'groups.csv' delimiter ',' csv header;
--\copy user_groups_join(user_id, group_id) from 'user_groups.csv' delimiter ',' csv header;
--\copy picks(user_id, game_id, pick_id, group_id, pick_confidence) from 'picks.csv' delimiter ',' csv header;


