import { Canvas } from "./canvas.js";

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// websocket parameters
const webSocketPort = 3001; 
const webSocketAddr = '192.168.178.23';

// create full screen canvas to draw to
const canvasElem = document.getElementById("canvas");
const canvas = new Canvas(canvasElem);
let color = '#000';

/********************************************************************
 * 
 *  start screen (overlay)
 * 
 */
// start screen HTML elements
const startScreenDiv = document.getElementById("start-screen");
const startScreenTextDiv = startScreenDiv.querySelector("p");

// open start screen
startScreenDiv.style.display = "block";
setOverlayText("touch screen to start");

// start after touch
startScreenDiv.addEventListener("click", () => {
  setOverlayText("checking for motion sensors...");

  const audioPromise = requestWebAudio();
  const deviceOrientationPromise = requestDeviceOrientation();

  Promise.all([audioPromise, deviceOrientationPromise])
    .then(() => startScreenDiv.style.display = "none") // close start screen (everything is ok)
    .catch((error) => setOverlayError(error)); // display error
});

// display text on start screen
function setOverlayText(text) {
  startScreenTextDiv.classList.remove("error");
  startScreenTextDiv.innerHTML = text;
}

// display error message on start screen
function setOverlayError(text) {
  startScreenTextDiv.classList.add("error");
  startScreenTextDiv.innerHTML = text;
}

/****************************************************************
 * websocket communication
 */
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
      case 'color':
        // change color
        color = incoming.value;
        break;

      default:
        break;
    }
  }
});

/********************************************************************
 *  device orientation
 */
let dataStreamTimeout = null;
let dataStreamResolve = null;

// get promise for device orientation check and start
function requestDeviceOrientation() {
  return new Promise((resolve, reject) => {
    dataStreamResolve = resolve;

    // set timeout in case that the API is ok, but no data is sent
    dataStreamTimeout = setTimeout(() => {
      dataStreamTimeout = null;
      reject("no motion sensor data streams");
    }, 1000);

    if (DeviceOrientationEvent) {
      if (DeviceOrientationEvent.requestPermission) {
        clearTimeout(dataStreamTimeout);

        // ask device orientation permission on iOS
        DeviceOrientationEvent.requestPermission()
          .then((response) => {
            if (response == "granted") {
              // got permission
              window.addEventListener("deviceorientation", onDeviceOrientation);
              resolve();
            } else {
              reject("no permission for device orientation");
            }
          })
          .catch(console.error);
      } else {
        // no permission needed on non-iOS devices
        window.addEventListener("deviceorientation", onDeviceOrientation);
      }
    } else {
      reject("device orientation not available");
    }
  });
}

const refAlpha = null;
const alphaRange = 45;
const minBeta = 0;
const maxBeta = 45;

function onDeviceOrientation(e) {
  if (dataStreamTimeout !== null && dataStreamResolve !== null) {
    dataStreamResolve();
    clearTimeout(dataStreamTimeout);
  }

  let alpha = e.alpha;
  let beta = e.beta;

  if (refAlpha === null) {
    refAlfa = e.alpha;
  }

  alpha -= refAlpha;

  if (alpha < -180) {
    alpha += 360;
  } else if (alpha >= 180) {
    alpha -= 360;
  }

  alpha = Math.min(Math.max(alpha, -alphaRange), alphaRange);
  beta = Math.min(Math.max(beta, minBeta), maxBeta);

  const x = (alpha + alphaRange) / (-2 * alphaRange);
  const y = (beta + minBeta) / (maxBeta - minBeta);
  makeStroke(x, y);
}

/****************************************************************
 * touch and mouse pointer event listeners
 */
// touch listener
// window.addEventListener('touchstart', onPointerStart, false);
// window.addEventListener('touchmove', onPointerMove, false);
// window.addEventListener('touchend', onPointerEnd, false);
// window.addEventListener('touchcancel', onPointerEnd, false);

// mouse pointer listener
// window.addEventListener('mousedown', onPointerStart, false);
// window.addEventListener('mousemove', onPointerMove, false);
// window.addEventListener('mouseup', onPointerEnd, false);
let mouseIsDown = false;

let lastX = null;
let lastY = null;

function onPointerStart(e) {
  const x = e.changedTouches ? e.changedTouches[0].pageX : e.pageX;
  const y = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;
  mouseIsDown = true;
  makeStroke(x, y);
}

function onPointerMove(e) {
  if (mouseIsDown) {
    const x = e.changedTouches ? e.changedTouches[0].pageX : e.pageX;
    const y = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;
    makeStroke(x, y);
  }
}

function onPointerEnd(e) {
  mouseIsDown = false;
  lastX = null;
  lastY = null;
}

function makeStroke(x, y) {
  // normalize coordinates with canvas size
  const currentX = x / canvas.width;
  const currentY = y / canvas.height;

  if (lastX === null || lastY === null) {
    lastX = currentX;
    lastY = currentY;
  }

  // paint stroke into canvas (normalized coordinates)
  canvas.stroke(lastX, lastY, currentX, currentY, color);

  // paint stroke with normalized start and end coordinates and color
  const outgoing = {
    selector: 'stroke',
    start: [lastX, lastY],
    end: [currentX, currentY],
    color: color
  };

  // send paint stroke to server
  const str = JSON.stringify(outgoing);
  socket.send(str);

  lastX = currentX;
  lastY = currentY;
}

/********************************************************************
 * web audio
 */
// get promise for web audio check and start
function requestWebAudio() {
  return new Promise((resolve, reject) => {
    if (AudioContext) {
      audioContext.resume()
        .then(() => resolve())
        .catch(() => reject());
    }
    else {
      reject("web audio not available");
    }
  });
}
