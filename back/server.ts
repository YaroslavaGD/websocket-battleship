import { WebSocket, WebSocketServer } from 'ws';
import { getAllWinners, registerPlayer } from './services/player.service';
import { respond } from './utils';

function broadcastAll(wss: WebSocketServer, json: string) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(json);
    }
  });
}

const wss = new WebSocketServer({ port: 3000 }, () => {
  console.log('Websocket server started on port 3000');
});

wss.on('connection', (ws: WebSocket) => {
  console.log('New player connected');
  ws.send(JSON.stringify({ type: 'info', data: 'Welcome to the Battleship server!', id: 0 }));

  ws.on('message', (msg) => {
    try {
      console.log('Message received: ', msg.toString());
      const { type, data } = JSON.parse(msg.toString());

      if (type === 'reg') {
        const { name, password } = JSON.parse(data || {});
        const player = registerPlayer(name, password);
        if (!player) ws.send(respond.regError('Player already exists'));

        if (player) {
          ws.send(respond.regOk(player));
          broadcastAll(wss, respond.updateWinners(getAllWinners()));
        }
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Player disconnected');
  });
});
