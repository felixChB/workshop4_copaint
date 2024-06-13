import { Canvas } from "./canvas.js";

// websocket parameters
const webSocketPort = 3000;
const webSocketAddr = '10.136.1.73';

// create full screen canvas to draw to
const canvasElem = document.getElementById("canvas");
const canvas = new Canvas(canvasElem);

const countElem = document.getElementById("bombCount");
const highscoreElem = document.getElementById("highscoreCount");
const playerCountElem = document.getElementById("playerCount");
const waitingElem = document.getElementById("waiting-message");

const gameoverElem = document.getElementById("gameover-screen");
const gameoverScoreElem = document.getElementById("gameover-score");
const gameoverReasonElem = document.getElementById("gameover-reason");
const gameRestartElem = document.getElementById("reset-button");

/****************************************************************
 * websocket communication
 */
// const socket = new WebSocket(`wss://${webSocketAddr}:${webSocketPort}`);
const socket = new WebSocket(`ws://${webSocketAddr}:${webSocketPort}`);

// listen to opening websocket connections
socket.addEventListener('open', (event) => {
  // send regular ping messages
  setInterval(() => {
    if (socket.readyState == socket.OPEN) {
      socket.send('');
    }
  }, 20000);
});

// listen to messages from server
socket.addEventListener('message', (event) => {
  const message = event.data;

  if (message.length > 0) {
    const incoming = JSON.parse(message);

    // dispatch incomming messages
    switch (incoming.selector) {
      case 'info':
        countElem.innerHTML = incoming.counter;
        highscoreElem.innerHTML = "Score: " + incoming.highscore;
        playerCountElem.innerHTML = incoming.playerCount;
        gameoverScoreElem.innerHTML = "Your Score: " + incoming.highscore;

        if (incoming.playerCount < 2) {
          waitingElem.classList.add("show-waiting");
        } else {
          waitingElem.classList.remove("show-waiting");
        }

        break;

      case 'gameOver':
        onGameOver(incoming.reason);

        break;

      case 'reset':
        location.reload();

        break;

      default:
        break;
    }
  }
});

/********************************************************************
 *  start screen (overlay)
 */
// start screen HTML elements
const startScreenDiv = document.getElementById("start-screen");
const startScreenTextDiv = startScreenDiv.querySelector("p");

// open start screen
startScreenDiv.style.display = "block";
setOverlayText("touch screen to start");

// start after touch
startScreenDiv.addEventListener("touchend", onStartScreenClick);
startScreenDiv.addEventListener("mouseup", onStartScreenClick);

function onStartScreenClick() {
  startScreenDiv.removeEventListener("touchend", onStartScreenClick);
  startScreenDiv.removeEventListener("mouseup", onStartScreenClick);

  if (matchMedia('(hover:hover)').matches) {
    listenForMousePointer();
  } else {
    listenForTouch();

    // setOverlayText("checking for motion sensors...");
    // requestDeviceOrientation()
    //   .then(() => startScreenDiv.style.display = "none") // close start screen (everything is ok)
    //   .catch((error) => setOverlayError(error)); // display error
  }

  startScreenDiv.style.display = "none";
}

// display text on start screen
function setOverlayText(text) {
  startScreenTextDiv.classList.remove("error");
  startScreenTextDiv.innerHTML = text;
}

/****************************************************************
 * touch listeners
 */
window.addEventListener('touchstart', onTouchStart, false);
window.addEventListener('touchend', onTouchEnd, false);
window.addEventListener('touchmove', (e) => e.preventDefault(), false);

let touchDown = false;
function onTouchStart(e) {
  touchDown = (e.touches.length > 0);
}

function onTouchEnd(e) {
  touchDown = (e.touches.length > 0);
  lastX = lastY = null;
}

/********************************************************************
 * overlay
 */
// display error message on start screen
function setOverlayError(text) {
  startScreenTextDiv.classList.add("error");
  startScreenTextDiv.innerHTML = text;
}

/****************************************************************
 * touch and mouse pointer event listeners
 */
// touch listener
function listenForTouch() {
  // window.addEventListener('touchstart', onPointerStart, false);
  // window.addEventListener('touchmove', onPointerMove, false);
  // window.addEventListener('touchend', onPointerEnd, false);
  // window.addEventListener('touchcancel', onPointerEnd, false);

  window.addEventListener('touch', clientClick);
}

// mouse pointer listener
function listenForMousePointer() {
  window.addEventListener('click', clientClick);
}

function clientClick(e) {
  // create click message
  const countOut = {
    selector: 'clientClick'
  };
  // click message to server
  const str = JSON.stringify(countOut);
  socket.send(str);
}

function onGameOver(reason) {
  console.log("recieve game over message");

  // show gameOver screen
  gameoverElem.classList.add("showOver");
  gameoverReasonElem.innerHTML = reason;

  // remove the click eventlisteners for the screen
  window.removeEventListener('touch', clientClick);
  window.removeEventListener('click', clientClick);

  // create eventlisteners for the restart button
  gameRestartElem.addEventListener('touch', requestReset);
  gameRestartElem.addEventListener('click', requestReset);
}

function requestReset() {
  console.log("request restart");
  // send reset befehl to server if one player clicks the restart button
  const countOut = {
    selector: 'resetRequest'
  };
  // send paint stroke to server
  const str = JSON.stringify(countOut);
  socket.send(str);
}