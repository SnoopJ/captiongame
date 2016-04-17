# CAPTION GAME - A HERO'S TALE

## user story

* word generation (wordRound) - each user provides X words of Y variety, not necessarily same
* randomly selected image (from DB, could maybe pull from SFW imgur etc.) is revealed
* users have limited (<30 s) time to construct a short sentence (word limit?) about it (imageRound)
* users see each others sentences, and get to vote for their favorite, points are assigned (voteRound)
* next round until game over

## technical details
### front-end (Wu + James)
* bootstrap layout for each 'view':
  * design (Wu)
    * [x] word round view
    * [x] image round view
    * [x] vote round view
  * implementation (James)
    * [x] show/hide containers for the 'dumb' way
    * [ ] populate words from socket event
    * [ ] populate image from socket event
    * [ ] populate vote from socket event
    * [ ] show the results of the vote
    * [ ] send word choices with socket event
    * [ ] send sentence with socket event
    * [ ] send vote with socket event

### socket.io event system (James);
example **incoming** and *outgoing* events in socket.io:
  * [ ]**newRound**
  * [ ]**roundOver**
  * [ ]**timeRemaining** (should this be an event or just a prescribed time?  probably the latter)
  * [ ] *sendWord*
  * [ ] *sendImageSentence*
  * [ ] *sendVote*
  * [ ] **wordTakenByPlayer**
  * [ ] **sentenceReults**
  * [ ] **voteReults**

### back-end (James)
* image DB (pre-seeded)
  * download a bunch of images
* [ ] game logic
  * [ ] starting the game, players join unique URL or whatever
  * [ ] generating words for draft, sending to players
  * [ ] tracking player word choices authoritatively
  * [ ] timing for rounds, sending updates if relevant
  * [ ] switching rounds with a signal
  * [ ] tracking and authenticating sentences
  * [ ] distributing sentences for vote round
  * [ ] tracking player votes and distributing when complete
* socket.io for communication
* node.js

## ICING ON THE CAKE TIME

* d3.js integration of ...some kind bc prize?
* pulling images from the webbernet
