var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;

var fs = require('fs');
var freebies;
fs.readFile('freebies.json', 'utf8', function (err, data) {
  if (err) throw err;
  freebies = JSON.parse(data).freebieWords;
});

app.set('port', port);
server.listen(port);

app.use('/static/',express.static(__dirname))
//app.use('/',express.static(__dirname))
app.get("/play*", function(req,res) {
  //  console.log(req.url);
   res.sendFile(__dirname + '/index.html');
 });

io.on('connection', function(socket){
    socket.join("gameRoom");
    // console.log('client connected (id: ' + socket.id +' )');
    socket.on('disconnect', function(){
      // console.log('client disconnected (id: ' + socket.id +' )');
    });

    socket.on('startGame', function(){
      console.log("Received request to start a game cycle");
      game = new captionGame(socket);
      game.startGame();
    })
    socket.on('sendSentence', function(msg) {
//      console.log("Message from " + socket.id);
      // TODO: not hard-coded, but seeded from the word draft round
      playerWords = [
        "cupcake",
        "doge",
        "sweet",
        "diabetic",
        "fat",
        "yellow",
        "dumb"
      ];
      words = msg.sentence.split(' ').filter(function(s) { return s!=""; });
      badwords = words.filter(function(s){
        return freebies.concat(playerWords).indexOf(s.toLowerCase())<0;
      });
      if (badwords.length>0 || words.length == badwords.length) {
        socket.emit('invalidSentence',{
          sentence: msg.sentence,
          invalidWords: badwords,
          empty: (words.length == 0)
        });
      } else {
        socket.emit('sentenceAccepted');
      }
    });
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
          // console.log("Going to round " + this.currentRound);
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
