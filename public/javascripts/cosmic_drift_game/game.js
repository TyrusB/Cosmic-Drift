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
    this.DIM_X = this.canvas.width;
    this.DIM_Y = this.canvas.height;

    this.isMultiplayer = isMultiplayer || false;
    this.numAsteroids = this.isMultiplayer ? Game.MP_NUM_ASTEROIDS : Game.SP_NUM_ASTEROIDS;

  }

  Game.SPEED = 20;
  Game.SP_NUM_ASTEROIDS = 10;
  Game.MP_NUM_ASTEROIDS = 5;
  Game.THRUST_POWER = 0.25;
  Game.HANDLE_TWEAK = 1.0;
  Game.MAX_THRUST = 5.0;



  Game.prototype.addAsteroids = function (numAsteroids) {
    while (this.asteroids.length < numAsteroids) {
      var randomAsteroid = Asteroids.Asteroid.randomAsteroid(this.DIM_X, this.DIM_Y) 
      if ( Math.abs(randomAsteroid.posx - this.DIM_X / 2) > 100 && Math.abs(randomAsteroid.posy - this.DIM_Y / 2) < 80 ) {
        this.asteroids.push( randomAsteroid );
      }
    }
  }

  Game.prototype.replenishAsteroids = function() {
    if (this.turnNo % 20 === 0 && this.asteroids.length < this.numAsteroids) {
        this.asteroids.push( Asteroids.Asteroid.edgeAsteroid(this.DIM_X, this.DIM_Y));
    }
  }


  Game.prototype.addShips = function() {
    this.ship = new Asteroids.Ship(this.DIM_X, this.DIM_Y);
  }

  Game.prototype.draw = function (ctx) {
    ctx.clearRect(0, 0, this.DIM_X, this.DIM_Y);

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
    ctx.clearRect(0, 0, this.DIM_X, this.DIM_Y);

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
      el.rotation = parseFloat(((el.rotation += 0.1) % 360).toFixed(2));
    });

    this.bullets.forEach( function(el) {
      el.move();
    })

    this.ship.move();
  }

  Game.prototype.drawScore = function(ctx) {
    var scorex = this.DIM_X - 30;
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
    var game = this;
    //check if ship has collided with asteroids
    var crashed = this.asteroids.some( function (el) {
      return el.isCollidedWith(game.ship);
    });

    if(crashed){
      game.stop();
      root.loader.gameStateMachine.crashed();
      root.openConnection.announceCrash(game.score);
    }

    //check for bullet/asteroid collisions
    this.bullets.forEach( function(bullet) {
      bullet.hitAsteroids(game);
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
    this.addAsteroids(this.numAsteroids);
    this.addShips();
    this.bindKeyHandlers();
    var context = this.canvas.getContext('2d');
    this.handle = setInterval( this.step.bind(this, context), Game.SPEED );
  }


})(this);

