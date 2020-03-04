$(function () {
    var socket = io();
    let $chatH = $('#chat-history');
    let $userOn = $('#online-users');
    let $msgInput = $('#msg-send');

    $('form').submit(function(e){
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', {msg: $msgInput.val()});
        $msgInput.val('');
        return false;
    });
    socket.on('chat message', function(data){
        console.log(data);
        let date = new Date(data.time);
        let date_format = date.toTimeString().split(" ");
        $chatH.prepend($('<li>').text(date_format[0] + ' ' + data.msg));
    });
});