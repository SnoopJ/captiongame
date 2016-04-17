var socket = io();

socket.on('gameStart', function(data) {
  $("<div>Game started!</div>").appendTo("body");
});

socket.on('nextRound', function(roundInfo) {
  $("<div>Going to next round, which is number " + roundInfo.n +"</div>").appendTo("body");
});

socket.on('gameEnd', function(data) {
  $("<div>Game Over!</div>").appendTo("body");
});

function doGame() {
  socket.emit('startGame');
}
