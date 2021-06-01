/*******************************************************
* captionAdder.js
* John Dean
*
* This file contains functions that support the
* caption adder web page.
*******************************************************/

// Disable or enable the text box.

function handleTextbox(radioBtn) {
  if (radioBtn.value == "other") {
    radioBtn.form.elements["entry"].disabled = false;
  }
  else {
    radioBtn.form.elements["entry"].disabled = true;
  }
} // end function handleTextbox

//*********************************************

// Copy selected caption on top of the image.

function addCaption(form) {
  var captionRBs;  // collection of radio buttons
  var captionStr;  // selected caption string
  var entry;       // user-entered caption text box
  var result;      // caption object that goes on image
  var image;       // object for image

  captionStr = "";
  captionRBs = form.elements["caption"];
  entry = form.elements["entry"];

  for (var i=0; i<captionRBs.length; i++) {
    if (captionRBs[i].checked) {
      captionStr = captionRBs[i].value;
      if (captionStr == "other") {
        captionStr = entry.value;
      }
    } // end if
  } // end for

  // The following works for Chrome & FireFox, but not IE.
  /*
  captionStr = captionRBs.value;
  if (captionStr == "other") {
    captionStr = entry.value;
  }
  */

  if (captionStr == "") {
    alert(
      "You must select one of the existing captions" +
      " or enter your own caption.");
  } // end if
  else {
    // The following loop takes care of the DOM bug I found
    // in 2015 of needing multiple clicks to calculate the
    // message's width correctly.
//    for (var i = 0; i < 3; i++) {  // work around 
    result = document.getElementById("result");
    image = document.getElementById("image");
    result.innerHTML = captionStr;

    result.style.top =
      (image.height * .8) + "px";
    result.style.left =
      ((image.width / 2) -
      (result.clientWidth) / 2) + "px";
//    } // end for (workaround)
  } // end else
} // end function addCaption