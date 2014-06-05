(function(root) {
  var Connection = root.Connection = function(socket) {
    this.socket = socket;
  }

  Connection.prototype.sendGameInfo = function(gameInfo) {
    this.socket.emit('game_info', gameInfo);
  }

  Connection.prototype.indicateReady = function() {
    this.socket.emit('player_ready');
  }

  Connection.prototype.announceCrash = function() {
    this.socket.emit('other_player_crashed');
  }

  Connection.prototype.beginListening = function(otherGameCanvas) {
    var otherContext = otherGameCanvas.getContext('2d'),
        otherGame = new Asteroids.Game(otherGameCanvas);

    this.socket.on('other_game', function(transmittedData) {
      var otherPlayerInfo = JSON.parse(transmittedData);
      otherPlayerInfo.ship.color = 'blue';
      $.extend(otherGame, otherPlayerInfo);
      otherGame.drawOther(otherContext); 
    });

    this.socket.on('other_player_crashed', function() {
      window.loader.gameStateMachine.otherPlayerCrashed();
    })
  }

  Connection.prototype.endListening = function() {
    this.socket.removeAllListeners('other_game');
  }

})(this)