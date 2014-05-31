(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {} )

  var Ship = Asteroids.Ship = function(board_x, board_y) {
    Asteroids.MovingObject.call(this, (board_x / 2), (board_y / 2), 0, 0, Ship.RADIUS, Ship.COLOR);
    this.rotation =  Math.PI / 3;
    this.board_x = board_x;
    this.board_y = board_y;
    this.thrusting = false;
  }

  Ship.inherits(Asteroids.MovingObject);

  Ship.RADIUS = 10;
  Ship.COLOR = "red";

  Ship.prototype.getVector = function() {
    var x = Math.sin(this.rotation) * this.radius;
    var y = Math.cos(this.rotation) * this.radius;

    return [x / 10, y / 10];
  }

  Ship.prototype.draw = function(ctx) {

    // First component: draw the ship, using the rotation to determine which direction it's pointing.
    var p1x = this.radius * Math.sin(this.rotation);
    var p1y = this.radius * Math.cos(this.rotation);

    var p2x = this.radius * Math.sin(this.rotation + 135 * (Math.PI / 180) );
    var p2y = this.radius * Math.cos(this.rotation + 135 * (Math.PI / 180) );

    var p3x = this.radius * Math.sin(this.rotation + 230 * (Math.PI / 180) );
    var p3y = this.radius * Math.cos(this.rotation + 230 * (Math.PI / 180) );

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.posx + p1x, this.posy + p1y);
    ctx.lineTo(this.posx + p2x, this.posy + p2y);
    ctx.lineTo(this.posx + p3x, this.posy + p3y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(
      this.posx + p1x,
      this.posy + p1y,
      this.radius / 4,
      0,
      2 * Math.PI,
      false
    );
    ctx.fill();

    // Second part: check if thrust is being applied, and draw a thruster rocket if so
    if (this.thrusting) {
      ctx.beginPath();
      ctx.moveTo(this.posx + p2x, this.posy + p2y);
      ctx.lineTo(this.posx + p3x, this.posy + p3y);
      ctx.lineTo(this.posx + (p2x + p3x) / 2, this.posy + (this))
      ctx.strokeStyle = 'yellow'
      ctx.lineWidth = 3;
      ctx.stroke();
    }

  }

  Ship.prototype.fireBullet = function(game){
    var direction = this.getVector();
    return new Asteroids.Bullet(this.posx, this.posy, direction, game);
  }

})(this);