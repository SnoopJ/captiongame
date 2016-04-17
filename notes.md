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
    * [ ] vote round view
  * implementation (James)
    * [ ] show/hide containers for the 'dumb' way

### socket.io event system (James);
example **incoming** and *outgoing* events:
  * [ ]**newRound**, **roundOver**
    * word, image, or vote round
  * [ ]**timeRemaining** (should this be an event or just a prescribed time?  probably the latter)
  * [ ] *sendWord*
  * [ ] *sendImageSentence*
  * [ ] **wordTakenByPlayer**

### back-end (James)
* image DB (pre-seeded)
  * download a bunch of images
* socket.io for communication
* node.js

## ICING ON THE CAKE TIME

* d3.js integration of ...some kind bc prize?
* pulling images from the webbernet
