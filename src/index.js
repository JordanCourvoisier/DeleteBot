const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES] });
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./main.db');
require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
var db = new sqlite3.Database('./main.db');

let Guild = '828085716902477894';
let Channel = '828085717228978199';
let userRole = '828085716902477900';
let msgLog = 'log.txt';
let minMsg = 40;

client.login(process.env.DISCORD_BOT_TOKEN);
client.guilds.fetch(Guild); 

client.on("ready", async () => {
    db.run(`DELETE FROM curr`, function(err) {});
    console.log("ready");
    cleanChannel();
    setInterval(cleanChannel,  1000 * 1 * 10); 
});

//-------
//-------

client.on('message', (message) => {
    if (message.content.toLowerCase().startsWith("/delete min")) {
        console.log('read');
        if(message.member.roles.cache.some(role => role.id === userRole)){
            console.log('role');
            let msg = parseInt(message.content.substring(11));
            if(!isNaN(msg)){
                message.channel.send("There are now " + msg + " minimum messages");
                minMsg = msg;
            }
        }
    }    
});

client.on('message', (message) => {
    if (message.channel.id === Channel) {
		// Insert into db
        db.all("insert into messages (UID, time) values (?, CURRENT_TIMESTAMP)", [message.id],
            (err) => {  });
        // Insert into word file
        fs.writeFile(msgLog, message.author.tag + ': ' + message.content + '\n', { flag: 'a' }, err => {  })
    }
});

async function cleanChannel(){
    let sql = 'SELECT * FROM  messages';
    let deleteArr = [];
    let arr = [];

    db.all("insert into curr (time) values (CURRENT_TIMESTAMP)", ( err) => {});

    let currTime = await getTime();
    let currDay = parseInt(currTime[0].substring(8,10));
    let currHour = parseInt(currTime[0].substring(11,13));
    let arrID = await getMessageID(sql);
    let arrTime = await getMessageTime(sql);

    deleteCurr();

    for(let x = 0; x < arrID.length; x++)
    {
        let hourDiff = ((currDay - parseInt(arrTime[x].substring(8,10))) * 24) + (currHour - parseInt(arrTime[x].substring(11,13)));
        if(hourDiff >= 8)   deleteArr[deleteArr.length] = arrID[x];
    }

    console.log(deleteArr.length);
    console.log(deleteArr[0]);
    for(let y = deleteArr.length - 1; y >= minMsg; y--)
    {
        console.log(y);
        client.channels.cache.get(Channel).messages.fetch(deleteArr[y]).catch(console.error).then(message => message.delete())
        db.run(`DELETE FROM messages WHERE UID=?`, deleteArr[y], function(err) {});
    }

}

async function getMessageID(sql){
    let arr = [];
    let x = 0;
    return await new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            rows.forEach((row) => {
                arr[x] = row.UID;
                x++;
                resolve(arr);
            });
        });
    }) 
};

async function getMessageTime(sql){
    let arr = [];
    let x = 0;
    return await new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            rows.forEach((row) => {
                arr[x] = row.time;
                x++;
                resolve(arr);
            });
        });
    }) 
};

async function getTime(){
    let sql = 'SELECT * FROM curr'; 
    let arr = [];
    let x = 0;
    return await new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            rows.forEach((row) => {
                arr[x] = row.time;
                x++;
                resolve(arr);
            });
        });
    }) 
}

function deleteCurr() {
    db.run(`DELETE FROM curr`, function(err) {
        if (err) {
            return console.error(err.message);
        }
    });
}