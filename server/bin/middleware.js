
const normalizePort = function (val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    } else if (port >= 0) {
        // port number
        return port;
    } else {
        return false;
    }
};

const logger = function (request, response, next) {
    console.log('request -(' + request.method + '):',request.url, request.body);
    next();
};

const cryptoFunction = function (request, response, next) {
    //token = user.token * rnd * user_id + 1559
    //mod 0
    function deCrypt(token, user) {
        if (user.user_id && user.user_token) {
            const userToken = (user.user_id * user.user_token) ? user.user_id * user.user_token : 1;
            const stripToken = token - 1559;
            if ((stripToken / userToken) % 1 === 0) {
                return true;
            } else {
                return false;
            }
        } else {
            if ((token / 1559) % 1 === 0) {
                return true;
            }else {
                return false;
            }
        }
    };

    if (request.body.length) {
        if (deCrypt(request.body.token, request.body.user)) {
            next();
        } else {
            response.json({
                success: false,
                token: 0,
                error: "Invalid Token",
                isAuthenticated: false,
            })
        }
    } else {
        next();
    }
};

const crashProtect = function (error, request, response, next) {
    console.log(error);
    response.json({
        success: false,
        token: 0,
        error: "Invalid Request",
        user: null,
    })
};

module.exports = {
    normalizePort,
    logger,
    cryptoFunction,
    crashProtect,
}