/**********************************************************
* railcarSorter.js
* Kriti Kafle & John Dean
* 
* This program sorts a train's railcars using canvas and
* the Towers of Hanoi algorithm.
*************************************************************/

"use strict";
var canvasID = "canvas1";
var headingColor = "black";
var railcarColor = "yellow";
var railcarTextColor = "black";
var trainTrackColor = "rgba(0, 0, 0, 0.68)";
var trainTrackSegmentColor = "brown";
var trainSetup = false;
var trackWidth = 20;
var trackLength = 0;
var segmentWidth = 5;
var segmentHeight = trackWidth + 4;
var mainTrackX = 0;
var mainTrackY = 150;
var subTrackPosX = 200;
var subTrackLength = 200;
var subTrackGap = 70;
var segmentGap = 8;
var railcarWidth = 20;
var railcarHeight = 20;
var numOfRailcars = 7;
var railcarGap = 5;
var railcarXs = [0, 0, 0, 0, 0, 0, 0];
var railcarYs = [0, 0, 0, 0, 0, 0, 0];
var railcarPlacement = [1, 2, 3, 4, 5, 6, 7];
var railcarPlacementSorted = [1, 2, 3, 4, 5, 6, 7];
var stackPosY = mainTrackY + segmentHeight + subTrackLength;
var stackPositions = [
    [200, 270, 340], 
    [stackPosY, stackPosY, stackPosY]
];
var stacks = [
    [],
    [],
    []
];
var sortedStack = [];
var sortedStackPos = [700, 150];
var minValue = 1;
var buttonRandom;
var buttonNextMove;
var buttonAutoPlay;
var buttonPause;
var groupInitialPlacement;
var labelMsg;
var movingTimer;
var fps = 0;
var autoPlay = false;
var animationMoves = [];
var secondaryMove = false;

var timer;

var DIRECTIONS = {
    HORIZONTAL: 0,
    VERTICAL: 1,
    VER_HOR_VER: 2
};

// set the animation frame rate for canvas
window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

// Create a dummy timer that will have real values assigned to it
// when animation occurs.
timer = new InvervalTimer();

//*********************

// The following class implements a timer with pause and resume functionality.

function InvervalTimer() {
  // the different timer states:
  const IDLE = 0;
  const RUNNING = 1;
  const PAUSED = 2;
  
  this.state = IDLE;    // Initially, the timer is idle
  this.interval = null; // number of seconds between timer ticks

  // After starting the timer, need to save its id, so it can be
  // used later to stop the timer
  this.timerId = null;

  InvervalTimer.prototype.setInterval =
    function (interval) {
      this.interval = interval;
    };

  InvervalTimer.prototype.setCallback =
    function(callback) {
      this.callback = callback;
    };

  InvervalTimer.prototype.start =
    function () {
      if (this.state == IDLE) {
        this.timerId =
          window.setInterval(this.callback, this.interval);
        this.state = RUNNING;
      }
    };

  InvervalTimer.prototype.stop =
    function () {
      if (this.state == RUNNING || this.state == PAUSED) {
        window.clearInterval(this.timerId);
        this.state = IDLE;
      }
    };

  InvervalTimer.prototype.pause =
    function () {
      if (this.state == RUNNING) {
        window.clearInterval(this.timerId);
        this.state = PAUSED;
      }
    };

  InvervalTimer.prototype.resume =
    function () {
      if (this.state == PAUSED) {
        this.state = RUNNING;
        this.timerId =
          window.setInterval(this.callback, this.interval);
      }
    };
} // end constructor InvervalTimer

//*********************

// This function initializes the canvas and draws railcars and rails

