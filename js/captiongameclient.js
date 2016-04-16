var socket = io();

socket.on('gamestarted', function(data) {
  console.log("game started!")
});

socket.on('nextround', function(roundInfo) {
  console.log("going to next round, which is numbeR " + roundInfo.n)
});

socket.on('gameover', function(data) {
  console.log("game over!");
});
