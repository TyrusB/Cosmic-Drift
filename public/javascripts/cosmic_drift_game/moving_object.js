(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {} )

  var MovingObject = Asteroids.MovingObject = function(posx, posy, vx, vy, radius, color){
    this.posx = posx;
    this.posy = posy;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
    this.board_x = Asteroids.Game.DIM_X + Asteroids.Asteroid.RADIUS;
    this.board_y = Asteroids.Game.DIM_Y + Asteroids.Asteroid.RADIUS;
  }

  MovingObject.prototype.move = function() {
    if (this.posx > this.board_x) {
      this.posx = this.posx - this.board_x + this.vx
    } else if (this.posx < (0 - Asteroids.Asteroid.RADIUS) ) {
      this.posx = this.posx + this.board_x + this.vx
    } else {
      this.posx = this.posx + this.vx
    }

    if (this.posy > this.board_y) {
      this.posy = this.posy - this.board_y + this.vy
    } else if (this.posy < (0 - Asteroids.Asteroid.RADIUS) ){
      this.posy = this.posy + this.board_y + this.vy
    } else {
      this.posy = this.posy + this.vy
    }

  }

  MovingObject.prototype.draw = function(ctx){
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(
      this.posx,
      this.posy,
      this.radius,
      0,
      2 * Math.PI,
      false
    );
    ctx.fill();
  }

  MovingObject.prototype.isCollidedWith = function(otherObject){
    var distance = Math.sqrt(Math.pow((this.posx - otherObject.posx), 2) + Math.pow((this.posy - otherObject.posy), 2))

    return ((this.radius + otherObject.radius) > distance)
  }


})(this);