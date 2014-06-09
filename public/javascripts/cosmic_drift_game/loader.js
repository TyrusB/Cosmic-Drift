(function(root) {
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Loader = Asteroids.Loader = function(lcanvas, rcanvas, midcanvas) {
    this.lcanvas = lcanvas;
    this.rcanvas = rcanvas;
    this.midcanvas = midcanvas;

    this.game = null;

    var loader = this;
    this.gameStateMachine = StateMachine.create({
      events: [
        //Beginning events: Title scroll
        { name: 'scrollIntro',     from: 'none',            to: 'intro'              },
        { name: 'finishedIntro',   from: 'intro',           to: 'playerSelect'       },

        //Events triggered once player chooses single or multi player
        { name: 'onePlayer',       from: 'playerSelect',    to: 'singlePlayerGame'   },
        { name: 'twoPlayers',      from: 'playerSelect',    to: 'waitingForOther'    },

        //Events triggered when waiting for another player to connect in multi-player
        { name: 'allPlayersReady', from: 'waitingForOther', to: 'countdown'          },
        { name: 'countdownDone',   from: 'countdown',       to: 'multiplayerGame'        },

        //Events for single player game/post-game
        { name: 'crashed', from: 'singlePlayerGame', to: 'singlePlayerCredits'},
        { name: 'creditsDone', from: 'singlePlayerCredits', to: 'playerSelect'},

        //Events from multi-player game to trigger a winding down screen on the surviving player 
        // when the other player crashes.
        { name: 'crashed',        from: 'multiplayerGame', to: 'windingDownLost'        },
        { name: 'otherPlayerCrashed',       from: 'multiplayerGame',   to: 'windingDownWon' },

        // Events that end the game if the surviving player crashes before the timer winds down.
        // note: the surviving player gets an extra 10 seconds to rack up the score... or go down trying to do so.
        { name: 'crashed', from: 'windingDownWon', to: 'endingScreen' },
        { name: 'otherPlayerCrashed', from: 'windingDownLost', to: 'endingScreen'},
        
        //Events that trigger the ending screen if the surviving player runs out of extra time.
        { name: 'bonusTimerDone', from: 'windingDownWon', to: 'endingScreen'},
        { name: 'bonusTimerDone', from: 'windingDownLost', to: 'endingScreen'},

        { name: 'endingScreenDone', from: 'endingScreen', to: 'playerSelect' }

      ],
      callbacks: {
        onscrollIntro: function(event, from, to) {
          console.log('intro method called');

          //Make sure only the large, middle canvas is visible to handle scrolling into text.
          $('#rcanvas').hide();
          $('#lcanvas').hide();
          $('#midcanvas').show();

          // Context info for the canvas
          var ctx = loader.midcanvas.getContext('2d');
          var center_x = midcanvas.width / 2,
              center_y = midcanvas.height / 2;

          //Frame initialization for the scroll
          var maxFrames = 160,
              frameNo = 0;

          // The scroll itself
          var scrollIntroText = setInterval(function() {
            ctx.clearRect(0, 0, loader.midcanvas.width, loader.midcanvas.height);
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
          }, 25);

          // Bind key handlers and set proper key scope for intro
          key.setScope('intro');

          key('enter', 'intro', function() {
            clearInterval(scrollIntroText);

            loader.gameStateMachine.finishedIntro();
          });
          
        },

        onplayerSelect: function() {
          //Context information for drawing.
          var ctx = loader.midcanvas.getContext('2d');
          var center_x = midcanvas.width / 2,
              center_y = midcanvas.height / 2;

          //Initialize the selection to single player.
          var selector = 'single';

          // A method for drawing the text that will be superimposed over the selection box
          function drawPlayerSelection() {
            ctx.beginPath();
            ctx.font = '60pt Calibri';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'yellow';
            ctx.fillText('Select Game Type:', center_x, center_y - 100)

            ctx.font = '40pt Calibri';
            ctx.fillStyle = 'white';
            ctx.fillText('Single Player', center_x, center_y);
            ctx.fillText('Multi Player', center_x, center_y + 100);
          }
          
          //Initialize a Box under the single player selection
          ctx.clearRect(0, 0, loader.midcanvas.width, loader.midcanvas.height);
          ctx.beginPath();
          ctx.rect(center_x - 150, center_y - 50, 300, 75);
          ctx.strokeStyle = 'white';
          ctx.stroke();
          ctx.fillStyle = 'yellow';
          ctx.fill();

          drawPlayerSelection();

          // Key binding/scope section
          key.setScope('playerSelect');

          key('up', 'playerSelect', function() {
            ctx.clearRect(0, 0, loader.midcanvas.width, loader.midcanvas.height);
            ctx.beginPath();
            ctx.rect(center_x - 150, center_y - 50, 300, 75);
            ctx.strokeStyle = 'white';
            ctx.stroke();
            ctx.fillStyle = 'yellow';
            ctx.fill();

            drawPlayerSelection();

            selector = 'single';
            
          })

          key('down', 'playerSelect', function() {
            ctx.clearRect(0, 0, loader.midcanvas.width, loader.midcanvas.height);
            ctx.beginPath();
            ctx.rect(center_x - 150, center_y + 50, 300, 75);
            ctx.strokeStyle = 'white';
            ctx.stroke();
            ctx.fillStyle = 'yellow';
            ctx.fill();
            
            drawPlayerSelection();

            selector = 'multi';

          })

          key('enter', 'playerSelect', function() {
            ctx.clearRect(0, 0, loader.midcanvas.width, loader.midcanvas.height);
            key.setScope('null');
            if (selector === 'single') {
              loader.gameStateMachine.onePlayer();
            } else if (selector === 'multi') {
              loader.gameStateMachine.twoPlayers();
            }
          });
        },

        onsinglePlayerGame: function() {
          key.setScope('game');

          loader.game = new Asteroids.Game(loader.midcanvas, false);
          loader.game.start();
        },

        onsinglePlayerCredits: function() {
          //Info on the canvas context and measurements
          var ctx = loader.midcanvas.getContext('2d');
          var center_x = loader.midcanvas.width / 2,
              center_y = loader.midcanvas.height / 2,
              canvasWidth = loader.midcanvas.width,
              canvasHeight = loader.midcanvas.height;
          
          //Frame info for the red flash and credits scroll
          var maxFrames = 100,
              frameNo = 0;

          // The interval for the flash/scroll itself
          var spEnding = setInterval(function() {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            if (frameNo < 4) {
              ctx.beginPath();
              ctx.fillStyle = 'red';
              ctx.rect(0, 0, canvasWidth, canvasHeight);
              ctx.fill();
            } else if (frameNo < 10) {
              
            } else if (frameNo < 15) {
              ctx.beginPath();
              ctx.fillStyle = 'red';
              ctx.rect(0, 0, canvasWidth, canvasHeight);
              ctx.fill();
            } else if (frameNo < maxFrames + 15) {
              ctx.clearRect(0, 0, canvasWidth, canvasHeight);
              ctx.font = '65pt Calibri';
              ctx.textAlign = 'center';
              ctx.fillStyle = 'yellow';
              ctx.fillText('Game Over', center_x, center_y - 100 + (maxFrames - frameNo - 15) / maxFrames * 400);
              ctx.font = '30pt Calibri';
              ctx.fillStyle = 'white';
              ctx.fillText('Final Score:', center_x, center_y  + (maxFrames - frameNo - 15) / maxFrames * 400)
              ctx.fillText(("" + loader.game.score), center_x, center_y + 50  + (maxFrames - frameNo - 15) / maxFrames * 400)
              ctx.font = '20pt Calibri';
              ctx.fillText('Try again? Hit enter to restart...', center_x, center_y + 150  + (maxFrames - frameNo - 15) / maxFrames * 400)
            }

            frameNo = Math.min(frameNo + 1, maxFrames)

          }, 40); 

          //Key scope and binding methods
          key.setScope('spEnding');

          key('enter', 'spEnding', function() {
            clearInterval(spEnding);
            delete loader.game;
            key.setScope('null');
            loader.gameStateMachine.creditsDone();
          })  
        },

        //This is the state for the first player to select the multiplayer option, 
        // for when they're waiting for another player to connect
        onwaitingForOther: function() {
          //Ensure the switch to 2-canvas display
          $('#midcanvas').hide();
          $('#lcanvas').show();
          $('#rcanvas').show();

          // Key section
          key.setScope('waiting');

          // Context/dimension info for canvas
          var rctx = loader.rcanvas.getContext('2d');
          var center_rx = loader.rcanvas.width / 2,
              center_ry = loader.rcanvas.height / 2;

          //Method for drawing the basic text saying waiting for another player
          var drawWaitingText = function() {
            rctx.clearRect(0, 0, rcanvas.width, rcanvas.height);
            rctx.beginPath();
            rctx.font = '30pt Calibri';
            rctx.textAlign = 'center';
            rctx.fillStyle = 'red';
            rctx.fillText('Waiting for another', center_rx, center_ry - 150);
            rctx.fillText('player to connect', center_rx, center_ry - 75);
          }
          
          drawWaitingText();

          //Section for flashing waiting dots
          var i = 0; 
          var waitingDots = setInterval(function() {
            switch (i % 3) {
            case 0:
              drawWaitingText();
              rctx.fillText('.     ', center_rx, center_ry);
              break;
            case 1:
              drawWaitingText();
              rctx.fillText('. .   ', center_rx, center_ry);
              break;
            case 2:
              drawWaitingText();
              rctx.fillText('. . . ', center_rx, center_ry);
              break;
            }

            i++;
          }, 750);

          // Handle communications with server
          root.openConnection.indicateReady();
          root.openConnection.socket.on('players_ready', function() {
            console.log('ready message received');
            clearInterval(waitingDots);
            loader.gameStateMachine.allPlayersReady();
          });
        },

        // The state when another player connects to a multiplayer game:
        // There's a countdown, and then the game begins
        oncountdown: function() {
          //Canvas and context info
          var rctx = loader.rcanvas.getContext('2d'),
              lctx = loader.lcanvas.getContext('2d');
          var center_rx = loader.rcanvas.width / 2,
              center_ry = loader.rcanvas.height / 2;
          var center_lx = loader.lcanvas.width / 2,
              center_ly = loader.lcanvas.height / 2;

          //The text on the right screen changes to indicate an opponent has been found
          rctx.clearRect(0, 0, rcanvas.width, rcanvas.height);
          rctx.beginPath();
          rctx.font = '30pt Calibri';
          rctx.textAlign = 'center';
          rctx.fillStyle = 'red';
          rctx.fillText('Opponent Found', center_rx, center_ry - 150);
          rctx.fillText('Get Ready!', center_rx, center_ry - 75);

          //Meanwhile, the left screen displays a countdown
          // The method below is to prepare the settings for the canvas context
          function prepareLContext() {
            lctx.clearRect(0, 0, lcanvas.width, lcanvas.height);
            lctx.beginPath();
            lctx.font = '60pt Calibri';
            lctx.textAlign = 'center';
            lctx.fillStyle = 'white';
          }
          
          // The countdown itself
          var i = 3;
          var countdown = setInterval(function() {
            if (i > 0) {
              prepareLContext();
              lctx.fillText(i, center_lx, center_ly);
              i--;
            } else if (i === 0) {
              prepareLContext();
              lctx.fillText('Go!', center_lx, center_ly);
              i--;
            } else {
              // End the coundown when the number goes below 0
              clearInterval(countdown);
              loader.gameStateMachine.countdownDone();
            }
          }, 750)
        },

        onmultiplayerGame: function() {
          key.setScope('game');

          loader.game = new Asteroids.Game(loader.lcanvas, true);
          loader.game.start();

          //This method begins listening for game data from the other game. See connection.js
          window.openConnection.beginListening(loader.rcanvas);
        },

        onwindingDownWon: function() {
          key.setScope('windingDown');
          
          var frameNo = 0;
          var ctx = loader.rcanvas.getContext('2d');
          var center_x = loader.rcanvas.width / 2,
              center_y = loader.rcanvas.height / 2,
              canvasWidth = loader.rcanvas.width,
              canvasHeight = loader.rcanvas.height;

          var windingDownRScreen = setInterval(function() {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            if (frameNo < 5) {
              ctx.beginPath();
              ctx.fillStyle = 'red';
              ctx.rect(0, 0, canvasWidth, canvasHeight);
              ctx.fill();
            } else if (frameNo < 10) {
              
            } else if (frameNo < 15) {
              ctx.beginPath();
              ctx.fillStyle = 'red';
              ctx.rect(0, 0, canvasWidth, canvasHeight);
              ctx.fill();
            } else {
              // Should probably be 200
              var countdownNum = 10 - parseInt((frameNo - 15) / 20);

              if (countdownNum >= 0) {
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                ctx.beginPath();
                ctx.font = '20pt Calibri';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'red';
                ctx.fillText("Your opponent has crashed!", center_x, center_y - 200);
                ctx.fillText("Bonus time remaining: ", center_x, center_y - 180);
        
                ctx.font = '40pt Calibri';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'red';
                ctx.fillText(countdownNum, center_x, center_y);
              } else {
                clearInterval(windingDownRScreen);
                delete loader.ending
                loader.gameStateMachine.bonusTimerDone();
              }
            }
            frameNo++;
          }, 50);

          loader.ending = windingDownRScreen;
        },

        onleavewindingDownWon: function() {
          clearInterval(loader.ending);
          delete loader.ending
        },

        onwindingDownLost: function() {
          key.setScope('windingDown');
          
          var frameNo = 0;
          var ctx = loader.lcanvas.getContext('2d');
          var center_x = loader.rcanvas.width / 2,
              center_y = loader.rcanvas.height / 2,
              canvasWidth = loader.rcanvas.width,
              canvasHeight = loader.rcanvas.height;

          var windingDownLScreen = setInterval(function() {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            if (frameNo < 4) {
              ctx.beginPath();
              ctx.fillStyle = 'red';
              ctx.rect(0, 0, canvasWidth, canvasHeight);
              ctx.fill();
            } else if (frameNo < 10) {
              
            } else if (frameNo < 15) {
              ctx.beginPath();
              ctx.fillStyle = 'red';
              ctx.rect(0, 0, canvasWidth, canvasHeight);
              ctx.fill();
            } else {
              var countdownNum = 10 - parseInt((frameNo - 15) / 20);

              if (countdownNum >= 0) {
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                ctx.beginPath();
                ctx.font = '20pt Calibri';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'red';
                ctx.fillText("You've crashed!", center_x, center_y - 200);
                ctx.fillText("Bonus time remaining: ", center_x, center_y - 180);
        
                ctx.font = '40pt Calibri';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'red';
                ctx.fillText(countdownNum, center_x, center_y);
              } else {
                clearInterval(windingDownLScreen);
                delete loader.ending
                loader.gameStateMachine.bonusTimerDone();
              }
            }
            frameNo++;
          }, 50);

          loader.ending = windingDownLScreen;
        },

        onleavewindingDownLost: function() {
          clearInterval(loader.ending);
          delete loader.ending
        },

        onendingScreen: function() {
          //this stops the game loop from proceeding.
          loader.game.stop();

          // Ending screen can use a single screen.
          $('#lcanvas').hide();
          $('#rcanvas').hide();
          $('#midcanvas').show();

          //Game is over, so clear the screens.
          var lctx = loader.lcanvas.getContext('2d'),
              rctx = loader.rcanvas.getContext('2d');
          lctx.beginPath();
          rctx.beginPath();
          lctx.clearRect(0, 0, loader.lcanvas.width, loader.lcanvas.height);
          rctx.clearRect(0, 0, loader.rcanvas.width, loader.rcanvas.height);

          // Handle the display of the ending text
          key.setScope('mpending');
          
          var ctx = loader.midcanvas.getContext('2d');
          var center_x = loader.midcanvas.width / 2,
              center_y = loader.midcanvas.height / 2,
              canvasWidth = loader.midcanvas.width,
              canvasHeight = loader.midcanvas.height;
          var frameNo = 0;

          var ending = setInterval(function() {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            if (frameNo < 4) {
              ctx.beginPath();
              ctx.fillStyle = 'blue';
              ctx.rect(0, 0, canvasWidth, canvasHeight);
              ctx.fill();
            } else if (frameNo < 10) {
              
            } else if (frameNo < 15) {
              ctx.beginPath();
              ctx.fillStyle = 'blue';
              ctx.rect(0, 0, canvasWidth, canvasHeight);
              ctx.fill();
            } else {
              ctx.font = '65pt Calibri';
              ctx.textAlign = 'center';
              ctx.fillStyle = 'yellow';
              ctx.fillText('Game Over', center_x, center_y - 100);
              ctx.font = '30pt Calibri';
              ctx.fillStyle = 'white';
              ctx.fillText('Player __ Wins!', center_x, center_y)
              ctx.fillText('Margin of Victory: ', center_x, center_y + 50)
              ctx.fillText('___ ', center_x, center_y + 100)
              ctx.font = '20pt Calibri';
              ctx.fillText('Try again? Hit enter to restart...', center_x, center_y + 150) 
            }
            frameNo++;
          }, 50);  

          key('enter', 'mpending', function() {
            clearInterval(ending);
            delete loader.game;
            key.setScope('null');
            loader.gameStateMachine.endingScreenDone();
          })  
        },


      }
    })

  }

})(this)