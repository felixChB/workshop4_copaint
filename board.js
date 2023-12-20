import { Canvas } from "./canvas.js";

const socket = new WebSocket('ws://localhost:8000/board');
const canvasElem = document.getElementById("canvas");
const canvas = new Canvas(canvasElem);

window.addEventListener("resize", () => canvas.adaptSize());
canvas.adaptSize();


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

    // dispatch incoming message
    switch (incoming.selector) {
      case 'stroke':
        const start = incoming.start;
        const end = incoming.end;
        const color = incoming.color;
        canvas.stroke(start[0] * canvas.width, start[1] * canvas.height, end[0] * canvas.width, end[1] * canvas.height, color);
        break;
    }
  }
});
