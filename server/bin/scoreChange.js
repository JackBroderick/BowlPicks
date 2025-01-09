const dateFormat = require('dateformat');
const schedule = require('node-schedule');
const gameTest = false;
let scheduleArray = [];


const scoreChange_New = function (game_id, theDB,  io) {
    const http = require('http');
    var str = '';
    var options = {
        host: 'site.api.espn.com',
        path: '/apis/site/v2/sports/football/college-football/scoreboard'
    };

    //site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard

    const callback = function (response) {

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            let result_json = JSON.parse(str);
            let game_scores = [];
            let game_score = {};
            let todayDate = dateFormat(new Date(), 'yyyy-m-d');

            function getGameStatus(statusJSON) {
                function interpretQuarter(quarter) {
                    if (quarter == 1) {
                        return "1st Quarter";
                    } else if (quarter == 2) {
                        return "2nd Quarter";
                    } else if (quarter == 3) {
                        return "3rd Quarter";
                    } else if (quarter == 4) {
                        return "4th Quarter";
                    } else if (quarter > 4) {
                        return "Overtime " + (quarter - 4);
                    }

                }

                if (statusJSON.period && statusJSON.type.description !== 'Halftime') {
                    if (statusJSON.type.completed) {
                        return 'Final';
                    } else {
                        return statusJSON.displayClock + ' - ' + interpretQuarter(statusJSON.period);
                    }
                } else {

                    return statusJSON.type.description;
                }
            }

            for (var i = 0; i < result_json.events.length; i++) {
                game_score = {
                    team1: result_json.events[i].competitions[0].competitors[0].team.displayName,
                    team1_abbreviation: result_json.events[i].competitions[0].competitors[0].team.abbreviation,
                    team1_score: parseInt(result_json.events[i].competitions[0].competitors[0].score),
                    team1_logolink: result_json.events[i].competitions[0].competitors[0].team.logo,
                    team1_object: result_json.events[i].competitions[0].competitors[0].team,
                    team2: result_json.events[i].competitions[0].competitors[1].team.displayName,
                    team2_abbreviation: result_json.events[i].competitions[0].competitors[1].team.abbreviation,
                    team2_logolink: result_json.events[i].competitions[0].competitors[1].team.logo,
                    team2_score: parseInt(result_json.events[i].competitions[0].competitors[1].score),
                    team2_object: result_json.events[i].competitions[0].competitors[1].team,
                }
                let gameDate = dateFormat(result_json.events[i].competitions[0].date, 'yyyy-m-d');
                if (gameDate == todayDate) {
                    let lastPlay = "";
                    try { lastPlay = result_json.events[i].competitions[0].situation.lastPlay.drive.description } catch (error) { lastPlay = "" };
                    game_scores.push({
                        game_number: i,
                        game_date: gameDate,
                        game_status: getGameStatus(result_json.events[i].status),
                        game_completed: result_json.events[i].status.type.completed,
                        game_score: game_score,
                        game_last_play: lastPlay
                    })
                }
            }
            if (game_scores.length) {
                updateScores_New(game_id, theDB, game_scores, io)
            };

        });
    }

    http.request(options, callback).end();

}

