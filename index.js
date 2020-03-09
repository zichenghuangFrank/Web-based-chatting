var express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var totalUserNumber = 0;
var usersOnline = [];
var usersAll = [];
var chatHistory = [];

app.use(express.static('public'));

io.on('connection', function(socket){

    var newUser = {};

    socket.on('user connect', function(userName, userColor, cookieData) {
        if(!usersOnline.includes(userName)) {
            // Generate random color (reference: https://css-tricks.com/snippets/javascript/random-hex-color/)
            let randomColor = "#" + Math.floor(Math.random()*16777215).toString(16); 
            newUser.userColor = randomColor;
            totalUserNumber += 1;
            console.log("total: " + totalUserNumber);
            // Generate random name by using users' No.
            let nickName = "No." + totalUserNumber.toString() + " user"; // Online user's number
            newUser.userName = nickName;
        } else {
            newUser.userColor = userColor;
            newUser.userName = userName; 
        }
        
        newUser.id = socket.id; // Get the user socket id 
        cookieData({userName: newUser.userName, userColor: newUser.userColor}); // Update the cookie data

        usersOnline.push(newUser);
        usersAll.push(newUser);
        console.log(newUser.userName + "connect");

        socket.emit('send nickname', {userName: newUser.userName, userColor: newUser.userColor});
        io.emit('update online list', usersOnline);

        // Send the chat history to new coming users 
        socket.emit('send chat history', chatHistory);
    }); 

    // Server receives the new chat message and handle from clients
    socket.on('chat message', function (data) {
        let timestamp = Date.now(); // Add current time stamps
        let userIndex = findOnlineUserByName(data.userName);
        let userOnline  = usersOnline[userIndex];
        console.log(usersOnline);
        console.log(usersAll);

        // Check if the command is /nick or /nickcolor 
        let commandMessage = data.msg.split(" ");
        console.log(commandMessage);

        // Change name command
        if (commandMessage[0] === "/nick" && commandMessage.length > 1) {

            commandMessage.shift();
            let curName = commandMessage.join(" ");
            console.log(curName);
            
            // Empty name
            if (curName.length === 0) {
                socket.emit('show command message', {time: timestamp, msg: "You enter an invalid command! Please try again."});
                return;
            }

            // Check whether the changed name is unique or not 
            if (!isUniqueName(curName)) {
                socket.emit('show command message', {time: timestamp, msg: "Your nickname has been taken! Please try again."});
                return;
            }

            // Change into the new name
            let preName = userOnline.userName;
            usersOnline[userIndex].userName = curName;
            socket.emit('send nickname', {userName: curName, userColor: userOnline.userColor});

            // Update the online list
            io.emit("update online list", usersOnline);
            
            // Update all users' list
            updateAllUserByName(preName, curName);

            // Update the chat history
            io.emit('update chat history', chatHistory);

            // Send the message
            socket.emit('show command message', {time: timestamp, msg: "You have changed your nickname!"});
        
        } else if (commandMessage[0] === "/nickcolor" && commandMessage.length === 2) { // Change color command
            // Invalid command 
            if (commandMessage[1].length !== 6 || parseInt("0x" + commandMessage[1]) > 0xFFFFFF) {
                socket.emit('show command message', {time: timestamp, msg: "Your change color should be like RRGGBB! Please try again."});
                return;
            }
            
            // Change into the new nickname color
            let curColor = "#" + commandMessage[1];
            usersOnline[userIndex].userColor = curColor;
            socket.emit('send nickname', {userName: userOnline.userName, userColor: userOnline.userColor});

            // Update the online list
            io.emit("update online list", usersOnline);

            // Update all users' list
            updateAllUserByColor(curColor, userOnline);

            // Update the chat history
            io.emit('update chat history', chatHistory);

            // Send the message
            socket.emit('show command message', {time: timestamp, msg: "You have changed your nickname color!"});
        } else {
            
            chatHistory.push({time: timestamp, userName: userOnline.userName, userColor: userOnline.userColor, msg: data.msg});
            // Send the regular message
            io.emit('show chat message', {time: timestamp, userName: userOnline.userName, userColor: userOnline.userColor, msg: data.msg});
        }

    });

    // Disconnect the user
    socket.on('disconnect', function () {
        let socketId_index = findOnlineUserById(socket.id);
        if (socketId_index !== -1) {
            console.log("User: " + usersOnline[socketId_index].userName + " (Socket id: " + socket.id + ")" + " has disconnected");
            usersOnline.splice(socketId_index, 1);
            io.emit('update online list', usersOnline);
        }
    });

});

// Update the user's name in all users
function updateAllUserByName(preName, curName) {
    for (let i = 0; i < usersAll.length; i++) {
        if (preName === usersAll[i].userName) {
            usersAll[i].userName = curName;
            break;
        }
    }
    return;
}

// Update the user's nickname color in all users
function updateAllUserByColor(curColor, name) {
    for (let i = 0; i < usersAll.length; i++) {
        if (usersAll[i].userName === name) {
            usersAll[i].userColor = curColor;
            break;
        }
    }
    return;
}

// Find the index of online user name
function findOnlineUserByName(name) {
    for (let i = 0; i < usersOnline.length; i++) {
        if (name === usersOnline[i].userName) {
            return i
        }
    }
    return -1;
}

// Check whether the name is unique or not
function isUniqueName(name) {
    for (let i = 0; i < usersAll.length; i++) {
        if (name === usersAll[i].userName) {
            return false;
        }
    }
    return true;
}

// Find the socket id of the index of each user
function findOnlineUserById(socketId) {
    for (let i = 0; i < usersOnline.length; i++) {
        if (socketId === usersOnline[i].id) {
            return i;
        }
    }
    return -1;
}

// Listen port 3000
http.listen(3000, function() {
    console.log('listening on *:3000');
});