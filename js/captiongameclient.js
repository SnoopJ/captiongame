var socket = io();

socket.on('gameStart', function(data) {
  // $("<div>Game started!</div>").appendTo("body");
});

socket.on('nextRound', function(roundInfo) {
  // $("<div>Going to next round, which is number " + roundInfo.n +"</div>").appendTo("body");
  roundNumber = roundInfo.n;
  if( roundNumber == 2 ) {
    showImageRound();
  } else if ( roundNumber == 3 ) {
    //showVoteRound();
  }
});

socket.on('gameEnd', function(data) {
  // $("<div>Game Over!</div>").appendTo("body");
});

function doGame() {
  socket.emit('startGame');
}

function showWordRound() {
  $("#imageRoundContainer").hide();
  $("#voteRoundContainer").hide();

  $("#wordRoundContainer").slideDown({duration: 300});
}

function showImageRound() {
  $("#wordRoundContainer").hide();
  $("#voteRoundContainer").hide();

  $("#imageRoundContainer").slideDown({duration: 300});
}

function showVoteRound() {
  $("#wordRoundContainer").hide();
  $("#imageRoundContainer").hide();

  $("#voteRoundContainer").slideDown({duration: 300});
}
