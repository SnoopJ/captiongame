var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 80;

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
   console.log(req.url.split('/play'));
   res.sendFile(__dirname + '/index.html');
 });

io.on('connection', function(socket){
    // console.log('client connected (id: ' + socket.id +' )');
    socket.on('disconnect', function(){
      // console.log('client disconnected (id: ' + socket.id +' )');
    });

    socket.on('joinGame', function(msg) {
      socket.gameid = msg.gameid;
      socket.join(msg.gameid);
      console.log( io.nsps['/'].adapter.rooms[msg.gameid] );
    });

    // TODO: ready mechanism?
    socket.on('startGame', function(){
      console.log("Received request from " + socket.id + " to start a game cycle");
      game = new captionGame(socket.gameid);
      game.startGame(socket.gameid);
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

lazyClone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
}
var roundtime = 3000;
var imageDB = [
  "Doge_Image.jpg",
  "rarepepe.png",
  "xY2xDxo.jpg",
  "HdkHVRb.jpg",
  "CWlEICI.jpg",
  "5Hh7Yqz.jpg"
];
captionGame = function(gameid) {
    return {
      numRounds: 3,
      roundDuration: [roundtime,roundtime,roundtime],
      currentRound : 0,
      gameid: gameid,
      image: "/static/"+imageDB[ Math.floor( imageDB.length*Math.random() ) ],
      //players: io.nsps['/'].adapter.rooms, // list of players in this room
      players: lazyClone(io.nsps['/'].adapter.rooms[gameid].sockets), // list of players in this room

      startGame : function () {
        console.log("Starting game with gameid ",this.gameid);
        console.log("The player list is ",this.players);
        io.to(this.gameid).emit('gameStart');
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
          io.to(this.gameid).emit('nextRound',{
            roundNumber: this.currentRound,
            expireTime: (new Date()).getTime() + this.roundDuration[this.currentRound-1],
            image: this.currentRound > 1 ? this.image : ""
          });
          var self = this;
          setTimeout(function() { self.nextRound() },self.roundDuration[self.currentRound-1]);
        }
      },
      endGame : function () {
        console.log("Game over!");
        io.to(this.gameid).emit('gameEnd');
      }
    };
};
