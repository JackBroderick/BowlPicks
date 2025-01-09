const createToken = function () {
    const min = 100;
    const max = 1000000;
    return (Math.floor(Math.random() * (max - min) + min));
}

const hashPassword = function (password, passwordAttempt) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        hash = hash + password.charCodeAt(i) * i
    }
    let passwordInt = parseInt(passwordAttempt);
    passwordInt = passwordInt - 1559;
    return (passwordInt / hash) % 1 === 0;
}

const createNewPassword = function (length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    //result += new Date().getFullYear().toString();
    return result;
}


module.exports = {
    createToken,
    hashPassword,
    createNewPassword,
}