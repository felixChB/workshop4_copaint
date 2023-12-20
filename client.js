import { Canvas } from "./canvas.js";

// create full screen canvas to draw to
const canvasElem = document.getElementById("canvas");
const canvas = new Canvas(canvasElem);
let color = '#000';

/****************************************************************
 * websocket communication
 */
const socket = new WebSocket('ws://localhost:3001');

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

/****************************************************************
 * touch and mouse pointer event listeners
 */
// touch listener
window.addEventListener('touchstart', onPointerStart, false);
window.addEventListener('touchmove', onPointerMove, false);
window.addEventListener('touchend', onPointerEnd, false);
window.addEventListener('touchcancel', onPointerEnd, false);

// mouse pointer listener
window.addEventListener('mousedown', onPointerStart, false);
window.addEventListener('mousemove', onPointerMove, false);
window.addEventListener('mouseup', onPointerEnd, false);
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
