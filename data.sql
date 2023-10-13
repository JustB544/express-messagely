DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    join_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    from_username text NOT NULL REFERENCES users ON DELETE SET NULL,
    to_username text NOT NULL REFERENCES users ON DELETE SET NULL,
    body text NOT NULL,
    sent_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read_at timestamp with time zone
);

INSERT INTO users (username, password, first_name, last_name, phone)
    VALUES ('test_user1', 'changemehehe', 'B', 'P', 'phone'),
           ('test_user2', 'same', 'P', 'B', 'phone');

INSERT INTO messages (from_username, to_username, body)
    VALUES ('test_user1', 'test_user2', 'message1'),
           ('test_user2', 'test_user1', 'message2');



