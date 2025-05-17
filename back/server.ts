import { WebSocket, WebSocketServer } from 'ws';
import { getAllWinners, registerPlayer } from './services/player.service';
import { broadcastAll, playerIndexToWsMap, respond, wsToPlayerMap } from './utils';
import { addUserToRoom, createRoom, getAvailableRooms, removeRoom } from './services/room.service';

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
        const player = registerPlayer(name, password);
        if (!player) ws.send(respond.regError('Player already exists'));

        if (player) {
          wsToPlayerMap.set(ws, { name: player.name, index: player.index });
          playerIndexToWsMap.set(player.index, ws);
          ws.send(respond.regOk(player));
          broadcastAll(wss, respond.updateWinners(getAllWinners()));
          broadcastAll(wss, respond.updateRoom(getAvailableRooms()));
        }
      }

      if (type === REQUEST_TYPE.CREATE_ROOM) {
        const player = wsToPlayerMap.get(ws);
        console.log('create_room from player ', player);
        if (!player) return;

        createRoom(player);
        broadcastAll(wss, respond.updateRoom(getAvailableRooms()));
      }

      if (type === REQUEST_TYPE.ADD_USER_TO_ROOM) {
        const { indexRoom } = JSON.parse(data || {});
        const player = wsToPlayerMap.get(ws);

        console.log('add_to_room from player ', player);
        console.log('add_to_room in indexRoom  ', indexRoom);
        if (!player) return;

        const room = addUserToRoom(indexRoom, player);
        console.log('user 2 in room: ', room);
        if (room && room.roomUsers.length === 2) {
          const idGame = `game-${Date.now()}`;

          room.roomUsers.forEach((user) => {
            const client = playerIndexToWsMap.get(user.index);
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
    const player = wsToPlayerMap.get(ws);
    if (player) {
      wsToPlayerMap.delete(ws);
      playerIndexToWsMap.delete(player.index);
    }
  });
});