function initCanvas() {
    var c = document.getElementById(canvasID);
    var width, height;
    width = c.clientWidth;
    height = c.clientHeight;
    var ctx = c.getContext("2d");
    var img = document.getElementById("railYard");
    ctx.clearRect(0, 0, width, height);

    // draw background image
    ctx.drawImage(img, 0, 0, width, height);
    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, width, 100);

    // canvas heading
    ctx.font = "bold 40px Cooper Black, Arial";
    ctx.fillStyle = headingColor;
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.fillText("Railroad Car Sorter", width / 2, 10);
    ctx.font = "bold 20px Arial";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.fillText(
      "Using the Towers of Hanoi Algorithm and Canvas",
      width / 2, 50);

    // draw railroad tracks
    var x;
    var y, length, subX, subY, subLength, subGap, trainNum;
    //x++;
    x = mainTrackX;
    y = mainTrackY;
    trackLength = length = width;
    subX = subTrackPosX;
    subY = y + 22;
    subLength = subTrackLength;
    subGap = subTrackGap;
    drawTrack(ctx, x, y, length, DIRECTIONS.HORIZONTAL);
    drawTrack(ctx, subX, subY, subLength, DIRECTIONS.VERTICAL);
    subX += subGap;
    drawTrack(ctx, subX, subY, subLength, DIRECTIONS.VERTICAL);
    subX += subGap;
    drawTrack(ctx, subX, subY, subLength, DIRECTIONS.VERTICAL);
    subX += subGap;

    // draw railcars
    trainNum = 0;

    for (var i = 0; i < numOfRailcars; i++) {
        trainNum = railcarPlacement[i];
        drawRailcar(ctx, railcarXs[i], railcarYs[i], trainNum);
    }

    // draw stacks positions
    for (var i = 0; i < stackPositions[0].length; i++) {
        drawStack(ctx, stackPositions[0][i], stackPositions[1][i]);
    }

    // update canvas with animation frame rate
    requestAnimFrame(function () {
        initCanvas();
    });
}

// This function sets the initial railcar position

function setupRailcarPositions() {
    railcarXs[0] = 0;
    for (var i = 0; i < numOfRailcars; i++) {
        railcarYs[i] = mainTrackY;
        if (i + 1 < numOfRailcars)
            railcarXs[i + 1] = railcarXs[i] + railcarWidth + railcarGap;
    }
}

// This function draws railroad tracks

function drawTrack(ctx, x, y, length, direction) {
    var endX, endY;
    
    // draw track segments
    ctx.lineWidth = "4";
    ctx.strokeStyle = trainTrackSegmentColor;

    var numOfSegments = Math.round(length / (segmentWidth + segmentGap));
    var segmentStartX, segmentStartY;
    var segmentOffset;

    segmentStartX = x;
    segmentStartY = y;
    segmentOffset = (segmentHeight - trackWidth);

    for (var i = 0; i < numOfSegments; i++) {
        var segmentEndX, segmentEndY;
        if (direction === DIRECTIONS.HORIZONTAL) {
            segmentStartX += segmentWidth + segmentGap;
            segmentEndX = segmentStartX;
            segmentEndY = segmentStartY + segmentHeight;
            drawLine(ctx, segmentStartX, segmentStartY - segmentOffset, segmentEndX, segmentEndY);
        } else {
            segmentEndX = segmentStartX + segmentHeight;
            segmentStartY += segmentWidth + segmentGap;
            segmentEndY = segmentStartY;
            drawLine(ctx, segmentStartX - segmentOffset, segmentStartY, segmentEndX, segmentEndY);
        }
    }

    // draw two parallel lines
    ctx.lineWidth = "3";
    ctx.strokeStyle = trainTrackColor;
    if (direction === DIRECTIONS.HORIZONTAL) {
        endX = x + length;
        endY = y;
        drawLine(ctx, x, y, endX, endY);
        drawLine(ctx, x, y + trackWidth, endX, endY + trackWidth);
    } else {
        endX = x;
        endY = y + length;
        drawLine(ctx, x, y, endX, endY);
        drawLine(ctx, x + trackWidth, y, endX + trackWidth, endY);
    }

}

// This function draws railcars

function drawRailcar(ctx, x, y, num) {
    var rectWidth, rectHeight;
    rectWidth = railcarWidth;
    rectHeight = railcarHeight;
    ctx.fillStyle = railcarColor;
    ctx.fillRect(x, y, rectWidth, rectHeight);
    ctx.fillStyle = railcarTextColor;
    ctx.font = "bold 20px Arial";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.fillText(num, x + rectWidth / 2, y);
}

// This function draws stacks

function drawStack(ctx, x, y) {
    ctx.lineWidth = "5";
    ctx.strokeStyle = "black";
    var segmentOffset = (segmentHeight - trackWidth);
    drawLine(ctx, x - segmentOffset, y, x + segmentHeight, y);
}

// This function draws line on canvas

function drawLine(ctx, startX, startY, endX, endY) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

// This function randomizes railcar placement

function randomizeRailcars() {
    for (var i = 0; i < railcarPlacement.length; i++) {
        var randomIndex = Math.floor(Math.random() * railcarPlacement.length);
        swapTrains(randomIndex, i);
    }
}randomizeRailcars

