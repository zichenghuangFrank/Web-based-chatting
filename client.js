 $(function () {
    var socket = io();
    // let onlineFlag = false;
    let $chatH = $('#chat-history');
    let $usersOnline = $('#online-users');
    let $msgInput = $('#msg-send');
    var nickname = "";

    var curName = $.cookie("userName");
    var curColor = $.cookie("userColor");

    socket.on('connect', function(data) {
        socket.emit('user connect', curName, curColor, function (data) {
            $.cookie("userName", data.name);
            $.cookie("userColor", data.color);
            console.log(data);
        });
    });

    // Assign the user in the chatting room
    socket.on('send nickname', function(data){
        $.cookie("userName", data.userName);
        $.cookie("userColor", data.userColor);
        nickname = data.userName;
        $('#user-name')[0].innerHTML = "You are " + "<a style='color: " + data.userColor + "'>" + data.userName + "</a>";
    });

    // Update the online list
    socket.on('update online list', function(data){
        $usersOnline.empty();
        for (let i = 0; i < data.length; i++) {
            $usersOnline.prepend("<li style='color: " + data[i].userColor + "'>" + data[i].userName + "</li>");
        }
    });

    // Click the 'send' button
    $('form').submit(function(e){
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', {msg: $msgInput.val(), userName: nickname});
        $msgInput.val('');
        return false;
    });

    socket.on('show chat message', function(data){
        console.log(data);
        let date = new Date(data.time);
        let date_format = date.toTimeString().split(" ");
        if (!data.userName) {
            $chatH.prepend($('<li>').text(date_format[0] + ' ' + data.msg));    
        } else {
            $chatH.prepend($('<li>').text(date_format[0] + ' ' + data.userName + ' ' + data.msg));
        }
    });
});