var _ = require('lodash');

function createConnection(server) {
  console.log('creating connection');

  var numExchanges = 0;

  var io = require('socket.io').listen(server);
  io.set('log level', false)

  // partners uses id's as keys, and socket objects as values
  var partners = {},
  // needsPartners holds socket objects
      needsPartners = [];

  var otherSocket = function(thisSocket) {
    return partners[thisSocket.id]
  }

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
        console.log(numExchanges++);
        otherSocket(socket).emit('other_game', game);
      });

      socket.on('game_over', function() {
        otherSocket(socket).emit('you_win', {});
      });

      socket.on('disconnect', function() {
        delete sockets[socket.id];

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

