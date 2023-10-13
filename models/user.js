/** User class for message.ly */

const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");
const {BCRYPT_WORK_FACTOR} = require("../config");


/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const hash = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const results = await db.query(
      `INSERT INTO users (
            username,
            password,
            first_name,
            last_name,
            phone)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING username, password, first_name, last_name, phone;`,
      [username, hash, first_name, last_name, phone]);
      return results.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const results = await db.query("SELECT password FROM users WHERE username=$1;", [username]);
    if (results.rows.length === 0){
      return false;
    }
    return await bcrypt.compare(password, results.rows[0].password);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const results = await db.query("UPDATE users SET last_login_at=CURRENT_TIMESTAMP WHERE username=$1 RETURNING username;", [username]);
    if (results.rows.length === 0){
      throw new ExpressError(`${username} not found`, 404)
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const results = await db.query("SELECT username, first_name, last_name, phone FROM users;");
    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const results = await db.query("SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users WHERE username=$1;", [username]);
    if (results.rows.length === 0){
      throw new ExpressError(`${username} not found`, 404)
    }
    return results.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(`SELECT m.id, m.body, m.sent_at, m.read_at, u.username, u.first_name, u.last_name, u.phone FROM messages as m 
    JOIN users as u ON to_username = username WHERE from_username=$1;`, [username]);
    if (results.rows.length === 0){
      throw new ExpressError(`${username} not found`, 404)
    }
    return results.rows.map(msg => {
      return {id: msg.id, body: msg.body, sent_at: msg.sent_at, read_at: msg.read_at, to_user: {username: msg.username, first_name: msg.first_name, last_name: msg.last_name, phone: msg.phone}};
    });
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const results = await db.query(`SELECT m.id, m.body, m.sent_at, m.read_at, u.username, u.first_name, u.last_name, u.phone FROM messages as m 
    JOIN users as u ON from_username = username WHERE to_username=$1;`, [username]);
    if (results.rows.length === 0){
      throw new ExpressError(`${username} not found`, 404)
    }
    return results.rows.map(msg => {
      return {id: msg.id, body: msg.body, sent_at: msg.sent_at, read_at: msg.read_at, from_user: {username: msg.username, first_name: msg.first_name, last_name: msg.last_name, phone: msg.phone}};
    });
  }
}


module.exports = User;