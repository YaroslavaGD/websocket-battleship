import { WebSocket, WebSocketServer } from 'ws';
// import { getAllWinners, registerOrLoginPlayer } from './services/player.service';
import { logger, respond } from './utils';
// import { addUserToRoom, createRoom, getAvailableRooms, removeRoom } from './services/room.service';
import {
  // addSession,
  // getSessionBySocket,
  // getSocketByIndex,
  // isPlayerConnected,
  removeSessionBySocket,
} from './services/session.service';
import handleRegisterOrLogin from './controllers/player.controller';
import { handleAddUserToRoom, handleCreateRoom } from './controllers/room.controller';

const REQUEST_TYPE = {
  REG: 'reg',
  CREATE_ROOM: 'create_room',
  ADD_USER_TO_ROOM: 'add_user_to_room',
};
const PORT = 3000;
const wss = new WebSocketServer({ port: PORT }, () => {
  logger.info(`Websocket server started on port ${PORT}`);
});

wss.on('connection', (ws: WebSocket) => {
  console.log('New player connected');
  ws.send(JSON.stringify({ type: 'info', data: 'Welcome to the Battleship server!', id: 0 }));

  ws.on('message', (msg) => {
    try {
      console.log('Message received: ', msg.toString());
      const { type, data } = JSON.parse(msg.toString());

      if (type === REQUEST_TYPE.REG) {
        handleRegisterOrLogin(ws, data, wss);
      }

      if (type === REQUEST_TYPE.CREATE_ROOM) {
        handleCreateRoom(ws, wss);
      }

      if (type === REQUEST_TYPE.ADD_USER_TO_ROOM) {
        handleAddUserToRoom(ws, data, wss);
      }
    } catch (error) {
      respond.serverError('Internal Server Error');
      console.log(error);
      logger.error(`[ERROR] Internal Server Error: ${error}`);
      logger.error(`[ERROR] Internal Server Error: ${error}`);
    }
  });

  ws.on('close', () => {
    removeSessionBySocket(ws);
    logger.info('Player disconnected');
  });
});
