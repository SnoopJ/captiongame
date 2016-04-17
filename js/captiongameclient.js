var socket = io();

socket.on('gameStart', function(data) {
  console.log("Game started!");
  $("audio")[0].play();
});

socket.on('nextRound', function(roundInfo) {
  //console.log(roundInfo);
  startRound(roundInfo.n,roundInfo.expiretime);
});

socket.on('gameEnd', function(data) {
  console.log("Game over!")
  startRound(1,0);
});

function doGame() {
  socket.emit('startGame')
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

var roundids = ["word","image","vote","winner"];
function showRound(id) {
  //console.log(id)
  $(".roundContainer").hide();
  $("#"+id+"RoundContainer").fadeIn({duration: 300});
}

function startRound(roundNumber,expireTime) {
    showRound(roundids[roundNumber-1]);
    now = (new Date()).getTime()
    dt = expireTime>now ? expireTime - now : 0;
    startTimer(dt);
}

var freebies;
$(function() {
  $.getJSON({
    url:"/static/freebies.json",
    success: function(data) {
      freebies = data.freebieWords;
      freebies.forEach(function(e){
        $("#freebieDropdownBody").append($('<a style="width: 50%" class="btn btn-primary btn-lg" role="button">' + e + '</a>'));
      })
      // console.log("freebie words:",freebies);
    }
  })

  var playerWords = ["Fat","Ugly","Bad","Diabetic","Dumb"]
  //var test = ;
  //Populate the player wordbank
  playerWords.forEach(function(e){
    $("#playerWordBank").append($('<a style="width: 50%" class="btn btn-primary btn-lg" role="button">' + e + '</a>'));
  })

  var globalWordBank = ["Fat","Ugly","Bad","Diabetic","Dumb","Corpulent","Doge","Red","Blue","Orange","Soggy","Sad","Opulent","Regal","Flacid"]
  globalWordBank.forEach(function(e){
    $("#globalWordBank").append($('<a style="width: 50%" class="btn btn-primary btn-lg" role="button">' + e + '</a>'));
  })

  // extract button word
  $('#playerWordBank').on('click', '.btn',function() {
    input = $("#userSentence");
    word = $(this).text();
    if ( input.val().indexOf(word) < 0 ) {
      // check if there's already a space with ternary
      hasSpace = input.val().length == 0 || input.val().substr(-1,1) == " ";
      input.val( input.val() + (hasSpace ? "" : " ") + word + " " );
    }
  });

  $('#freebieDropdownBody').on('click', '.btn',function() {
    input = $("#userSentence");
    word = $(this).text();
      // check if there's already a space with ternary
      hasSpace = input.val().length == 0 || input.val().substr(-1,1) == " ";
      input.val( input.val() + (hasSpace ? "" : " ") + word + " " );
    $('#myModal').modal('hide');
  });

  $('smallThumbnail').on('click',function(){
    input = $("#userSentence");
    console.log( "Submitting sentence:\n", input.val() );
    socket.emit('sendSentence',{ sentence: input.val() });
  });

  $("#submitSentence").on('click',function(){
    input = $("#userSentence");
    console.log( "Submitting sentence:\n", input.val() );
    socket.emit('sendSentence',{ sentence: input.val() });
  });
});
