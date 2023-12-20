import express from 'express';
import WebSocket from 'ws';
// const express = require('express')
// const WebSocket = require('ws');

const httpPort = 3000;
const webServer = express()
  .use(express.static('.'))
  .listen(3000, () => console.log(`HTTP server istening on port ${httpPort}`))

// // create WebSocket server with given port
const webSocketPort = Number(process.env.PORT) || 8000;
const webSocketServer = new WebSocket.Server({ port: webSocketPort });

console.log(`websocket server listening on port ${webSocketPort}`);

const brushes = new Map();
let boardSocket = null;
let hue = 0;

// init counters (0 is number of connected clients)
webSocketServer.on('connection', (socket, req) => {
  const isBoard = (req.url === '/board');

  if (isBoard) {
    boardSocket = socket;

    socket.on('close', () => {
      boardSocket = null;
    });
  } else {
    const outgoing = { selector: 'color', value: `hsl(${hue}, 100%, 50%)` };
    const str = JSON.stringify(outgoing);
    socket.send(str);
    // hue = (hue + 0.6180339887498949 * 360) % 360;
    hue = (hue + 0.6180339887498949 * 360) % 360;
  }

  socket.on('message', (message) => {
    if (message.length > 0) {
      // receive paintbrush position from connected clients
      const incoming = JSON.parse(message);

      if (boardSocket !== null && incoming.selector === 'stroke') {
        boardSocket.send(message);
      }
    } else {
      // receive ping and respond send pong message
      socket.send('');
    }
  });
});
