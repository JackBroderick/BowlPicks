\Copy (select * from group_picks where group_id in (select group_id from user_groups_join where user_id = 1)) To 'block.csv' With CSV DELIMITER ',' HEADER;