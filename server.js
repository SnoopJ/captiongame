var express = require('express');
var app = express();
var http = require('http');
var request = require('request');
var server = http.Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 80;

var fs = require('fs');
var glob = require('glob');
var games = {};
var sendPlayersReady;

var imageDB=[];
glob("img/imageDB/@(*.jpg|*.png|*.gif)",null,function(er,files) {
  files.forEach( function(e,i,a) {
    console.log('/static/'+e);
    a[i] = "/static/" + e; }
  );
  imageDB = imageDB.concat(files);
});

try {
  imgurapikey = fs.readFileSync('imgurapikey', 'utf8');
} catch (e) {
  if( e.code === 'ENOENT' ){
    console.error("Cannot read API key from imgurapikey file, skipping imgur...");
  } else {
    throw e;
  }
}

if (typeof(imgurapikey) != "undefined") {
  request({
    headers: {
      Authorization: "Client-ID " + imgurapikey
    },
    url: "https://api.imgur.com/3/gallery/t/cute/viral"

  },function (err,res,body) {
    if (res === undefined || res.statusCode != 200) {
      console.error("Something went wrong trying to talk to imgur:\n" + res.statusMessage);
    } else {
      var imgs = JSON.parse(body).data.items;
      imgs = imgs.filter( function(img) {
        return typeof(img.gifv)=="undefined" && img.is_album == false;
      });
      imgs.forEach (function(e,i,a) { imageDB = imageDB.concat(e.link); })
    }

    if (imageDB.length <= 0) {
      console.error("No images to serve, quitting...");
      process.exit(1);
    }
  });
}


app.set('port', port);
server.listen(port);

app.use('/static/',express.static(__dirname))
app.use('/$',function(req,res) { res.redirect("/play/defaultGame") });
app.get("/play*", function(req,res) {
   res.sendFile(__dirname + '/index.html');
 });

io.on('connection', function(socket){
    // console.log('client connected (id: ' + socket.id +' )');
    socket.on('disconnect', function(){
      // console.log('client disconnected (id: ' + socket.id +' )');
      gameid = socket.gameid;
      if ( typeof(gameid) != "undefined" ) { // if this socket has had anything to do with a game, remove them
        delete(games[gameid].players[socket.id]);
        delete(games[gameid].playersReady[socket.id]);
        sendPlayersReady(gameid);
      }
    });

    socket.on('joinGame', function(msg) {
      gameid = msg.gameid;
      console.log("Client " + socket.id + " is joining game with id " + gameid);
      // console.log(games[gameid]);
      socket.join(gameid);
      socket.gameid = gameid;
      // console.log(gameid);
      if (typeof(games[gameid]) == "undefined") {
        game = new captionGame(gameid);
        games[gameid] = game;
      }
      games[gameid].players[socket.id] = "Enigma"; // Default username until a player readies up
      games[gameid].playervotes[socket.id] = -1;
      console.log(Object.keys(games[gameid].players));
      sendPlayersReady(gameid);
    });

    sendPlayersReady = function (gameid) {
        if ( typeof(games[gameid]) == "undefined" ) {
          return false;
        }
        if ( games[gameid].running == "stale" ) {
          games[gameid].playersReady = {};
          games[gameid].running = false;
        }
        readyPlayers = Object.keys(games[gameid].playersReady).length;
        numPlayers = Object.keys(games[gameid].players).length;
       io.to(gameid).emit("playersReady",{
        readyPlayers: readyPlayers,
        numPlayers: numPlayers
       });
       if( numPlayers > 1 && readyPlayers == numPlayers ) {
         games[gameid].startGame(gameid);
       }
     }
    socket.on('playerReady', function(msg) {
      if (!games[msg.gameid].running) { // if the game isn't already going
        // console.log( io.nsps['/'].adapter.rooms[msg.gameid] );
        if (msg.playerName.length > 0) {
          console.log("Socket " + socket.id + " has playerName " + msg.playerName );
          games[msg.gameid].players[socket.id] = msg.playerName;
        }
        games[msg.gameid].playersReady[socket.id] = true;
        sendPlayersReady(msg.gameid);
      }
    });
    // TODO: ready mechanism?
    // socket.on('startGame', function(){
    //   console.log("Received request from " + socket.id + " to start a game cycle");
    //   game.startGame(socket.gameid);
    // });
    socket.on('voteSentence', function(msg){
      if (typeof(games[msg.gameid]) == "undefined" ) {
        console.error("Unknown game");
      }
      if ( typeof(sentence) == "undefined" ) {
        console.error("Unknown sentence");
      }

      prevVote = games[msg.gameid].playervotes[socket.id];
      if ( prevVote >0 ) {
        console.log("Previous vote for "+prevVote+" decrementing");
        games[msg.gameid].sentences[prevVote-1].votes -= 1;
      }
      if ( msg.voteFor > 0 && msg.voteFor <= games[msg.gameid].sentences.length ) {
        games[msg.gameid].sentences[msg.voteFor-1].votes += 1;
      } else {
        console.error("Invalid vote");
      }
      games[msg.gameid].playervotes[socket.id] = msg.voteFor;
      console.log("Vote for ",msg.voteFor, games[msg.gameid].sentences );
    });
    socket.on('sendSentence', function(msg) {
      words = msg.sentence.split(' ').filter(function(s) { return s!=""; });

      if (words.length>0) {
        socket.emit('sentenceAccepted');
        games[msg.gameid].sentences = [].concat(games[msg.gameid].sentences,{sender:socket.id, sentence:msg.sentence, votes:0});
        console.log("Sentences stored ",games[msg.gameid].sentences);
      }
    });
});

