let wheel = require('./wheel.js');

guessWords.getRandClue = function () {
  var max = this.length
  var min = 0
  randI = Math.floor(Math.random() * (max - min)) + min
  var category = this[randI].category
  var clue = this[randI].clue
  guessWords.splice(randI,1)
  return [category, clue]
};

var gameScore = [0,0];
var roundScore = [0,0];
var currPlayer = 0;
var round = 1;

var arr = guessWords.getRandClue();
var clue = arr[1];
var category = arr[0];
console.log(category, ",", clue);

var clueTablePos = [];
var guessedLetters = "";
var buyAVowel = false;
var allowTurnWheel = false;

var $tiles = [$(".tile.r1"),$(".tile.r2"),$(".tile.r3")];
var tilesPerRow = $tiles[0].length;
var $category = $("#category");

var $instructionBox = $("#instructions");


var $p1Name = $("#p1-name");
var $p2Name = $("#p2-name");
var pNames = [$p1Name.val(), $p2Name.val()];

var $p1roundScore = $("#p1-score");
var $p2roundScore = $("#p2-score");
var $p1gameScore = $("#p1-bank");
var $p2gameScore = $("#p2-bank");
var pScore = {  roundEl: [$p1roundScore, $p2roundScore],
                gameEl: [$p1gameScore, $p2gameScore]};


var $startButton = $("#start");
var $guessInput = $("#guess-input");
var $spinButton = $("#spin");
var $buyVowelButton = $("#buy-vowel");
var $solveButton = $("#solve");
var $wheel = $("#wheel");

$wheel.values = [ 50000,
                  5000,
                  8500,
                  3000,
                  5000,
                  4500,
                  labels.loseTurn,
                  4000,
                  9500,
                  3500,
                  5000,
                  6500,
                  labels.bankrupt,
                  7000,
                  3000,
                  3000,
                  8000,
                  9000,
                  6000,
                  3000,
                  5500,
                  7500,
                  4000,
                  5000,
                  3000];

$wheel.getValue = function () {
  var max = this.values.length
  var min = 0
  return this.values[Math.floor(Math.random() * (max - min)) + min]
}

/* --------------------------------------------------------------- */

showStartButton()
function showStartButton () {
  $startButton.show().on("click", function (e) {
    $startButton.fadeOut("fast").off()

    emptyBoard()
    placeTiles()
    showMessage(labels.letsPlay, true) // shows message and displays continue button

    $("table").fadeIn('slow')
    for (var i=0; i<gameScore.length; i++) {
      pScore.roundEl[i].html(0)
      pScore.gameEl[i].html(gameScore[i])
    }
  })
}

/* --------------------------------------------------------------- */
function showMessage(msg, showContinue, nextRound) {
  $instructionBox.html(msg + " ")
  if(showContinue) {
    $instructionBox.append($("<button id=continue>").click(function () {
      $(this).hide()
      choose()
    }).html(">"))
  }
  if (nextRound) {
    $instructionBox.append($("<button id=continue>").click(function () {
      $(this).hide()
      emptyBoard()
      var arr = guessWords.getRandClue()
      console.log(arr)
      clue = arr[1]
      category = arr[0]
      placeTiles()
      // reset scores display for round
      for (var i=0; i<gameScore.length; i++) {
        pScore.roundEl[i].html(0)
      }
      showMessage(labels.playRound + round,true)
    }).html(">"))
  }
}

function currPlayerName() {
  pNames = [$p1Name.val(), $p2Name.val()]
  return pNames[currPlayer]
}

function emptyBoard() {
  for (var i=0; i<$tiles.length; i++) {
    $tiles[i].removeClass("blank-tile").html("")
  }
}

function placeTiles(solved) {
  var clueArr = clue.split(" ")
  var currRow = 0
  var currCol = 0
  var k = 0
  clueTablePos = []

  $category.html(category)

  for(var i=0; i<clueArr.length; i++) {  //for each element (aka word) in clue
    var currWord = clueArr[i]
    if(currCol + currWord.length < tilesPerRow) { //if element fits
      if(currCol !== 0) { //if not on first column add a space
        currCol += 1
      }
    } else {
      currRow += 1 //go to next row
      currCol = 0 //go to first tile of that row
    }
    for(var j=0; j< currWord.length; j++) {
      flipTiles(currRow, currCol, k, solved, currWord[j])
      clueTablePos.push([currRow, currCol])
      currCol++
      k++
    }
  }
}

