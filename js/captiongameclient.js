var socket = io();

socket.on('gameStart', function(data) {
  // $("<div>Game started!</div>").appendTo("body");
  startWordRound();
});

socket.on('nextRound', function(roundInfo) {
  // $("<div>Going to next round, which is number " + roundInfo.n +"</div>").appendTo("body");
  roundNumber = roundInfo.n;
  if( roundNumber == 2 ) {
    console.log("Moving to image round...")
    startImageRound();
  } else if ( roundNumber == 3 ) {
    console.log("Moving to vote round...")
    startVoteRound();
  }
});

socket.on('gameEnd', function(data) {
  // $("<div>Game Over!</div>").appendTo("body");
  showWordRound();
});

function doGame() {
  socket.emit('startGame');
}

function startWordRound() {
    showWordRound();
    startTimer(10000);
}
function startImageRound() {
    showImageRound();
    startTimer(10000);
}
function startVoteRound() {
    showVoteRound();
    startTimer(10000);
}

function startTimer(duration) {
   $(".timer:visible").width('100%')
   $(".timer:visible").animate({width: '0px'},duration,'linear')
}

function showWordRound() {
  $("#imageRoundContainer").hide();
  $("#voteRoundContainer").hide();

  $("#wordRoundContainer").fadeIn({duration: 300});
}

function showImageRound() {
  $("#wordRoundContainer").hide();
  $("#voteRoundContainer").hide();

  $("#imageRoundContainer").fadeIn({duration: 300});
}

function showVoteRound() {
  $("#wordRoundContainer").hide();
  $("#imageRoundContainer").hide();

  $("#voteRoundContainer").fadeIn({duration: 300});
}

// setTimeout(showImageRound,1000);
// setTimeout(showVoteRound,2000);
