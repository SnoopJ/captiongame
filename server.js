var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 80;

app.set('port', port);
server.listen(port);

app.use('/static',express.static(__dirname))
app.get("/", function(req,res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('client connected (id: ' + socket.id +' )');
    socket.on('disconnect', function(){
      console.log('client disconnected (id: ' + socket.id +' )');
    });

    socket.on('gamestart', function(){
      console.log("Received request to start a game cycle");
      game = new captionGame(socket);
      // socket.emit('gamestarted');
      // socket.emit('gameover');
      // socket.emit('nextround',{n:3});
      game.startGame();
    })
});

captionGame = function(sock) {
    return {
      currentRound : 1,
      socket: sock,

      startGame : function () {
        console.log("Starting game!");
        this.socket.emit('gamestarted');
        var self = this;
        setTimeout(function() { self.nextRound() },1500);
      },
      nextRound : function () {
        if (this.currentRound > 3) {
          this.endGame();
        } else {
          this.currentRound += 1;
          console.log("Going to round " + this.currentRound);
          this.socket.emit('nextround',{n: this.currentRound});
          var self = this;
          setTimeout(function() { self.nextRound() },1500);
        }
      },
      endGame : function () {
        console.log("Game over!");
        this.socket.emit('gameover');
      }
    };
};
