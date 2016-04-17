var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 80;

app.set('port', port);
server.listen(port);

app.use('/static',express.static(__dirname))
app.use('/',express.static(__dirname))
// app.get("/", function(req,res) {
//   res.sendFile(__dirname + '/index.html');
// });

io.on('connection', function(socket){
    console.log('client connected (id: ' + socket.id +' )');
    socket.on('disconnect', function(){
      console.log('client disconnected (id: ' + socket.id +' )');
    });

    socket.on('startGame', function(){
      console.log("Received request to start a game cycle");
      game = new captionGame(socket);
      game.startGame();
    })
});

captionGame = function(sock) {
    return {
      numRounds: 3,
      currentRound : 1,
      socket: sock,

      startGame : function () {
        console.log("Starting game!");
        this.socket.emit('gameStart');
        var self = this;
        setTimeout(function() { self.nextRound() },1500);
      },
      nextRound : function () {
        if (this.currentRound >= this.numRounds) {
          this.endGame();
        } else {
          this.currentRound += 1;
          console.log("Going to round " + this.currentRound);
          this.socket.emit('nextRound',{n: this.currentRound});
          var self = this;
          setTimeout(function() { self.nextRound() },1500);
        }
      },
      endGame : function () {
        console.log("Game over!");
        this.socket.emit('gameEnd');
      }
    };
};
