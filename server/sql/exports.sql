select team_id, replace(replace(logo_link,'http://a.espncdn.com/i/teamlogos/ncaa/med/trans/',''),'.gif','') 
as espn_id, trim(school_name) as school_name, trim(team_symbol) as team_symbol, trim(team_name) as team_name, trim(search_name) as search_name, trim(link) as link, trim(logo_link) as logo_link from teams;



select 1212 as espn_game_id, year as season, date('now') as game_date, bowl, location, 'ESPN' as network, game_status, 'Touchdown' as last_play,
true as possession,team1 as home_id, 3 as home_rank, team1_record as home_record ,team2 as visitor_id, 5 as visitor_rank, team2_record as visitor_record, spread, team1_score as home_score,
team2_score as visitor_score from games;

\copy (select * from users left outer join group_picks_new on users.user_id = group_picks_new.pick_user_id where users.user_participating = true) to 'block_new.csv' csv header;

select users.*, groups.* from users, groups, user_groups_join where user_groups_join.user_id = users.user_id and user_groups_join.group_id = groups.group_id; 