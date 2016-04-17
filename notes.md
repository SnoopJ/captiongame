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
  * implementation (Wu/James)
    * [x] show/hide containers for the 'dumb' way
    * [x] build sentence with known words
    * [x] populate word lists
    * [x] freebie scroll menu of some sort
      - push button, get scroll list
    * [x] enlarge image on sentence construction screen
    * [x] populate image from socket event
    * [ ] populate vote from socket event (☺)
    * [ ] show the results of the vote
    * [ ] send word choices with socket event
    * [ ] send sentence with socket event
    * [ ] send vote with socket event

### socket.io event system (James);
example **incoming** and *outgoing* events in socket.io:
  * [x]**newRound**
    * [x] prescribed round end time
  * [ ] *sendWord*
  * [ ] **wordTakenByPlayer**
  * [x] *sendSentence*
  * [ ] *sendVote*
  * [x] **invalidSentence** (☺)
  * [ ] **sentenceResults** (☺)
  * [ ] **voteReults** (☺)

### back-end (James)
* image DB (pre-seeded)
  * download a bunch of images
* game logic
  * [ ] starting the game, players join unique URL or whatever
  * [ ] generating words for draft, sending to players
  * [ ] tracking player word choices authoritatively
  * [x] timing for rounds, sending updates if relevant
  * [x] switching rounds with a signal
  * [x] tracking and authenticating sentences
    * [x] send socket reply if rejected
  * [ ] distributing sentences for vote round (☺)
  * [ ] tracking player votes and distributing when complete (☺)
* socket.io for communication
* node.js

## THANKS
* HackDFW staff
* [FoolBoyMedia on FreeSound.org](https://www.freesound.org/people/FoolBoyMedia/sounds/234565/)

## ICING ON THE CAKE TIME

* d3.js integration of ...some kind bc prize?
* pulling images from the webbernet
* gif/gifv support
