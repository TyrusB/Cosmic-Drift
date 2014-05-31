(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {} )

  var Bullet = Asteroids.Bullet = function(posx, posy, direction) {
    Asteroids.MovingObject.call(this, posx, posy, direction[0]*10, direction[1]*10, Bullet.RADIUS, Bullet.COLOR )
  }

  Bullet.inherits(Asteroids.MovingObject);

  Bullet.RADIUS = 2.5;
  Bullet.COLOR = "yellow";

  Bullet.prototype.hitAsteroids = function(game) {
      var that = this;
      game.asteroids.forEach( function(asteroid) {
        if (asteroid.isCollidedWith(that)) {
          if (asteroid.radius > Asteroids.Asteroid.SPLIT_SIZE) {
            game.asteroids.push(
              new Asteroids.Asteroid(asteroid.posx, asteroid.posy, -1 * that.vx / 3, that.vy / 3, asteroid.radius / 2 + 2, asteroid.color),
              new Asteroids.Asteroid(asteroid.posx, asteroid.posy, that.vx / 3, that.vy / 3, asteroid.radius / 2 + 2, asteroid.color)
            )
          }

          game.removeAsteroid(asteroid);
          game.removeBullet(that);
        }
    });
  }

  Bullet.prototype.move = function() {
    this.posx = this.posx + this.vx;
    this.posy = this.posy + this.vy; 
  }

})(this);

