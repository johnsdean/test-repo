/**********************************************************
* trainSorter.js
* Kriti Kafle & John Dean
* 
* This program simulates the train sorter using canvas and
* tower of hanoi algorithm.
*************************************************************/

"use strict";
var canvasID = "canvas1";
var headingColor = "black";
var trainColor = "yellow";
var trainTextColor = "black";
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
var trainWidth = 20;
var trainHeight = 20;
var numOfTrainSlots = 7;
var trainGap = 5;
var trainXs = [0, 0, 0, 0, 0, 0, 0];
var trainYs = [0, 0, 0, 0, 0, 0, 0];
var trainPlacement = [1, 2, 3, 4, 5, 6, 7];
var trainPlacementSorted = [1, 2, 3, 4, 5, 6, 7];
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
var movingSlot = -1;                // index of moving train slot
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

  this.timerId = 0;   // save the timer id to access it after its instantiated
  this.startTime = 0; // helps with pausing functionality
  this.remaining = 0; // helps with pausing functionality
  this.state = 0;     //  0 = idle, 1 = running, 2 = paused, 3 = resumed

  this.setCallback =
    function(callback) {
      this.callback = callback;
    };

  this.setInterval =
    function(interval) {
      this.interval = interval;
    };

  this.pause = function () {
    if (this.state != 1) return;

    this.remaining = this.interval - (new Date() - this.startTime);
    window.clearInterval(this.timerId);
    this.state = 2;
  };

  this.resume = function () {
    if (this.state != 2) return;

    this.state = 3;
    window.setTimeout(this.timeoutCallback, this.remaining);
  };

  this.timeoutCallback = function() {
    if (this.state != 3) return;

    callback();

    this.startTime = new Date();
    this.timerId =
      window.setInterval(this.callback, this.interval);
    this.state = 1;
  };

  this.start = function() {
    if (this.state != 0) return;

    this.startTime = new Date();
    this.timerId =
      window.setInterval(this.callback, this.interval);
    this.state = 1;
  };

  this.stop = function() {
    if (this.state != 1) return;

    window.clearInterval(this.timerId);
    this.state = 0;
  };
} // end constructor InvervalTimer

//*********************

