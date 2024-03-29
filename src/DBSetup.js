const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./main.db');

db.serialize(function() {
    const CREATE_MESSAGES = 
    '   create table messages(\
        UID TEXT NOT NULL,\
        time timestamp NOT NULL);\
        '
    const CREATE_CURR = 
    '   create table curr(\
        time timestamp NOT NULL);\
        '

    db.run(CREATE_CURR);
    db.run(CREATE_MESSAGES);
    
});

db.close();