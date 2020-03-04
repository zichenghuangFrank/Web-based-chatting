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

    socket.on('') {

    }

    // Server receives the new chat message and handle from clients
    socket.on('chat message', function (data) {
        let timestamp = Date.now(); // Add current time stamps
        
        
        
        io.emit('chat message', {time: timestamp, msg: data.msg});
        
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