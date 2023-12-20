import { Canvas } from "./canvas.js";

const canvasElem = document.getElementById("canvas");
const canvas = new Canvas(canvasElem);
let color = '#000';

/****************************************************************
 * websocket communication
 */
const socket = new WebSocket('ws://localhost:8000');

// listen to websocket connection open
socket.addEventListener('open', (event) => {
  // send regular ping messages
  setInterval(() => {
    if (socket.readyState == socket.OPEN) {
      socket.send('');
    }
  }, 20000);
});

// listen to message from server
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

/****************************************************************
 * touch and mouse pointer event listeners
 */
window.addEventListener('touchstart', onPointerStart, false);
window.addEventListener('touchmove', onPointerMove, false);
window.addEventListener('touchend', onPointerEnd, false);
window.addEventListener('touchcancel', onPointerEnd, false);

window.addEventListener('mousedown', onPointerStart, false);
window.addEventListener('mousemove', onPointerMove, false);
window.addEventListener('mouseup', onPointerEnd, false);
//window.addEventListener('mouseout', onPointerEnd, false);

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

  canvas.stroke(lastX, lastY, currentX, currentY, color);

  // send paint stroke to server
  const outgoing = {
    selector: 'stroke',
    start: [lastX, lastY],
    end: [currentX, currentY],
    color: color
  };

  const str = JSON.stringify(outgoing);
  socket.send(str);

  lastX = currentX;
  lastY = currentY;
}
