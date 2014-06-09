var _ = require('lodash');

function createConnection(server) {
  console.log('creating connection');

  var numExchanges = 0;

  var io = require('socket.io').listen(server);


  //Data Structure section for holding info on connected sockets

  // Partners is an object wherein the id of each player points to the socket object of their opponent
  //   i.e. each game means two different entries in the partner object.
  var partners = {};

  // Needs partners is a list where players looking for partners queue up. Shouldn't ever have more than one player in it.
  //  This is a list of socket objects.
  var needsPartners = [];



  //Note: this method either returns the partner socket, or a dummy object that won't crash the server if the player has disconnected.
  var otherSocket = function(thisSocket) {
    return partners[thisSocket.id] || { emit: function() {} }
  }


  // The actual sockets callbacks themselves..
  io.sockets.on('connection', function(socket) {
    socket.on('player_ready', function() {
      console.log('player ready message received');
      // First, determine whether or not there are any users waiting for partners
      //if not, push to the waiting list
      if (needsPartners.length === 0) {
        needsPartners.push(socket);
      //if so, grab the front of the line, and set it up with the new player.
      } else {
        console.log('both players ready, starting game');
        var partner = needsPartners.shift();
        partners[partner.id] = socket;
        partners[socket.id] = partner;

        socket.emit('players_ready', {});
        partner.emit('players_ready', {});
      }

      socket.on('game_info', function(game) {
        console.log(" " + socket.id.slice(0, 20) + " " + numExchanges++);
        console.log(_.size(game));
        otherSocket(socket).emit('other_game', game);
      });

      socket.on('player_crashed', function() {
        otherSocket(socket).emit('other_player_crashed');
      });

      socket.on('final_score', function(score) {
        otherSocket(socket).emit('final_opponent_score', score);
      })

      socket.on('disconnect', function() {
        _.remove(needsPartners, function(socketObj) {
          return socket === socketObj;
        });

        if (partners[socket.id]) {
          var partnerSocket = otherSocket(socket);
          delete partners[socket.id];
          delete partners[partnerSocket.id];

          partnerSocket.emit('partner_disconnected', {});
        }
      });
    })
  })
}

module.exports.createConnection = createConnection;