function flipTiles (passedCurrRow, passedCurrCol,tileNum, solvedBool, currLetter) {
  window.setTimeout(function () {
    $($tiles[passedCurrRow][passedCurrCol]).delay(1000).addClass('blank-tile')
    if(solvedBool) {
      $($tiles[passedCurrRow][passedCurrCol]).html(currLetter)
    }
  }, tileNum*150)

}

function choose() {
  enableChoices()
  showMessage(sprintf(labels.whatDoYouWant, currPlayerName()), false)
}

function enableChoices() {
  $spinButton.show().on("click", spin)
  $buyVowelButton.show().on("click", buyVowel)
  $solveButton.show().on("click", solve)
}

function disableChoices() {
  $spinButton.hide().off()
  $buyVowelButton.hide().off()
  $solveButton.hide().off()
}

function getWheelScore (spinValue) {
  if(allowTurnWheel) {
    buyAVowel = false;
    disableChoices();

    if(spinValue === labels.bankrupt) {
      showMessage(sprintf(labels.bravo, spinValue), true)
      updateScore(0,0,true)
      nextPlayer()

    } else if (spinValue === labels.loseTurn) {
      showMessage(spinValue +  " " + currPlayerName() + ".", true)
      nextPlayer()
    } else {
      var returnDown = false
      $guessInput.show().focus().keydown(function (event){
        if(event.which === 13 && returnDown === false) {
          returnDown = true
          guess($(this).val(), spinValue)
          $(this).val("")
        }
      }).keyup(function(event) {
        if(event.which === 13 && returnDown === true){
          returnDown = false
        }
      })
      showMessage(sprintf(labels.guessLetter, spinValue, currPlayerName()), false)
    }
  }
  allowTurnWheel = false;
}
exports.getWheelScore = getWheelScore;

function spin () {
  disableChoices();
  buyAVowel = false;
  showMessage(labels.turnWheel);
  allowTurnWheel = true;
}

function buyVowel () {
  //check if you can even buy a vowel
  if(roundScore[currPlayer] < 250) {
    showMessage(labels.atLeast, false)
    $guessInput.hide().off()
  } else {
    spinValue = -250
    disableChoices()
    showMessage(labels.vowelPrice, false)
    var returnDown = false
      $guessInput.show().focus().keydown(function (event){
        if(event.which === 13 && returnDown === false) {
          returnDown = true
          guessVowel($(this).val(), spinValue)
          $(this).val("")
        }
      }).keyup(function(event) {
        if(event.which === 13 && returnDown === true){
          returnDown = false
        }
      })
  }
}

function solve () {
  disableChoices()
  showMessage(sprintf(labels.solveIt, currPlayerName()))
  var returnDown = false
  $guessInput.show().focus().attr('maxlength', 30).keydown(function (event){
    if(event.which === 13 && returnDown === false) {
      returnDown = true
      checkSolve($(this).val())
      $(this).val("").attr('maxlength', 1)
    }
  }).keyup(function(event) {
    if(event.which === 13 && returnDown === true){
      returnDown = false
    }
  })
}

function guess (letter, spinValue) {
  letter = letter.toLowerCase()
  var result = checkGuess(letter)
  if(result === labels.notVowel) {
    showMessage(sprintf(labels.sorryBuyVowel, spinValue), false)
  } if(result === labels.notLetter) {
    showMessage(labels.notLetter, false)
  } else if (result === labels.alreadyGuessed) {
    showMessage(sprintf(labels.alreadyGuessed, letter), true)
    nextPlayer()
    $guessInput.hide().off()
  } else if (result === labels.wrongLetter) {
    guessedLetters += letter
    nextPlayer()
    showMessage(sprintf(labels.wrongLetter, letter, currPlayerName()), true)
    $guessInput.hide().off()
  } else if (result === labels.goodLetter) {
      guessedLetters += letter

      letterCount = updateBoard(letter)

      updateScore(spinValue, letterCount)

      showMessage(labels.goodLetter, true)
      $guessInput.hide().off()
  }
}

function guessVowel (letter, spinValue) {
  letter = letter.toLowerCase()

  //check the letter
  var result = checkGuess(letter)
  var clueNoSpaces = clue.replace(/\s/ig, "")
  if(result !== labels.notVowel) {
    showMessage(labels.notVowel, false)
  } else {
    if (guessedLetters.indexOf(letter) !== -1){
      showMessage(sprintf(labels.alreadyGuessed, letter), true)
      nextPlayer()
      $guessInput.hide().off()
    } else if (clueNoSpaces.indexOf(letter) === -1) {
      guessedLetters += letter
      nextPlayer()
      showMessage(sprintf(labels.wrongLetter, letter, currPlayerName()), true)
      $guessInput.hide().off()
    } else {
        guessedLetters += letter

        letterCount = updateBoard(letter)
        updateScore(spinValue, letterCount)
        showMessage(labels.goodVowel, true)
        $guessInput.hide().off()
    }
  }
}

