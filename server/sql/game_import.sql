delete from games;
\copy games(season, game_date, network, bowl,location, home_id, visitor_id, home_record, visitor_record, spread, home_score, visitor_score) from 'games_current.csv' delimiter ',' csv header;
