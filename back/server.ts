import { WebSocket, WebSocketServer } from 'ws';
import { getAllWinners, registerOrLoginPlayer } from './services/player.service';
import { broadcastAll, respond } from './utils';
import { addUserToRoom, createRoom, getAvailableRooms, removeRoom } from './services/room.service';
import {
  addSession,
  getSessionBySocket,
  getSocketByIndex,
  isPlayerConnected,
  removeSessionBySocket,
} from './services/session.service';

const REQUEST_TYPE = {
  REG: 'reg',
  CREATE_ROOM: 'create_room',
  ADD_USER_TO_ROOM: 'add_user_to_room',
};

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

      if (type === REQUEST_TYPE.REG) {
        const { name, password } = JSON.parse(data || {});
        if (isPlayerConnected(name)) {
          ws.send(respond.regError('User already connected'));
          return;
        }

        const player = registerOrLoginPlayer(name, password);
        if (!player) {
          ws.send(respond.regError('Incorrect password'));
          return;
        }

        addSession(player.name, player.index, ws);
        ws.send(respond.regOk(player));
        broadcastAll(wss, respond.updateWinners(getAllWinners()));
        broadcastAll(wss, respond.updateRoom(getAvailableRooms()));
      }

      if (type === REQUEST_TYPE.CREATE_ROOM) {
        const session = getSessionBySocket(ws);
        if (!session) return;

        createRoom({ name: session.name, index: session.index });
        broadcastAll(wss, respond.updateRoom(getAvailableRooms()));
      }

      if (type === REQUEST_TYPE.ADD_USER_TO_ROOM) {
        const { indexRoom } = JSON.parse(data || {});
        const session = getSessionBySocket(ws);
        if (!session) return;

        const room = addUserToRoom(indexRoom, { name: session.name, index: session.index });

        if (room && room.roomUsers.length === 2) {
          const idGame = `game-${Date.now()}`;

          room.roomUsers.forEach((user) => {
            const client = getSocketByIndex(user.index);
            if (client) {
              client.send(respond.createGame(idGame, user.index));
            }
          });

          removeRoom(indexRoom);
        }

        broadcastAll(wss, respond.updateRoom(getAvailableRooms()));
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Player disconnected');
    removeSessionBySocket(ws);
  });
});
