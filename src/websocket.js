/** @format */

const redis = require('redis');
const WebSocketServer = require('ws').Server;
let wsServer;

const redisPublisher = redis.createClient();

function emitSocketEvent (targetUserId, event, payload) {
  redisPublisher.publish(targetUserId, JSON.stringify({ event, payload }));
}

function createSocketServer () {
  wsServer = new WebSocketServer({ noServer: true, clientTracking: false });

  // when we get to this point, we know that the user
  // has already undergone the validation from the handshake
  // process
  wsServer.on('connection', (socket, authUser) => {
    const redisSubscriber = redis.createClient();
    redisSubscriber.subscribe(authUser.id);
    redisSubscriber.on('message', (_, event) => socket.send(event));
    socket.on('close', () => {
      redisSubscriber.unsubscribe();
      redisSubscriber.quit();
    });
  });

  return wsServer;
}

module.exports.emitSocketEvent = emitSocketEvent;
module.exports.createSocketServer = createSocketServer;