const updateScores_New = function (game_id, theDB, game_scores, io) {
    let theIO = io;
    theDB.serialize(function () {
        let todayGames = [];
        const gamesql = "select game_id, bowl, game_date, game_status, team1_symbol, team1_logolink, team1_score, team2_symbol, team2_logolink, team2_score from game_results where game_id = " + game_id;
        theDB.get(gamesql, function (err, row) {
            if (err) {
                console.log('Error accessing GAME_RESULTS for Game ID:' + game_id);
                return null;
            } else if (row) {
                todayGames = {
                    game_id: row.game_id,
                    bowl: row.bowl,
                    game_date: row.game_date,
                    game_status: row.game_status,
                    game_status_new: "",
                    game_last_play: "",
                    team1_symbol: row.team1_symbol,
                    team1_logolink: row.team1_logolink,
                    team1_score: row.team1_score,
                    team1_new_score: row.team1_score,
                    team2_symbol: row.team2_symbol,
                    team2_logolink: row.team2_logolink,
                    team2_score: row.team2_score,
                    team2_new_score: row.team2_score,
                };
                for (var j = 0; j < game_scores.length; j++) {
                    //console.log(game_scores);
                    if (getLogoID(todayGames.team1_logolink) == getLogoID(game_scores[j].game_score.team1_logolink)) {
                        todayGames.team1_new_score = game_scores[j].game_score.team1_score;
                        updateGameFields(j);
                    } else if (getLogoID(todayGames.team1_logolink) == getLogoID(game_scores[j].game_score.team2_logolink)) {
                        todayGames.team1_new_score = game_scores[j].game_score.team2_score;
                        updateGameFields(j);
                    }
                    if (getLogoID(todayGames.team2_logolink) == getLogoID(game_scores[j].game_score.team1_logolink)) {
                        todayGames.team2_new_score = game_scores[j].game_score.team1_score;
                        updateGameFields(j);
                    } else if (getLogoID(todayGames.team2_logolink) == getLogoID(game_scores[j].game_score.team2_logolink)) {
                        todayGames.team2_new_score = game_scores[j].game_score.team2_score;
                        updateGameFields(j);
                    }
                }

                let updatedGames = [];

                if (todayGames.team1_score !== todayGames.team1_new_score || todayGames.team2_score !== todayGames.team2_new_score || todayGames.game_status_new !== todayGames.game_status) {
                    const updateSQL = 'update games set team1_score = ' + todayGames.team1_new_score + ', team2_score = ' + todayGames.team2_new_score +
                        ', game_status = "' + checkGameStatus(todayGames.game_status_new, todayGames.game_status) + '" where game_id =' + todayGames.game_id;
                    updatedGames.push(todayGames);
                    console.log('Game Status update for ' + todayGames.bowl + ' (' + todayGames.game_id + ') : [' + todayGames.team1_symbol + ' - ' + todayGames.team1_new_score + ', ' + todayGames.team2_symbol + ' - ' + todayGames.team2_new_score + ']');
                    ///Send SQL to PostGres
                    theDB.run(updateSQL, (error) => {
                        if (error) {
                            console.log('Error updating ' + todayGames.bowl + '(' + todayGames.game_id + ')');
                            return null;
                        } else {
                            theIO.emit("refresh", { message: "score_update", updated_games: updatedGames });
                            return todayGames.game_status_new;
                        }
                    })

                } else {
                    return null;
                }

                function updateGameFields(gameIndex) {
                    todayGames.game_status_new = game_scores[gameIndex].game_status;
                    todayGames.game_last_play = game_scores[gameIndex].game_last_play;
                }

                function checkGameStatus(newGameStatus, oldGameStatus) {
                    if (!newGameStatus) {
                        return oldGameStatus;
                    } else {
                        return newGameStatus;
                    }
                }

                function getLogoID(logolink) {
                    try {
                        let logolinkarray = logolink.split('/');
                        let lastpart = logolinkarray[logolinkarray.length - 1];
                        let idarray = lastpart.split('.');
                        return parseInt(idarray[0]);
                    } catch (error) {
                        return "TBD";
                    }
                }
            }
        })
    })
}

