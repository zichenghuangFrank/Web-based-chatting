 $(function () {
    var socket = io();
    let onlineFlag = false;
    let $chatH = $('#chat-history');
    let $usersOnline = $('#online-users');
    let $msgInput = $('#msg-send');

    let curName = $.cookie("userName");
    let curColor = $.cookie("userColor");

    socket.on('connect', function(data) {
        socket.emit('user connect', curName, curColor);
    });

    socket.on('send nickname', function(data){
        $('#user-name')[0].innerHTML = "You are " + "<a style='color: " + data.userColor + "'>" + data.userName + "</a>";
    });



    $('form').submit(function(e){
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', {msg: $msgInput.val()});
        $msgInput.val('');
        return false;
    });

    socket.on('chat message', function(data){
        console.log(data);
        // if (onlineFlag === false) {
        //     $('#user-name').val() 
        // }
        let date = new Date(data.time);
        let date_format = date.toTimeString().split(" ");
        $chatH.prepend($('<li>').text(date_format[0] + ' ' + data.msg));
    });
});