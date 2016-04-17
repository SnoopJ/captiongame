var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;

app.set('port', port);
server.listen(port);

app.use('/static',express.static(__dirname))
//app.use('/',express.static(__dirname))
app.get("/play*", function(req,res) {
  //  console.log(req.url);
   res.sendFile(__dirname + '/index.html');
 });

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

var roundtime = 10000;
captionGame = function(sock) {
    return {
      numRounds: 3,
      roundDuration: [roundtime,roundtime,roundtime],
      currentRound : 0,
      socket: sock,

      startGame : function () {
        console.log("Starting game!");
        this.socket.emit('gameStart');
        var self = this;
        self.nextRound();
        //setTimeout(function() { self.nextRound() },self.roundDuration[0]);
      },
      nextRound : function () {
        if (this.currentRound >= this.numRounds) {
          this.endGame();
        } else {
          this.currentRound += 1;
          console.log("Going to round " + this.currentRound);
          this.socket.emit('nextRound',{
            n: this.currentRound,
            expiretime: (new Date()).getTime() + this.roundDuration[this.currentRound-1]
          });
          var self = this;
          setTimeout(function() { self.nextRound() },self.roundDuration[self.currentRound-1]);
        }
      },
      endGame : function () {
        console.log("Game over!");
        this.socket.emit('gameEnd');
      }
    };
};
