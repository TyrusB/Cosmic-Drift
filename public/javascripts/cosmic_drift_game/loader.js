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
        { name: 'scrollIntro',     from: 'none',            to: 'intro'              },
        { name: 'finishedIntro',   from: 'intro',           to: 'playerSelect'       },
        { name: 'onePlayer',       from: 'playerSelect',    to: 'singlePlayerGame'   },
        { name: 'twoPlayers',      from: 'playerSelect',    to: 'waitingForOther'    },
        { name: 'allPlayersReady', from: 'waitingForOther', to: 'countdown'          },
        { name: 'countdownDone',   from: 'countdown',       to: 'multiplayerGame'        },

        { name: 'crashed', from: 'singlePlayerGame', to: 'singlePlayerCredits'},
        { name: 'creditsDone', from: 'singlePlayerCredits', to: 'playerSelect'},

        { name: 'gameWon',        from: 'multiplayerGame', to: 'windingDownWon'        },
        { name: 'gameLost',       from: 'multiplayerGame',   to: 'windingDownLost'        },
        { name: 'gameLost',       from: 'singlePlayerGame',   to: 'spEndingCredits'        },
        { name: 'gameOver',   from: 'windingDownLost',       to: 'endingScreen'        },
        { name: 'gameOver',   from: 'windingDownWon',       to: 'endingScreen'        }
      ],
      callbacks: {
        onscrollIntro: function(event, from, to) {
          console.log('intro method called');
          $('#rcanvas').hide();
          $('#lcanvas').hide();
          $('#midcanvas').show();

          var maxFrames = 160,
              frameNo = 0;

          var ctx = loader.midcanvas.getContext('2d');
          var center_x = midcanvas.width / 2,
              center_y = midcanvas.height / 2;

          var scrollIntroText = function() {
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
          }

          var scroll = setInterval(scrollIntroText, 25);


          var game = this;
          key.setScope('intro');

          key('enter', 'intro', function() {
            clearInterval(scroll);

            loader.gameStateMachine.finishedIntro();
          });
        },

        onplayerSelect: function() {
          var ctx = loader.midcanvas.getContext('2d');
          var center_x = midcanvas.width / 2,
              center_y = midcanvas.height / 2;

          var selector = null;

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
          
          ctx.clearRect(0, 0, loader.midcanvas.width, loader.midcanvas.height);
          drawPlayerSelection();
          

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
          var maxFrames = 100;
          key.setScope('ending');
          
          var frameNo = 0;
          var ctx = loader.midcanvas.getContext('2d');
          var center_x = loader.midcanvas.width / 2,
              center_y = loader.midcanvas.height / 2,
              canvasWidth = loader.midcanvas.width,
              canvasHeight = loader.midcanvas.height;

          var loadFrame = function() {
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

          }

          var ending = setInterval(loadFrame, 40);     

          key('enter', 'ending', function() {
            clearInterval(ending);
            loader.game = null;
            loader.gameStateMachine.creditsDone();
          })  
        },

        onwaitingForOther: function() {
          // var midctx = loader.midcanvas.getContext('2d');
          // midctx.clearRect(0, 0, loader.midcanvas.width, loader.midcanvas.height);

          $('#midcanvas').hide();
          $('#lcanvas').show();
          $('#rcanvas').show();

          key.setScope('waiting');

          var rctx = loader.rcanvas.getContext('2d');
          rctx.beginPath();
          var center_rx = loader.rcanvas.width / 2,
              center_ry = loader.rcanvas.height / 2;

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

          root.openConnection.indicateReady();
          root.openConnection.socket.on('players_ready', function() {
            console.log('ready message received');
            clearInterval(waitingDots);
            loader.gameStateMachine.allPlayersReady();
          });
        },

        oncountdown: function() {
          var rctx = loader.rcanvas.getContext('2d'),
              lctx = loader.lcanvas.getContext('2d');
          var center_rx = loader.rcanvas.width / 2,
              center_ry = loader.rcanvas.height / 2;
          var center_lx = loader.lcanvas.width / 2,
              center_ly = loader.lcanvas.height / 2;


          rctx.clearRect(0, 0, rcanvas.width, rcanvas.height);
          rctx.beginPath();
          rctx.font = '30pt Calibri';
          rctx.textAlign = 'center';
          rctx.fillStyle = 'red';
          rctx.fillText('Opponent Found', center_rx, center_ry - 150);
          rctx.fillText('Get Ready!', center_rx, center_ry - 75);

          function prepareLContext() {
            lctx.clearRect(0, 0, lcanvas.width, lcanvas.height);
            lctx.beginPath();
            lctx.font = '60pt Calibri';
            lctx.textAlign = 'center';
            lctx.fillStyle = 'white';
          }
          
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
              clearInterval(countdown);
              loader.gameStateMachine.countdownDone();
            }
          }, 750)
        },

        onplayingMultiplayerGame: function() {
          key.setScope('game');
          loader.game = new Asteroids.Game(loader.lcanvas, true);
          loader.game.start();

          window.openConnection.beginListening(loader.rcanvas);
        },


      }
    })

  }

})(this)