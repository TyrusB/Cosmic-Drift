$(function() {
  var socket = io('http://localhost:8080');
  var connection = new Connection(socket);
  window.openConnection = connection;
  
  var other_canvas = document.getElementById('other_player_canvas');
  var other_context = other_canvas.getContext('2d'),
      otherGame = new Asteroids.Game(other_canvas);

  connection.socket.on('other_game', function(transmittedData) {
    // This is where the game drawing logic goes
    var otherPlayerInfo = JSON.parse(transmittedData);
    console.log(otherPlayerInfo);
    $.extend(otherGame, otherPlayerInfo);
    otherGame.drawOther(other_context);
  });

});
