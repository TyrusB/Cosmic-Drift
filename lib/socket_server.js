var _ = require('lodash');

function createConnection(server) {
  console.log('creating connection');

  var io = require('socket.io').listen(server);
  io.set('log level', false)

  var players = [];
  var sockets = {};

  io.sockets.on('connection', function(socket) {
    socket.on('player_ready', function() {
      console.log('ready message received');
      //First, add the player to the player list
      if (players.length < 2) {
        players.push(socket.id);
        sockets[socket.id] = socket;
      } else {
        socket.emit('game_full', {});
      }

      //Next, check if it's time to start the game
      if (players.length === 2) {
        console.log('sending begin messages');
        players.forEach(function(socketID) {
          var player_socket = sockets[socketID];
          player_socket.emit('begin_game', {});
        });
      }

      socket.on('game_info', function(game) {
        console.log(game);
        var other_player_socket = getOtherPlayerSocket(socket, players, sockets);
        other_player_socket && other_player_socket.emit('other_game', game);
      });

      socket.on('game_over', function() {
        var other_player_socket = getOtherPlayerSocket(socket, players, sockets);
        other_player_socket && other_player_socket.emit('you_win', {});
      });

      socket.on('disconnect', function() {
        _.remove(players, function(socketID) {
          return socket.id === socketID;
        });

        delete sockets[socket.id];
      });
    })
  })

  function getOtherPlayerSocket(thisSocket, players, sockets) {
    var other_player_socket = null;

    players.forEach(function(socketID) {
        if (socketID !== thisSocket.id) {
           other_player_socket = sockets[socketID]
        }
    });

    return other_player_socket;
  }
}

module.exports.createConnection = createConnection;

