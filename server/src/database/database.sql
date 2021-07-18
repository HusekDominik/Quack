CREATE DATABASE quack;

CREATE TYPE gender_method AS ENUM ('Male', 'Female', 'Other');

CREATE TABLE users (
    id SERIAL,  
    username VARCHAR(50) UNIQUE NOT NULL,  
    firstname VARCHAR(50) NOT NULL, 
    lastname VARCHAR(50) NOT NULL,  
    password VARCHAR(100) NOT NULL, 
    email VARCHAR(100) UNIQUE NOT NULL, 
    gender gender_method, 
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    profile_img VARCHAR(150), 
    profile_background_img VARCHAR(150),
    private_profile BOOLEAN NOT NULL DEFAULT FALSE, 
    refresh_token VARCHAR(150),  
    createdAt TIMESTAMPTZ DEFAULT now(),
    updatedAt TIMESTAMPTZ DEFAULT now(),
    dark_mode BOOLEAN NOT NULL DEFAULT FALSE  
    PRIMARY KEY (id) 
);

CREATE TABLE posts ( 
    id SERIAL, 
    author_id INTEGER, 
    description TEXT, 
    image TEXT [],
    createdAt TIMESTAMPTZ DEFAULT now(), 
    PRIMARY KEY (id),
    FOREIGN KEY (author_id) REFERENCES users (id) 
);

CREATE TYPE friendship_status_method AS ENUM ('Pending', 'Accepted', 'Declined', 'Blocked');

CREATE TABLE relationships (
    id SERIAL, 
    user_one_id INTEGER,
    user_two_id INTEGER, 
    action_user_id INTEGER, 
    friendship_status friendship_status_method, 
    createdat TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id),
    FOREIGN KEY (user_one_id) REFERENCES users (id), 
    FOREIGN KEY (user_two_id) REFERENCES users (id), 
    FOREIGN KEY (action_user_id) REFERENCES users (id) 
);


CREATE TABLE comments (                                                     
    id SERIAL,
    comment_author_id INTEGER, 
    post_recipient_id INTEGER,
    parent_comment INTEGER, 
    comment_text TEXT NOT NULL, 
    created_at_comment TIMESTAMPTZ DEFAULT now(), 
    PRIMARY KEY (id),
    FOREIGN KEY (comment_author_id) REFERENCES users (id),
    FOREIGN KEY (post_recipient_id) REFERENCES posts (id) ON DELETE CASCADE, 
    FOREIGN KEY (parent_comment) REFERENCES comments (id) 
);

CREATE TABLE post_likes (
    id SERIAL,
    post_id INTEGER,
    user_id INTEGER,
    PRIMARY KEY(id),
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id)
);


CREATE TABLE notifications (
    id SERIAL, 
    user_id INTEGER,
    requester_id INTEGER,
    notification_status INTEGER NOT NULL, 
    notification_description TEXT, 
    notification_created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id), 
    FOREIGN KEY (user_id) REFERENCES users (id), 
    FOREIGN KEY (requester_id) REFERENCES users (id) 
);


CREATE TABLE messages (
    id SERIAL, 
    user_id INTEGER, 
    requester_id INTEGER,  
    message_description TEXT,
    message_created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id), 
    FOREIGN KEY (user_id) REFERENCES users (id), 
    FOREIGN KEY (requester_id) REFERENCES users (id) 
);

CREATE TABLE conversation (
    id SERIAL,
    receiver_id INTEGER,
    sender_id INTEGER,
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id),
    FOREIGN KEY (receiver_id) REFERENCES users (id),
    FOREIGN KEY (sender_id) REFERENCES users (id)

)

CREATE TABLE chat_message (
    id SERIAL,
    conversation_id INTEGER,
    sender_id INTEGER,
    message_text TEXT,
    message_img TEXT [],
    message_created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id),
    FOREIGN KEY (sender_id) REFERENCES users (id),
    FOREIGN KEY (conversation_id) REFERENCES conversation (id)

)



  -- comment_id  SERIAL,
  --FOREIGN KEY (comment_id) REFERENCES comments (id),


-- notification_status: 0 -> new global notification
-- notification_satus: 1 -> new Friend request
-- notification_status: 2 -> you're now friends with

-- REMOVED

-- CREATE TABLE comment_likes (
--     id SERIAL, 
--     post_id INTEGER,  
--     comment_id  INTEGER, 
--     PRIMARY KEY(id),
--     FOREIGN KEY (post_id) REFERENCES posts (id),
--     FOREIGN KEY (comment_id) REFERENCES comments (id)
-- );
