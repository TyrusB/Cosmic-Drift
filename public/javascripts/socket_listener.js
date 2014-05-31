$(function() {
  var socket = io('http://localhost:8080');
  var connection = new Connection(socket);
  window.openConnection = connection;
  
  var other_canvas = document.getElementById('other_player_canvas'),
      other_context = other_canvas.getContext('2d'),
      other_game = new Asteroids.Game(other_canvas);

  connection.socket.on('other_game', function(other_player_info) {
    // This is where the game drawing logic goes
    $.extend(other_game, other_player_info);
    other_game.drawOther(other_context);
  });

});
