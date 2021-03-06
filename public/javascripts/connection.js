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
    this.socket.emit('player_crashed');
  }

  Connection.prototype.sendFinalScore = function(score) {
    this.socket.emit('final_score', score)
  } 

  Connection.prototype.beginListening = function(otherGameCanvas) {
    var otherContext = otherGameCanvas.getContext('2d'),
        otherGame = new Asteroids.Game(otherGameCanvas),
        gameLoaded = false;

    this.socket.on('other_game', function(transmittedData) {
      //Only call this the first time you receive other player data
      if (!gameLoaded) {
        gameLoaded = true;
        otherGame.predictMovements(otherContext);
      }

      var otherPlayerInfo = JSON.parse(transmittedData);
      otherPlayerInfo.ship.color = 'blue';
      $.extend(otherGame, otherPlayerInfo);
    });

    this.socket.on('other_player_crashed', function(score) {
      otherGame.stopPredictions();
      window.loader.gameStateMachine.otherPlayerCrashed();
    })

    this.socket.on('final_opponent_score', function(score) {
      loader.competitionInfo.opponentScore = parseInt(score);
    })
  }

  Connection.prototype.endListening = function() {
    this.socket.removeAllListeners('other_game');
  }

})(this)