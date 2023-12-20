import { Canvas } from "./canvas.js";

const socket = new WebSocket('ws://localhost:8000');
let mouseIsDown = false;

const canvasElem = document.getElementById("canvas");
const canvas = new Canvas(canvasElem);
let color = '#000';
let currentX = null;
let currentY = null;

window.addEventListener("resize", () => canvas.adaptSize());
canvas.adaptSize();

window.addEventListener('touchstart', onPointerStart, false);
window.addEventListener('touchmove', onPointerMove, false);
window.addEventListener('touchend', onPointerEnd, false);
window.addEventListener('touchcancel', onPointerEnd, false);

window.addEventListener('mousedown', onPointerStart, false);
window.addEventListener('mousemove', onPointerMove, false);
window.addEventListener('mouseup', onPointerEnd, false);
//window.addEventListener('mouseout', onPointerEnd, false);

// listen to connection open
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

    // dispatch incomming message
    switch (incoming.selector) {
      case 'color':
        color = incoming.value;
        break;

      default:
        break;
    }
  }
});

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
  const x = e.changedTouches ? e.changedTouches[0].pageX : e.pageX;
  const y = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;
  makeStroke(x, y);
  currentX = null;
  currentY = null;
}

function makeStroke(x, y) {
  if (currentX !== null & currentY !== null) {
    canvas.stroke(currentX, currentY, x, y, color);

    const outgoing = {
      selector: 'stroke',
      start: [currentX / canvas.width, currentY / canvas.height],
      end: [x / canvas.width, y / canvas.height],
      color: color
    };

    const str = JSON.stringify(outgoing);
    socket.send(str);
  }

  currentX = x;
  currentY = y;
}
