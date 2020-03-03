$(function () {
    var socket = io();
    $('form').submit(function(e){
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#msg-send').val());
        $('#msg-send').val('');
        return false;
    });
    socket.on('chat message', function(data){
        $('#chat-history').append($('<li>').text(data));
    });
});