// Middleware for checking wheather the user is loggedin or not. 
const jwt = require("jsonwebtoken");

const TOKENSECRET = 'superSecretTokenOfQDineIn'

function isloggedin(req, res, next) {
    const token = req.headers.authtoken
    if (!token) {
        res.send("access denied");
    } else {
        const verified = jwt.verify(token, TOKENSECRET);
        req.user = verified;
        next();
    }
}

module.exports = isloggedin;
