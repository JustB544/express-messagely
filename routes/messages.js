const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const Message = require("../models/message");
const {ensureCorrectUser, ensureLoggedIn} = require("../middleware/auth");

router.use(ensureLoggedIn);

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", async (req, res, next) => {
    const results = await db.query("SELECT to_username, from_username FROM messages WHERE id=$1", [req.params.id]);
    if (results.rows[0].to_username !== req.user.username && results.rows[0].from_username !== req.user.username){
        return next(new ExpressError("Unauthorized", 401));
    }
    return res.send(await Message.get(req.params.id));
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", async (req, res, next) => {
    return res.send(await Message.create({from_username: req.user.username, ...req.body}));
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", async (req, res, next) => {
    const results = await db.query("SELECT to_username FROM messages WHERE id=$1", [req.params.id]);
    if (results.rows[0].to_username !== req.user.username){
        return next(new ExpressError("Unauthorized", 401));
    }
    const body = (await Message.get(req.params.id)).body;
    await Message.markRead(req.params.id)
    return res.send(body);
});

module.exports = router;