// This function swaps railcars

function swapTrains(a, b) {
    var temp = railcarPlacement[a];
    railcarPlacement[a] = railcarPlacement[b];
    railcarPlacement[b] = temp;
}

// This function resets railcars and intial placement value

function resetRailcars() {
    sortedStack = [];
    for (var i = 0; i < stacks.length; i++) stacks[i] = [];
  //    clearInterval(movingTimer);
    timer.stop();

    railcarPlacement.sort();
    setupRailcarPositions();
    autoPlay = false;
    enableInitPlacement();
    document.getElementById('rdoIP1').checked=true;
    enableButtons();
    labelMsg.textContent = "";
}

// This function enables intial placement radio buttons

function enableInitPlacement() {
    groupInitialPlacement.removeAttribute('disabled');
}

// This function disables inital placememnt radio buttons

function disableInitPlacement() {
    groupInitialPlacement.setAttribute('disabled', true);
}

// This function moves the railcar

function moveCar(railcarIndex, finalPosX, finalPosY, direction, secondPosX, secondPosY) {
    var startX, startY;
    startX = railcarXs[railcarIndex];
    startY = railcarYs[railcarIndex];
    switch (direction) {
        case DIRECTIONS.HORIZONTAL:
            if (startX != finalPosX) {
                var move = (startX > finalPosX ? -1 : 1);
                railcarXs[railcarIndex] += move;
            }
            else if (startY != finalPosY) {
                var move = (startY > finalPosY ? -1 : 1);
                railcarYs[railcarIndex] += move;
            }
            else {
                timer.stop();
                enableButtons();
                if (!checkForEnd() && autoPlay) {
                    moveNextCar(autoPlay);
                }
            }
            break;
        case DIRECTIONS.VERTICAL:
            if (startY != finalPosY) {
                var move = (startY > finalPosY ? -1 : 1);
                railcarYs[railcarIndex] += move;
            }
            else if (startX != finalPosX) {
                var move = (startX > finalPosX ? -1 : 1);
                railcarXs[railcarIndex] += move;
            }
            else {
                timer.stop();
                enableButtons();

                if (!checkForEnd() && autoPlay) {
                    moveNextCar(autoPlay);
                }
            }
            break;
        case DIRECTIONS.VER_HOR_VER:
            if (!secondaryMove && startY != secondPosY) {
                var move = (startY > secondPosY ? -1 : 1);
                railcarYs[railcarIndex] += move;
            }
            else if (startX != finalPosX) {
                secondaryMove = true;
                var move = (startX > finalPosX ? -1 : 1);
                railcarXs[railcarIndex] += move;
            }
            else if (startY != finalPosY) {
                var move = (startY > finalPosY ? -1 : 1);
                railcarYs[railcarIndex] += move;
            }
            else {
                timer.stop();
                enableButtons();
                playAnimationMoves();
            }
            break;
    }
} // end moveCar

//***********************

// This function replaces the Next Move and Auto Play buttons
// with a Pause button.

function replaceButtonsWithPause() {
  buttonNextMove.hidden = true;
  buttonAutoPlay.hidden = true; 
  buttonPause.hidden = false;
} // end replaceButtonsWithPause

//***********************

// This function enables autoplay and next move buttons

function enableButtons() {
  buttonNextMove.hidden = false;
  buttonAutoPlay.hidden = false;
  buttonPause.hidden = true;
  buttonAutoPlay.removeAttribute("disabled");
    buttonNextMove.removeAttribute("disabled");
}

// This function disables next move and auto play buttons

function disableButtons() {
    buttonNextMove.setAttribute('disabled', true);
    buttonAutoPlay.setAttribute('disabled', true);
}

// This function checks for end of the track sorting

function checkForEnd() {
    if (sortedStack.length == railcarPlacement.length) {
        disableButtons();
        lblMsg.textContent = "Sort Complete!";
        return true;
    }
    return false;
}

// Event handler for Next Move button

function moveNextCar(auto) {
    autoPlay = auto;
    disableInitPlacement()
    replaceButtonsWithPause();

    if (moveFromStacks()) {
      // lblMsg.textContent = "Moving from stacks to final destination...";
    } else if (moveToStacks()) {
        //lblMsg.textContent = "Moving to stacks...";
    } else if (moveToSortedStack()) {
        lblMsg.textContent = "Moving to final destination...";
    } else {
        moveWithinStacks();
    }
}

