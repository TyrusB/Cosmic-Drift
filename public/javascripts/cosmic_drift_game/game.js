(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {} )

  //Game takes a canvas as an argument, and runs a game in that canvas
  var Game = Asteroids.Game = function (targetCanvas, isMultiplayer) {
    this.asteroids = [];
    this.bullets = [];
    this.ship = null;

    this.turnNo = 1;
    this.score = 0;

    this.canvas = targetCanvas;
    Game.DIM_X = this.canvas.width;
    Game.DIM_Y = this.canvas.height;

    this.isMultiplayer = isMultiplayer || false;

  }

  Game.SPEED = 20;
  Game.ASTEROIDS = 10;
  Game.THRUST_POWER = 0.25;
  Game.HANDLE_TWEAK = 1.0;
  Game.MAX_THRUST = 5.0;



  Game.prototype.addAsteroids = function (numAsteroids) {
    while (this.asteroids.length < numAsteroids) {
      var randomAsteroid = Asteroids.Asteroid.randomAsteroid(Game.DIM_X, Game.DIM_Y) 
      if ( Math.abs(randomAsteroid.posx - Game.DIM_X / 2) > 100 && Math.abs(randomAsteroid.posy - Game.DIM_Y / 2) < 80 ) {
        this.asteroids.push( randomAsteroid );
      }
    }
  }

  Game.prototype.replenishAsteroids = function() {
    if (this.turnNo % 20 == 0 && this.asteroids.length < Game.ASTEROIDS) {
        this.asteroids.push( Asteroids.Asteroid.edgeAsteroid(Game.DIM_X, Game.DIM_Y));
    }
  }


  Game.prototype.addShips = function() {
    this.ship = new Asteroids.Ship(Game.DIM_X, Game.DIM_Y);
  }

  Game.prototype.draw = function (ctx) {
    ctx.clearRect(0, 0, Game.DIM_X, Game.DIM_Y);

    this.asteroids.forEach( function (el) {
      el.draw(ctx);
    });

    this.bullets.forEach( function (el) {
      el.draw(ctx);
    });

    this.ship.draw(ctx);
    this.drawScore(ctx);
  }

  Game.prototype.drawOther = function (ctx) {
    ctx.clearRect(0, 0, Game.DIM_X, Game.DIM_Y);

    this.asteroids.forEach( function (el) {
      Asteroids.Asteroid.prototype.draw.call(el, ctx);
    });

    this.bullets.forEach( function (el) {
      Asteroids.Bullet.prototype.draw.call(el, ctx);
    });

    Asteroids.Ship.prototype.draw.call(this.ship, ctx);
    this.drawScore(ctx);
  }

  Game.prototype.move = function () {
    this.asteroids.forEach( function(el) {
      el.move();
      el.rotation = (el.rotation += 0.1) % 360;
    });

    this.bullets.forEach( function(el) {
      el.move();
    })

    this.ship.move();
  }

  Game.prototype.drawScore = function(ctx) {
    var scorex = Game.DIM_X - 30;
    var scorey = 30;

    ctx.font = '30pt Calibri';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'right'
    ctx.fillText("Score: " + this.score, scorex, scorey);
  }

  Game.prototype.fireBullet = function() {
    if (this.bullet_cooldown < 0 ) {
      this.bullets.push(this.ship.fireBullet(this));
      this.bullet_cooldown = 5;
    }
  }

  Game.prototype.removeAsteroid = function(asteroid){
    this.score += parseInt(asteroid.radius / 4)
    var asteroid_index = this.asteroids.indexOf(asteroid);
    this.asteroids.splice(asteroid_index, 1);
  }

  Game.prototype.removeBullet = function(bullet){
    var bullet_index = this.bullets.indexOf(bullet);
    this.bullets.splice(bullet_index, 1);
  }


  Game.prototype.checkCollisions = function() {
    var that = this;
    //check if ship has collided with asteroids
    var crashed = this.asteroids.some( function (el) {
      return el.isCollidedWith(that.ship);
    });

    if(crashed){
      that.stop();
      root.loader.gameStateMachine.crashed();
    }

    //check for bullet/asteroid collisions
    this.bullets.forEach( function(bullet) {
      bullet.hitAsteroids(that);
    })
  }

  Game.prototype.checkBoundaries = function() {
    var that = this

    this.bullets = this.bullets.filter(function(el) {
      return !(el.posx >= that.DIM_X || el.posy >= that.DIM_Y || el.posx < 0 || el.posy < 0)
    });
  }

  Game.prototype.listenKeyEvents = function(){
    var that = this;

    if (key.isPressed("left")) {
      that.ship.rotation += Math.PI*(0.05) * Game.HANDLE_TWEAK ;
    };

    if (key.isPressed("right")) {
      that.ship.rotation -= Math.PI*(0.05) * Game.HANDLE_TWEAK;
    };

    if(key.isPressed("space")) {
      that.fireBullet();
    }

    if (key.isPressed("up")) {
      var vector = that.ship.getVector();
      that.ship.thrusting = true;

      that.ship.vx = that.ship.vx + vector[0] * Game.THRUST_POWER;
      if (that.ship.vx > 0) {
        that.ship.vx = Math.min(that.ship.vx, Game.MAX_THRUST);
      } else {
        that.ship.vx = Math.max(that.ship.vx, -1 * Game.MAX_THRUST);
      }

      that.ship.vy = that.ship.vy + vector[1] * Game.THRUST_POWER;
      if (that.ship.vy > 0) {
        that.ship.vy = Math.min(that.ship.vy, Game.MAX_THRUST);
      } else {
        that.ship.vy = Math.max(that.ship.vy, -1 * Game.MAX_THRUST);
      }
    } else {
      that.ship.thrusting = false;
    };
  }

  Game.prototype.bindKeyHandlers = function() {
    var that = this;
    //key("space", that.fireBullet.bind(that));
    this.bullet_cooldown = 1;
    key("q", function() {
     that.stop();
    });

  }

  Game.prototype.getGameInfo = function() {
    var data = {
      asteroids: this.asteroids,
      ship: this.ship,
      bullets: this.bullets,
      score: this.score
    };

    return JSON.stringify(data);
  }

  Game.prototype.step = function(ctx){
    this.turnNo += 1
    this.bullet_cooldown -= 1;

    this.replenishAsteroids.call(this);

    this.listenKeyEvents();
    this.move.call(this);
    this.checkBoundaries.call(this);
    this.draw.call(this, ctx);
    this.checkCollisions();

    if (this.isMultiplayer) {
      var gameInfo = this.getGameInfo();
      root.openConnection.sendGameInfo(gameInfo);
    }
  }


  Game.prototype.stop = function(){
    clearInterval(this.handle);
  }

  Game.prototype.start = function() {
    this.addAsteroids(Game.ASTEROIDS);
    this.addShips();
    this.bindKeyHandlers();
    var context = this.canvas.getContext('2d');
    this.handle = setInterval( this.step.bind(this, context), Game.SPEED );
  }

  Game.prototype.loadInstructions = function() {
    var maxFrames = 160,
        frameNo = 0;

    var ctx = this.canvas.getContext('2d');
    var center_x = canvas.width / 2,
        center_y = canvas.height / 2;

    var scrollIntroText = function() {
      ctx.clearRect(0, 0, Game.DIM_X, Game.DIM_Y);
      ctx.font = '65pt Calibri';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'yellow';
      ctx.fillText('Cosmic Drift', center_x, center_y - 100 + (maxFrames - frameNo) / maxFrames * 400);
      ctx.font = '30pt Calibri';
      ctx.fillStyle = 'white';
      ctx.fillText('Controls:', center_x, center_y  + (maxFrames - frameNo) / maxFrames * 400)
      ctx.fillText('Arrow Keys Turn', center_x, center_y + 50  + (maxFrames - frameNo) / maxFrames * 400)
      ctx.fillText('Space Bar Shoots', center_x, center_y + 100  + (maxFrames - frameNo) / maxFrames * 400)
      ctx.font = '20pt Calibri';
      ctx.fillText('Hit enter to begin. Good luck and happy drifting...', center_x, center_y + 200  + (maxFrames - frameNo) / maxFrames * 400)
    
      frameNo = Math.min(frameNo + 1, maxFrames);
    }

    var scroll = setInterval(scrollIntroText, 25);


    var game = this;
    key.setScope('intro');

    key('enter', 'intro', function() {
      clearInterval(scroll);

      // Tell the server we're ready
      root.openConnection.indicateReady();
      root.openConnection.socket.on('players_ready', function() {
        console.log('begin_message_received')
        game.start();
        key.setScope('game');
      });
    }) 
  }

  Game.prototype.loadEnding = function() {
    var game = this,
        maxFrames = 100;
    key.setScope('ending');
    
    var frameNo = 0;
    var ctx = this.canvas.getContext('2d');
    var center_x = canvas.width / 2,
        center_y = canvas.height / 2;

    var loadFrame = function() {
      ctx.clearRect(0, 0, Game.DIM_X, Game.DIM_Y);
      if (frameNo < 4) {
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.rect(0, 0, Game.DIM_X, Game.DIM_Y);
        ctx.fill();
      } else if (frameNo < 10) {
        
      } else if (frameNo < 15) {
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.rect(0, 0, Game.DIM_X, Game.DIM_Y);
        ctx.fill();
      } else if (frameNo < maxFrames + 15) {
        ctx.clearRect(0, 0, Game.DIM_X, Game.DIM_Y);
        ctx.font = '65pt Calibri';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'yellow';
        ctx.fillText('Game Over', center_x, center_y - 100 + (maxFrames - frameNo - 15) / maxFrames * 400);
        ctx.font = '30pt Calibri';
        ctx.fillStyle = 'white';
        ctx.fillText('Final Score:', center_x, center_y  + (maxFrames - frameNo - 15) / maxFrames * 400)
        ctx.fillText(("" + game.score), center_x, center_y + 50  + (maxFrames - frameNo - 15) / maxFrames * 400)
        ctx.font = '20pt Calibri';
        ctx.fillText('Try again? Hit enter to restart...', center_x, center_y + 150  + (maxFrames - frameNo - 15) / maxFrames * 400)
      }

      frameNo = Math.min(frameNo + 1, maxFrames)

    }

    var ending = setInterval(loadFrame, 40);     

    key('enter', 'ending', function() {
      clearInterval(ending);
      location.reload();
    })  

  }


})(this);

