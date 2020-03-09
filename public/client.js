 $(function () {
    var socket = io();
    var $chatH = $('#chat-history');
    var $usersOnline = $('#online-users');
    var $msgInput = $('#msg-send');
    var nickname = "";

    var curName = $.cookie('userName');
    var curColor = $.cookie('userColor');

    socket.on('connect', function(data) {
        socket.emit('user connect', curName, curColor, function (data) {
            $.cookie('userName', data.name);
            $.cookie('userColor', data.color);
        });
    });

    // Assign the user in the chatting room
    socket.on('send nickname', function(data){
        $.cookie('userName', data.userName);
        $.cookie('userColor', data.userColor);
        nickname = data.userName;
        $('#current-user')[0].innerHTML = "You are " + "<span style='color: " + data.userColor + "'>" + data.userName + "</span>";
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

    // Send chat history content
    socket.on('send chat history', function(data) {
        $chatH.empty();
        for (let i = 0; i < data.length; i++) {
            console.log(data);
            let date = new Date(data[i].time);
            let date_format = date.toTimeString().split(" ");
            $chatH.prepend("<li>" + date_format[0] + " " + "<span style='color: " + data[i].userColor + "'>" + data[i].userName + "</span>" + ": " + data[i].msg + "</li>");
        }
    });

    // Update chat content into chat history
    socket.on('update chat history', function(data) {
        $chatH.empty();
        for (let i = 0; i < data.length; i++) {
            console.log(data);
            let date = new Date(data[i].time);
            let date_format = date.toTimeString().split(" ");

            // Bold the own message
            if (data[i].userName === nickname) {
                $chatH.prepend("<li>" + date_format[0] + " " + "<span style='color: " + data[i].userColor + "'>" + data[i].userName + "</span>" + ": " + "<b>" + data[i].msg + "</b>" + "</li>");
            } else {
                $chatH.prepend("<li>" + date_format[0] + " " + "<span style='color: " + data[i].userColor + "'>" + data[i].userName + "</span>" + ": " + data[i].msg + "</li>");
            }
        }
    });

    // Show command message
    socket.on('show command message', function(data){
        console.log(data);
        let date = new Date(data.time);
        let date_format = date.toTimeString().split(" ");
        $chatH.prepend($('<li>').text(date_format[0] + " " + ' ' + data.msg));  
    });

    // Show chat message
    socket.on('show chat message', function(data){
        console.log(data);
        let date = new Date(data.time);
        let date_format = date.toTimeString().split(" ");
        
        // Bold the own message
        if (data.userName === nickname) {
            $chatH.prepend("<li>" + date_format[0] + " " + "<span style='color: " + data.userColor + "'>" + data.userName + "</span>" + ": " + "<b>" + data.msg + "</b>" + "</li>");
        } else {
            $chatH.prepend("<li>" + date_format[0] + " " + "<span style='color: " + data.userColor + "'>" + data.userName + "</span>" + ": " + data.msg + "</li>");
        }
    });
});