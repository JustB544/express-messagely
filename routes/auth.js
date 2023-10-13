const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {SECRET_KEY} = require("../config");


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async (req, res, next) => {
    try {
        if (await User.authenticate(req.body.username, req.body.password)){
            await User.updateLoginTimestamp(req.body.username);
            let token = jwt.sign({ username: req.body.username }, SECRET_KEY);
            return res.json({ token });
        }
        throw new ExpressError("Invalid user/password", 400);
    } 
    catch(err) {
        return next(err);
    }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login! B- The tests fail if I don't default a last_login so maybe rethink that
 */

router.post("/register", async (req, res, next) => {
    try {
        await User.register(req.body);
        let token = jwt.sign({ username: req.body.username }, SECRET_KEY);
        return res.send({ token });
    }
    catch(err) {
        return next(err);
    }
});

module.exports = router;