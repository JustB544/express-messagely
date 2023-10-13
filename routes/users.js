const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const User = require("../models/user");
const {ensureCorrectUser} = require("../middleware/auth");


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get("/", async (req, res, next) => {
    return res.send(await User.all());
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get("/:username", async (req, res, next) => {
    return res.send(await User.get(req.params.username));
});

router.use(ensureCorrectUser);

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/to", async (req, res, next) => {
    return res.send(await User.messagesTo(req.params.username));
});


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/from", async (req, res, next) => {
    return res.send(await User.messagesFrom(req.params.username));
});

module.exports = router;
