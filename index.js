var app = require('express')();
var express = require('express');
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var totalUserNumber = 0;
var usersOnline = [];
var usersAll = [];
var chatLog = [];

app.use(express.static(__dirname));

app.get('/', function(req, res) {
   res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){

    var newUser = {};

    socket.on('user connect', function(userName, userColor) {
        if(!userName) {
            let randomColor = "#" + Math.floor(Math.random()*16777215).toString(16); 
            newUser.userColor = randomColor;
            totalUserNumber += 1;
            let nickName = "No." + totalUserNumber.toString() + " user";
            newUser.userName = nickName;
        } else {
            newUser.userColor = userColor;
            newUser.userName = userName; 
        }
        
        newUser.id = socket.id;
        usersOnline.push(newUser);
        usersAll.push(newUser);

        socket.emit('send nickname', {userName: newUser.userName, userColor: newUser.userColor});
        io.emit('update online list', usersOnline);
    }); 

    // Server receives the new chat message and handle from clients
    socket.on('chat message', function (data) {
        let timestamp = Date.now(); // Add current time stamps
        let userIndex = findOnlineUserByName(data.userName);
        let userName  = usersOnline[userIndex];

        // Check if the command is /nick or /nickcolor 
        let commandMessage = data.msg.split(' ');
        

        io.emit('chat message', {time: timestamp, userName: userName, msg: data.msg});
        
    });






    socket.on('disconnect', function () {
       console.log('user disconnected');
    });
});

// Find the index of online user name
function findOnlineUserByName(name) {
    for (let i = 0; i < usersOnline.length; i++) {
        if (name === usersOnline[i]) {
            return i
        }
    }
    return -1;
}

// Check whether the name is unique or not
function isUniqueName(name) {
    for (let i = 0; i < usersAll.length; i++) {
        if (name === usersAll[i]) {
            return false;
        }
    }
    return true;
}

http.listen(3000, function() {
    console.log('listening on *:3000');
});