function gameTimeCheck_New(rt_scoring, gameCheckInterval, gameDuration, dbfile, io) {
    if (rt_scoring) {
        console.log("Real Time Scoring is ON");
        if (gameTest) {
            checkFutureGames(dbfile, io, gameCheckInterval);
            return null;
        } else {
            if (scheduleArray.length) {
                for (let i = 0; i < scheduleArray.length; i++) {
                    if (scheduleArray[i]) {
                        scheduleArray[i].cancel();
                    }
                }
            }
            checkFutureGames(dbfile, io, gameCheckInterval, gameDuration, scoreChange);
            //return schedule.scheduleJob(outerScheduleRule, () => { checkFutureGames(dbfile, io, gameCheckInterval, gameDuration, scoreChange) });
        }
    } else {
        console.log("Real Time Scoring is OFF");
        return null;
    }


    function checkFutureGames(dbFile, io, rtInterval, gameDuration) {
        const useDate = new Date();
        //const useDate = new Date('12-1-2020');
        const sqlite = new require('sqlite3')
        const theDB = new sqlite.Database(dbFile);

        const useDateString = dateFormat(useDate, 'yyyy-mm-dd');

        console.log("Scanning for Scheduled Bowl Games************************");

        theDB.serialize(function () {
            let gameTimes = [];
            const futureGamesSQL = "select game_id, bowl, game_date, game_info as game_time, game_status from games where game_date >= '" + useDateString + "' order by game_date asc";
            theDB.each(futureGamesSQL, function (err, row) {
                if (err) {
                    console.log("Error accessing GAMES");
                } else {
                    let gameTime;
                    if (row.game_time.indexOf('AM') !== -1) {
                        gameTime = row.game_time.toUpperCase().split('AM')[0].trim();
                        if (gameTime.length === 4) { gameTime = '0' + gameTime };
                    } else if (row.game_time.indexOf('PM') !== -1) {
                        const gameTime_12h = row.game_time.toUpperCase().split('PM')[0].trim();
                        let gameTime_hours = parseInt(gameTime_12h.split(':')[0]) + 12;
                        if (gameTime_hours === 24) { gameTime_hours = 12 };
                        gameTime = gameTime_hours + gameTime_12h.slice(gameTime_12h.indexOf(':'));
                    } else {
                        gameTime = '12:00';
                    }
                    console.log(row.game_date, row.bowl, row.game_time, row.game_status ? row.game_status : ' - Scheduling for Real Time Scoring');
                    if (!['Canceled', 'Final'].includes(row.game_status)) {
                        const fullGameTime = new Date(row.game_date + 'T' + gameTime);
                        if (dateFormat(fullGameTime, 'yyyy-mm-dd') >= dateFormat(useDate, 'yyyy-mm-dd')) {
                            gameTimes.push({
                                game_id: row.game_id,
                                bowl: row.bowl,
                                game_time: fullGameTime,
                                game_status: row.game_status,
                                schedule_job: null
                            })
                        };
                    }
                }
            }, function () {
                    if (gameTimes.length) {
                        console.log('*********************************************************');
                        for (let i = 0; i < gameTimes.length; i++)
                        {
                            console.log(gameTimes[i].bowl + ' (' + gameTimes[i].game_id + ') Scheduled to Begin: ' + dateFormat(gameTimes[i].game_time));
                            //console.log(dateFormat(gameTimes[i], 'yyyy-mm-dd:HH:MM'), dateFormat(useDate, 'yyyy-mm-dd:HH:MM'), dateFormat(gameTimes[i], 'yyyy-mm-dd:HH:MM') <= dateFormat(useDate, 'yyyy-mm-dd:HH:MM') );
                            if (dateFormat(gameTimes[i].game_time, 'yyyy-mm-dd:HH:MM') <= dateFormat(useDate, 'yyyy-mm-dd:HH:MM')) {
                                gameTimes[i].game_time = useDate.setSeconds(useDate.getSeconds() + 30);
                            };
                            scheduleArray.push(schedule.scheduleJob(gameTimes[i].game_time, () => {
                                console.log(gameTimes[i].bowl + ' (' + gameTimes[i].game_id + '): Polling Interval - ' + rtInterval / 60 / 1000 + ' Minutes <=> Game Duration - ' + gameDuration / 60 / 60 / 1000 + ' Hours');
                                gameTimes[i].schedule_job = setInterval(() => {
                                    gameTimes[i].game_status = scoreChange_New(gameTimes[i].game_id, theDB, io);
                                    if (['Canceled', 'Final'].includes(gameTimes[i].game_status)){
                                        clearInterval(gameTimes[i])
                                        console.log(gameTimes[i].bowl + ' Status: ' + gameTimes[i].game_status + ' - Real Time Scoring Terminated');
                                    };
                                }, rtInterval);
                                setTimeout(() => {
                                    console.log(gameTimes[i].bowl + '(' + gameTimes[i].game_id + '): Real Time Scoring Terminated');
                                    clearInterval(gameTimes[i].schedule_job);
                                    scheduleArray[i].cancel();
                                }, gameDuration);
                            }));
                        };
                        console.log('*********************************************************');
                    } else {
                        console.log('No Games Scheduled as of ' + dateFormat(useDate, 'mmm d, yyyy'));
                    }
            })
        })
    }
}

module.exports = { gameTimeCheck_New };