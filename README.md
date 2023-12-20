# mean-position

In this example, multiple clients can send the position of a circle on screen (moved through touch or pointer) to a server via websockets. The server calculates the mean position of all conntected clients and sends it back to them.

A particular client page (`max-receiver.html`) can receive and output the mean position in Cycling'74 Max using the *jweb* and *udpreceive* objects.

By default the example uses a local web server.

The follwing files are important:
- `index.html`/`client.js`: the web client allowing for sending positions to the server
- `max-receiver.html`/`max-receiver.js`:  the web client allowing for recieving the mean position in Cycling'74 Max
- `max-receiver.maxpat`: a Max patch receiving the data using a *jweb* object 
- `server.js`: the node.js server

To run the example with a local server:
- install the node packages: `npm install`
- launch the server: `node server.js`
- open the client webpage `index.html` in your favourite browser
- open the Max patch `max-receiver.maxpat` in Cycling'74 Max