// This function initiates the railcar move

function animateRailcarMove(railcarIndex, x, y, direction, secX, secY) {
    secondaryMove = false;

    timer.setCallback(
      function () {
        moveCar(railcarIndex, x, y, direction, secX, secY);
      });
    timer.setInterval(1000 / fps);
    timer.start();
}

// This function moves from stack to the sorted stack

function moveFromStacks() {
    var nextTrainNum = railcarPlacementSorted[sortedStack.length];
    var stackIndex = -1;

    for (var i=0; i<stacks.length; i++) {
        if (stacks[i].length > 0 && stacks[i][stacks[i].length - 1] == nextTrainNum) {
            stackIndex = i;
            break;
        }
    }

    if (stackIndex > -1) {
      lblMsg.textContent =
        "Moving from Stack " + (stackIndex + 1) + " to final destination...";
        var railcarIndex = railcarPlacement.indexOf(nextTrainNum);
        stacks[stackIndex].pop();
        sortedStack.push(railcarPlacement[railcarIndex]);
        var count = sortedStack.length;
        var x, y;
        x = trackLength - (count * (railcarWidth + railcarGap));
        y = mainTrackY;
        animateRailcarMove(railcarIndex, x, y, DIRECTIONS.VERTICAL);
        return true;
    } else
        return false;
}

// This function moves the railcar from initial position to stacks

function moveToStacks() {
    var nextTrainNum = railcarPlacementSorted[sortedStack.length];
    var stackIndex = -1;
    var railcarIndex = railcarPlacement.length - (stacks[0].length + stacks[1].length + stacks[2].length /*+ stacks[3].length*/ + sortedStack.length) - 1;

    if (railcarIndex == -1 || railcarPlacement[railcarIndex] == nextTrainNum) {
        return false;
    } else {
        var stackIndex = getStackIndex(railcarIndex);

        // no stack left
        if (stackIndex === undefined) return false;
        lblMsg.textContent = "Moving to Stack " + (stackIndex + 1) + "...";
        stacks[stackIndex].push(railcarPlacement[railcarIndex]);
        var x, y;
        x = subTrackPosX + (stackIndex * (subTrackGap));
        y = (mainTrackY + trackWidth + subTrackLength) - (stacks[stackIndex].length * (railcarHeight + railcarGap));
        animateRailcarMove(railcarIndex, x, y, DIRECTIONS.HORIZONTAL);
        return true;
    }
}

// This function moves the railcar from initial position to sorted stacks directly

function moveToSortedStack() {
    var railcarIndex = railcarPlacement.length - (stacks[0].length + stacks[1].length + stacks[2].length /*+ stacks[3].length*/ + sortedStack.length) - 1;

    if (railcarIndex == -1 || railcarPlacementSorted[sortedStack.length] != railcarPlacement[railcarIndex]) {
        return false;
    } else {
        sortedStack.push(railcarPlacement[railcarIndex]);
        var count = sortedStack.length;
        var x, y;
        x = trackLength - (count * (railcarWidth + railcarGap));
        y = mainTrackY;
        animateRailcarMove(railcarIndex, x, y, DIRECTIONS.HORIZONTAL);
        return true;
    }
}


// This function returns the index of stack where the railcar is located

function getStackIndex(railcarIndex) {
    for (var i = 0; i < stacks.length; i++) {
        if (stacks[i].length == 0)
            return i;
        else if (stacks[i][stacks[i].length - 1] > railcarPlacement[railcarIndex]) {
            return i;
        }
    }
}

// This function is called when the page is first loaded

window.onload = function () {
    setupRailcarPositions();
    initCanvas();
    buttonRandom = document.getElementById('btnRandomPlacement');
    buttonNextMove = document.getElementById('btnNextMove');
    buttonAutoPlay = document.getElementById('btnAutoPlay');
    buttonPause = document.getElementById('btnPause');
    groupInitialPlacement = document.getElementById('grpInitialPlacement');
    labelMsg = document.getElementById('lblMsg');
    fps = document.getElementById('speed').value;
    changeSpeed(fps);    
};

// This function gets the initial placements of railcars

function initialPlacement(v) {
    var placements = [
        [1, 2, 3, 4, 5, 6, 7],
        [1, 7, 6, 5, 4, 3, 2]
    ];
    railcarPlacement = placements[v];
}

// This function uses tower of hanoi algorith to move the railcars
// within the stacks until one stack if open