// This function initializes the canvas and draws trains and rails
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
    ctx.fillText("Train Car Sorter", width / 2, 10);
    ctx.font = "bold 20px Arial";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.fillText(
      "Using the Towers of Hanoi Algorithm and Canvas",
      width / 2, 50);

    // draw railroad tracks
    var x;
    var y, length, subX, subY, subLength, subGap, trainX, trainY, trainNum;
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

    // draw train slots
    trainNum = 0;

    for (var i = 0; i < numOfTrainSlots; i++) {
        trainNum = trainPlacement[i];
        drawTrainSlot(ctx, trainXs[i], trainYs[i], trainNum);
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

// This function sets the initial train slot position
function setupTrainPositions() {
    trainXs[0] = 0;
    for (var i = 0; i < numOfTrainSlots; i++) {
        trainYs[i] = mainTrackY;
        if (i + 1 < numOfTrainSlots)
            trainXs[i + 1] = trainXs[i] + trainWidth + trainGap;
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

// This function draws train slots
function drawTrainSlot(ctx, x, y, num) {
    var rectWidth, rectHeight;
    rectWidth = trainWidth;
    rectHeight = trainHeight;
    ctx.fillStyle = trainColor;
    ctx.fillRect(x, y, rectWidth, rectHeight);
    ctx.fillStyle = trainTextColor;
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

// This function randomizes train slot placement
function randomizeTrains() {
    for (var i = 0; i < trainPlacement.length; i++) {
        var randomIndex = Math.floor(Math.random() * trainPlacement.length);
        swapTrains(randomIndex, i);
    }
}

// This function swaps train slots
function swapTrains(a, b) {
    var temp = trainPlacement[a];
    trainPlacement[a] = trainPlacement[b];
    trainPlacement[b] = temp;
}

// This function resets train slots and intial placement value
function resetTrains() {
    sortedStack = [];
    for (var i = 0; i < stacks.length; i++) stacks[i] = [];
  //    clearInterval(movingTimer);
    timer.stop();

    trainPlacement.sort();
    setupTrainPositions();
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


// This function moves the slot 
function moveSlot(slotIndex, finalPosX, finalPosY, direction, secondPosX, secondPosY) {
    var startX, startY;
    startX = trainXs[slotIndex];
    startY = trainYs[slotIndex];
    switch (direction) {
        case DIRECTIONS.HORIZONTAL:
            if (startX != finalPosX) {
                var move = (startX > finalPosX ? -1 : 1);
                trainXs[slotIndex] += move;
            } else if (startY != finalPosY) {
                var move = (startY > finalPosY ? -1 : 1);
                trainYs[slotIndex] += move;
            } else {
//                clearInterval(movingTimer);
                timer.stop();

                enableButtons();
                if (!checkForEnd() && autoPlay) {
                    moveNextSlot(autoPlay);
                }
            }
            break;
        case DIRECTIONS.VERTICAL:
            if (startY != finalPosY) {
                var move = (startY > finalPosY ? -1 : 1);
                trainYs[slotIndex] += move;
            } else if (startX != finalPosX) {
                var move = (startX > finalPosX ? -1 : 1);
                trainXs[slotIndex] += move;
            } else {
//              clearInterval(movingTimer);
                timer.stop();

                //buttonRandom.Attribute("disabled");
                enableButtons();

                if (!checkForEnd() && autoPlay) {
                    moveNextSlot(autoPlay);
                }
            }
            break;
        case DIRECTIONS.VER_HOR_VER:
            if (!secondaryMove && startY != secondPosY) {
                var move = (startY > secondPosY ? -1 : 1);
                trainYs[slotIndex] += move;
            } else if (startX != finalPosX) {
                secondaryMove = true;
                var move = (startX > finalPosX ? -1 : 1);
                trainXs[slotIndex] += move;
            } else if (startY != finalPosY) {
                var move = (startY > finalPosY ? -1 : 1);
                trainYs[slotIndex] += move;
            } else {
//              clearInterval(movingTimer);
                timer.stop();

                enableButtons();
                playAnimationMoves();
            }
            break;
    }
} // end moveSlot

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
    if (sortedStack.length == trainPlacement.length) {
        disableButtons();
        lblMsg.textContent = "Sort Complete!";
        return true;
    }
    return false;
}

// Event handler for Next Move button
function moveNextSlot(auto) {
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

// This function animates the slot move
function animateSlotMove(slotIndex, x, y, direction, secX, secY) {
    secondaryMove = false;

    timer.setCallback(
      function () {
        moveSlot(slotIndex, x, y, direction, secX, secY);
      });
    timer.setInterval(1000 / fps);
    timer.start();
}

// This function moves from stack to the sorted stack
function moveFromStacks() {
    var nextTrainNum = trainPlacementSorted[sortedStack.length];
    var stackIndex = -1;

    for (var i = 0; i < stacks.length; i++) {
        if (stacks[i].length > 0 && stacks[i][stacks[i].length - 1] == nextTrainNum) {
            stackIndex = i;
            break;
        }
    }

    if (stackIndex > -1) {
      lblMsg.textContent =
        "Moving from Stack " + (stackIndex + 1) + " to final destination...";
        var slotIndex = trainPlacement.indexOf(nextTrainNum);
        stacks[stackIndex].pop();
        sortedStack.push(trainPlacement[slotIndex]);
        var count = sortedStack.length;
        var x, y;
        x = trackLength - (count * (trainWidth + trainGap));
        y = mainTrackY;
        animateSlotMove(slotIndex, x, y, DIRECTIONS.VERTICAL);
        return true;
    } else
        return false;
}

// This function moves the slot from initial position to stacks
function moveToStacks() {
    var nextTrainNum = trainPlacementSorted[sortedStack.length];
    var stackIndex = -1;
    var slotIndex = trainPlacement.length - (stacks[0].length + stacks[1].length + stacks[2].length /*+ stacks[3].length*/ + sortedStack.length) - 1;

    if (slotIndex == -1 || trainPlacement[slotIndex] == nextTrainNum) {
        return false;
    } else {
        var stackIndex = getStackIndex(slotIndex);

        // no stack left
        if (stackIndex === undefined) return false;
        lblMsg.textContent = "Moving to Stack " + (stackIndex + 1) + "...";
        stacks[stackIndex].push(trainPlacement[slotIndex]);
        var x, y;
        x = subTrackPosX + (stackIndex * (subTrackGap));
        y = (mainTrackY + trackWidth + subTrackLength) - (stacks[stackIndex].length * (trainHeight + trainGap));
        animateSlotMove(slotIndex, x, y, DIRECTIONS.HORIZONTAL);
        return true;
    }
}

// This function moves the slot from initial position to sorted stacks directly
function moveToSortedStack() {
    var slotIndex = trainPlacement.length - (stacks[0].length + stacks[1].length + stacks[2].length /*+ stacks[3].length*/ + sortedStack.length) - 1;

    if (slotIndex == -1 || trainPlacementSorted[sortedStack.length] != trainPlacement[slotIndex]) {
        return false;
    } else {
        sortedStack.push(trainPlacement[slotIndex]);
        var count = sortedStack.length;
        var x, y;
        x = trackLength - (count * (trainWidth + trainGap));
        y = mainTrackY;
        animateSlotMove(slotIndex, x, y, DIRECTIONS.HORIZONTAL);
        return true;
    }
}


// This function returns the index of stack where the slot is located at
function getStackIndex(slotIndex) {
    for (var i = 0; i < stacks.length; i++) {
        if (stacks[i].length == 0)
            return i;
        else if (stacks[i][stacks[i].length - 1] > trainPlacement[slotIndex]) {
            return i;
        }
    }
}

// This function is called when the page is first loaded
window.onload = function () {
    setupTrainPositions();
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


// This function gets the initial placements of train slots
function initialPlacement(v) {
    var placements = [
        [1, 2, 3, 4, 5, 6, 7],
        [1, 7, 6, 5, 4, 3, 2]
    ];
    trainPlacement = placements[v];
}

// This function uses tower of hanoi algorith to move the train slots
// within the stacks until one stack if open
function moveWithinStacks() {
    animationMoves = [];
    var source, dest, temp, n;
    temp = getLargestStack();
    source = getSmallestStack();
    dest = getNextSmallestStack(source);
    n = getN(source, dest);
    move(n - 1, source, dest, temp);
    playAnimationMoves();
}

// This function returns the number of slots that can be moved from
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


// This funciton returns the stack index of next smallest number of top
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

// This function moves the slot using recursion
function move(n, source, dest, temp) {
    if (n === 0) {
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
        buttonNextMove.setAttribute("disabled", true);
        buttonAutoPlay.setAttribute('disabled', true);
        moveStack(animationMove.source, animationMove.dest);
    } else if (!checkForEnd() && autoPlay) {
        moveNextSlot(autoPlay);
        buttonAutoPlay.removeAttribute("disabled");
        buttonNextMove.removeAttribute("disabled");
    }
}

// This function gets the first animation move from the animation queue
function dequeueAnimation() {
    if (animationMoves && animationMoves.length > 0) {
        var moveItem = animationMoves.splice(0, 1)[0];
        return moveItem;
    } else {
        return null;
    }
}

// This function moves tag from source stack to destination stack
function moveStack(source, dest) {
  labelMsg.textContent =
    "Moving from Stack " + (source + 1) + " to Stack " + (dest + 1) + "...";
    var slotIndex;
    var val = stacks[source].pop();
    slotIndex = trainPlacement.indexOf(val);
    stacks[dest].push(val);
    var stackIndex = dest;
    var x, y, secY;
    x = subTrackPosX + (stackIndex * (subTrackGap));
    y = (mainTrackY + trackWidth + subTrackLength) - (stacks[stackIndex].length * (trainHeight + trainGap));
    secY = mainTrackY;
    animateSlotMove(slotIndex, x, y, DIRECTIONS.VER_HOR_VER, null, secY);
}

// This function starts auto play
function startAutoPlay() {
    autoPlay = true;
    moveNextSlot(autoPlay);
}

//***************************

// This function pauses the animation.

function pauseAnimation() {
  if (buttonPause.value == "Pause") {
    buttonPause.value = "Resume";
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
    txtFPS.textContent = fps + ' FPS';
}