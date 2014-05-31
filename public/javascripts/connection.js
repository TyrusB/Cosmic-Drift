(function(root) {
  var Connection = root.Connection = function(socket) {
    this.socket = socket;
  }

  Connection.prototype.sendGameInfo = function() {
    var data = this.getGameInfo();
    this.socket.emit('game_info', data);
    // console.log('info_sent');
    // console.log(data);

  }

  Connection.prototype.indicateReady = function() {
    this.socket.emit('player_ready');
  }

  //Can tweak to optimize the data that's being sent over.
  Connection.prototype.getGameInfo = function() {
    //better way of accessing this?
    return {
      asteroids: window.game.asteroids,
      ship: window.game.ship,
      buttets: window.game.bullets,
      score: window.game.score
    }
  }
})(this)