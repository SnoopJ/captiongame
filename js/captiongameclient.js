var socket = io();

socket.on('gameStart', function(data) {
  console.log("Game started!");
  $("audio")[0].play();
});

socket.on('nextRound', function(roundInfo) {
  console.log(roundInfo);
  startRound(roundInfo.n,roundInfo.expiretime);
});

socket.on('gameEnd', function(data) {
  console.log("Game over!")
  startRound(1,0);
});

function doGame() {
  socket.emit('startGame');
}

function startTimer(duration) {
   $(".timer:visible").width('100%')
   $(".timer:visible").animate(
     {
       width: '0px'
     },
     {
       easing:'linear',
       duration: duration,
       progress: function(anim,progress,remainingMs) {
         $(".timeRemaining").text(Math.round(remainingMs/100)/10 + " s");
       }
     }
   )
}

var roundids = ["word","image","vote"];
function showRound(id) {
  console.log(id)
  $(".roundContainer").hide();
  $("#"+id+"RoundContainer").fadeIn({duration: 300});
}

function startRound(roundNumber,expireTime) {
    showRound(roundids[roundNumber-1]);
    now = (new Date()).getTime()
    dt = expireTime>now ? expireTime - now : 0;
    startTimer(dt);
}