function updateBoard(letter) {
  //find positions of letter on board
  var clueNoSpaces = clue.replace(/\s/ig, "")
  var pos = clueNoSpaces.indexOf(letter)
  var posArr = []
  var count = 0

  // pos and count of the letters
  while (pos !== -1) {
      posArr.push(pos)
      pos = clueNoSpaces.indexOf(letter, pos+1)
      count++
  }

  //highlight all the tiles with that letter
  for (var i=0;i<posArr.length; i++) {
    tileRow = clueTablePos[posArr[i]][0]
    tileCol = clueTablePos[posArr[i]][1]
    $($tiles[tileRow][tileCol]).addClass("highlight").html(clueNoSpaces[posArr[i]]).click(function(e) { //give tiles ability to flip
        $(e.currentTarget).removeClass('highlight').off()
      })
  }

  return count
}


//note have it return an array of strings
function checkGuess(letter) { //return "vowel", "correct", "already guessed", "wrong", or "not a letter"
  var vowels = ["a", "e", "i", "o", "u"]
  var clueNoSpaces = clue.replace(/\s/ig, "")

  if (letter.length === 0) {
    return "no input";
  } else if (!/[a-zA-Z]/.test(letter)) {
    return labels.notLetter;
  } else if(vowels.indexOf(letter) !== -1) {
    return labels.notVowel;
  } else if(guessedLetters.indexOf(letter) !== -1) {
    return labels.alreadyGuessed;
  } else if(clueNoSpaces.indexOf(letter) === -1) {
    return labels.wrongLetter;
  } else {
    return labels.goodLetter;
  }
}

function checkSolve(guess) {
  guess = guess.toLowerCase()

  var clueNoSpaces = clue.replace(/\s/ig, "")
  var guessNoSpaces = guess.replace(/\s/ig, "").toLowerCase()
  if (clueNoSpaces === guessNoSpaces) {
    //empty the board
    emptyBoard()
    // loop through every letter in the clue and place it on the board
    for (var j=0; j<guessNoSpaces.length; j++) {

      //find the position(s) of that letter
      var letter = guessNoSpaces[j]
      var pos = clueNoSpaces.indexOf(letter)
      var posArr = []
      var count = 0

      while (pos !== -1) {
          posArr.push(pos)
          pos = clueNoSpaces.indexOf(letter, pos+1)
          count++
      }

      window.setTimeout(function () {placeTiles(true)}, 500)
    }

    //go to next round.
    nextRound()


  } else {
    nextPlayer()
    showMessage(sprintf(labels.notQuite, currPlayerName()), true)
  }

  $guessInput.hide().off()
}

function nextPlayer() {
  if(currPlayer === 1) {
    currPlayer = 0
  } else {
    currPlayer++
  }
}

function nextRound() {
  //bank round points of the current player only
  gameScore[currPlayer] += roundScore[currPlayer]
   //display game scores so far
  for (var i=0; i<gameScore.length; i++) {
    pScore.roundEl[i].html(0)
    pScore.gameEl[i].html(gameScore[i])
  }

  if (round > 2) {
    pNames = [$p1Name.val(), $p2Name.val()]
    console.log("finished game", gameScore)
    round = 1
    //check who won.
    if (gameScore[0] == gameScore [1]) {
      showMessage(labels.draw)
    } else if(gameScore[0] > gameScore [1]) {
      showMessage(sprintf(labels.congrats, pNames[0], gameScore[0]))
    } else {
      showMessage(sprintf(labels.congrats, pNames[1], gameScore[1]))
    }
    gameScore = [0,0]
    showStartButton()
  } else {
    round++
    //show message and
    showMessage(sprintf(labels.congratsNext, roundScore[currPlayer]), false, true)
  }

  //reset guessed letters
  guessedLetters = ""
  //reset round score
  roundScore = [0,0]

}

function updateScore (points, numGuessed, bankrupt) {
  if(bankrupt) {
    roundScore[currPlayer] = 0
  } else {
    roundScore[currPlayer] += points*numGuessed
    console.log(roundScore)
  }
  pScore.roundEl[currPlayer].html(roundScore[currPlayer])
}

$( document ).ready(function() {
  wheel.init();
});