function moveWithinStacks() {
    animationMoves = [];
    var source, dest, temp, n;
    temp = getLargestStack();
    source = getSmallestStack();
    dest = getNextSmallestStack(source);
    n = getN(source, dest);
    move(n, source, dest, temp);
    playAnimationMoves();
}

// This function returns the number of railcars that can be moved from
// source to destination stack

function getN(source, dest) {
    var n = stacks[source].length - 1;
    var max = stacks[dest][stacks[dest].length - 1];
    var i;
    for (i = n; i >= 0; i--) {
        if (stacks[source][i] > max)
            break;
    }

    return (n - i);
}

// This function returns the stack index with largest number on top

function getLargestStack() {
    var large = stacks[0][stacks[0].length - 1];
    var index = 0;
    for (var i = 0; i < stacks.length; i++) {
        var l = stacks[i][stacks[i].length - 1]
        if (l > large) {
            large = l;
            index = i;
        }
    }
    return index;
}

// This function returns the stack index with smallest number on top

function getSmallestStack() {
    var small = stacks[0][stacks[0].length - 1];
    var index = 0;
    for (var i = 0; i < stacks.length; i++) {
        var s = stacks[i][stacks[i].length - 1]
        if (s < small) {
            small = s;
            index = i;
        }
    }
    return index;
}

// This function returns the stack index of next smallest number of top

function getNextSmallestStack(excludeIndex) {
    var init = (excludeIndex == 0 ? 1 : 0);
    var small = stacks[init][stacks[init].length - 1];
    var index = init;
    for (var i = init; i < stacks.length; i++) {
        if (i != excludeIndex) {
            var s = stacks[i][stacks[i].length - 1]
            if (s < small) {
                small = s;
                index = i;
            }
        }
    }
    return index;
}

// This function moves the railcar using recursion

function move(n, source, dest, temp) {
    if (n === 1) {
        captureMoves(source, dest);
    } else {
        move(n - 1, source, temp, dest);
        captureMoves(source, dest);
        move(n - 1, temp, dest, source);
    }
}

// This function captures the animation moves and stores in animation queue

function captureMoves(source, dest) {
    if (source !== undefined)
        animationMoves.push({
            source: source,
            dest: dest
        });
}

// This function plays the animation moves

function playAnimationMoves() {
    var animationMove = dequeueAnimation();
    if (animationMove !== null) {
        replaceButtonsWithPause();
        moveStack(animationMove.source, animationMove.dest);
    }
    else if (!checkForEnd() && autoPlay) {
        moveNextCar(autoPlay);
        buttonAutoPlay.removeAttribute("disabled");
        buttonNextMove.removeAttribute("disabled");
    }
}

// This function gets the first animation move from the animation queue

function dequeueAnimation() {
    if (animationMoves && animationMoves.length > 0) {
        var moveItem = animationMoves.splice(0, 1)[0];
        return moveItem;
    }
    else {
        return null;
    }
}

// This function moves tag from source stack to destination stack

function moveStack(source, dest) {
  labelMsg.textContent =
    "Moving from Stack " + (source + 1) + " to Stack " + (dest + 1) + "...";
    var railcarIndex;
    var val = stacks[source].pop();
    railcarIndex = railcarPlacement.indexOf(val);
    stacks[dest].push(val);
    var stackIndex = dest;
    var x, y, secY;
    x = subTrackPosX + (stackIndex * (subTrackGap));
    y = (mainTrackY + trackWidth + subTrackLength) - (stacks[stackIndex].length * (railcarHeight + railcarGap));
    secY = mainTrackY;
    animateRailcarMove(railcarIndex, x, y, DIRECTIONS.VER_HOR_VER, null, secY);
}

// This function starts auto play

function startAutoPlay() {
    autoPlay = true;
    moveNextCar(autoPlay);
}

//***************************

// This function pauses the animation.

function pauseAnimation() {
  if (buttonPause.value == "Pause") {
    if (autoPlay) {
      buttonPause.value = "Resume Auto Play";
    }
    else {
      buttonPause.value = "Resume Next Move";
    }

    timer.pause();
  }
  else {                          // Resume was clicked
    buttonPause.value = "Pause";
    timer.resume();
  }
} // end pauseAnimation

//***************************

// This function changes the speed of the train

function changeSpeed(speed) {
    fps = speed;
    var txtFPS = document.getElementById('txtFPS');
    txtFPS.textContent = fps + ' frames per second';
}