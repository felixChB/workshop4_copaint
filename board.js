import { Canvas } from "./canvas.js";

// websocket parameters
const webSocketPort = 3000; 
const webSocketAddr = '192.168.0.210';

// create full screen canvas to draw to
const canvasElem = document.getElementById("canvas");
const canvas = new Canvas(canvasElem);

/****************************************************************
 * websocket communication
 */
// const socket = new WebSocket(`wss://${webSocketAddr}:${webSocketPort}/board`);
const socket = new WebSocket(`ws://${webSocketAddr}:${webSocketPort}/board`);

// listen to connection open
socket.addEventListener('open', (event) => {
  // send regular ping messages (to keep websocket connection alive)
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

    // dispatch incoming messages
    switch (incoming.selector) {
      case 'stroke':
        // paint a stroke sent by a client on the board
        const start = incoming.start;
        const end = incoming.end;
        const thickness = incoming.thickness;
        const color = incoming.color;
        canvas.stroke(start[0], start[1], end[0], end[1], thickness, color);
        break;
    }
  }
});
