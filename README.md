Multiplayer Cosmic Drift
======================

http://cosmic-drift.herokuapp.com

*Note: Because my multiplayer version of Cosmic Drift, an asteroids-type game utilizing a JavaScript engine with HTML5 canvas for graphics, entailed a complete overhaul of my original, single player version, I've opted to create a new repo for this continuation of the project.*

#Controls
- Arrow Keys turn
- Forward applies thrust
- Spacebar shoots
- That's it! There's no braking in space!

#Instructions

###Single Player

Stay alive as long as possible, and destroy asteroids to rack up your score. 

### Multiplayer
- The object is to outlast your opponent.
- If your opponent dies before you, you have 10 seconds to score bonus points.
- Your victory (or defeat) will be measured by score differential.

# Good Stuff/ Technical Features
- Trig functions to determine rotation of ships and asteroids.
- Finite State Machine handles game state transitions.
- Predictive analysis used to minimize lag/number of packets transmitted over websockets.
- Server-side data structures allow multiple concurrent multiplayer games.

# Technologies used
- Node.js
- HTML5 Canvas
- Websockets (socket.io library)
- Finite State Machine (javascript-state-machine library)

*This app is hosted on Heroku, using their websockets add-on*