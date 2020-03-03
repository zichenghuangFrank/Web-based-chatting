var app = require('express')();
var express = require('express');
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));

app.get('/', function(req, res) {
   res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){
    // Server receives the new chat message and handle from clients
    socket.on('chat message', function (data) {
        io.emit('chat message', data);
        let timestamp = Date.now();
    });
    socket.on('disconnect', function () {
       console.log('user disconnected');
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});