lazyClone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
}
captionGame = function(gameid) {
    return {
      running: false,
      numRounds: 3,
      roundDuration: [0,30000,20000],
      currentRound : 1,
      gameid: gameid,
      image: imageDB[ Math.floor( imageDB.length*Math.random() ) ], // randomly chosen image from our DB
      playervotes: [],
      sentences: [],
      //players: lazyClone(io.nsps['/'].adapter.rooms[gameid].sockets), // list of players in this room
      players: {},
      playersReady: {},
      votingPool: [],
      results: [],


      startGame : function () {
        console.log("Starting game with gameid ",this.gameid);
        console.log("The player list is ",this.players);
        this.running=true;
        io.to(this.gameid).emit('gameStart');
        var self = this;
        self.nextRound();

      },
      nextRound : function () {
        if (this.currentRound >= this.numRounds) {
          this.endGame();
        } else {
          this.currentRound += 1;
          if(this.sentences.length>0){
            this.sentences.forEach( function(e,i,a) { this.votingPool = this.votingPool.concat(e.sentence); console.log(this.votingPool) }, this );
          }
          io.to(this.gameid).emit('nextRound',{
            roundNumber: this.currentRound,
            roundDuration: this.roundDuration[this.currentRound-1],
            startTime: (new Date()).getTime(),
            image: this.currentRound > 1 ? this.image : "",
            votingPool: this.votingPool
          });
          var self = this;
          setTimeout(function() { self.nextRound() },self.roundDuration[self.currentRound-1]);
        }
      },
      endGame : function () {
        console.log("Game over!");
        winner = "Nobody!";
        sentence = "I have no mouth, and I must scream";
        maxvotes = 0;
        var sorted = this.sentences.sort( function(a,b) {
          if( a.votes > b.votes ) {
            return 1;
          } else if ( a.votes < b.votes ) {
            return -1;
          } else {
            return 0;
          }
        })
        win = sorted.pop();
        while( typeof(win) == "undefined" || typeof(win.sender) == "undefined" || typeof(this.players[win.sender]) == "undefined" ) {
          win = sorted.pop();
        }
        winner = this.players[win.sender];
        sentence = win.sentence;
        var popped;
        while( popped = sorted.pop() ) {
          if ( win.votes == popped.votes ) {
            winner = "A tie!";
            sentence = [].concat(sentence,popped.sentence);
          } else {
            break;
          }
        }

        io.to(this.gameid).emit('gameEnd',{winner: winner, sentence: sentence});

        this.playersReady = {};
        this.running=false;
        this.numRounds= 3;
        this.currentRound = 0;
        this.gameid= gameid;
        this.image= imageDB[ Math.floor( imageDB.length*Math.random() ) ]; // randomly chosen image from our DB
        this.sentences= {};
        //players: lazyClone(io.nsps['/'].adapter.rooms[gameid].sockets), // list of players in this room
        this.players= {};
        this.playersReady= {};
        this.votingPool= [];
        this.results= [];
        sendPlayersReady();
      }
    };
};
