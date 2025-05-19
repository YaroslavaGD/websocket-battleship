import { WebSocket, WebSocketServer } from 'ws';
import { getSessionBySocket, getSocketByIndex } from '../services/session.service';
import { addUserToRoom, createRoom, getAvailableRooms, removeRoom } from '../services/room.service';
import { broadcastAll, logger, respond } from '../utils';
import { AddUserPayload } from '../models/ws-payloads.model';

export function handleCreateRoom(ws: WebSocket, wss: WebSocketServer) {
  const session = getSessionBySocket(ws);
  if (!session) return;

  createRoom({ name: session.name, index: session.index });

  logger.success(`[create_room] ${session.name} created room`);

  broadcastAll(wss, respond.updateRoom(getAvailableRooms()));
}

export function handleAddUserToRoom(ws: WebSocket, rawData: unknown, wss: WebSocketServer) {
  let payload: AddUserPayload = { indexRoom: '' };

  try {
    payload = JSON.parse(typeof rawData === 'string' ? rawData : '') as AddUserPayload;
    logger.info(`[add_user_to_room] Incoming request: ${JSON.stringify(payload)}`);
  } catch {
    ws.send(respond.addUserToRoomError('Invalid JSON format'));

    logger.warn('[add_user_to_room] Invalid JSON format');
  }

  const { indexRoom } = payload;
  const normalizedRoomId = typeof indexRoom === 'string' ? parseInt(indexRoom, 10) : indexRoom;

  if (Number.isNaN(normalizedRoomId)) {
    ws.send(respond.addUserToRoomError('Invalid room ID'));
    logger.warn(`[add_user_to_room] Invalid room ID: ${indexRoom}`);
    return;
  }

  logger.info(`[add_user_to_room] Request to add user in room ${normalizedRoomId}`);
  const session = getSessionBySocket(ws);
  if (!session) return;

  const room = addUserToRoom(normalizedRoomId, { name: session.name, index: session.index });
  if (!room) {
    logger.warn(`[add_user_to_room] Room ${normalizedRoomId} not found or full`);
  }

  if (room && room.roomUsers.length === 2) {
    const idGame = `game-${Date.now()}`;

    logger.success(`[add_user_to_room] ${session.name} joined room ${normalizedRoomId}`);
    logger.info(`[create_game] Room ${normalizedRoomId} is full, starting game: ${idGame}`);
    console.log('Room users = ', room.roomUsers);
    room.roomUsers.forEach((user) => {
      const client = getSocketByIndex(user.index);
      if (client) {
        client.send(respond.createGame(idGame, user.index));
      }
    });

    logger.info(
      `[create_game] create_game sent to players: ${room.roomUsers.map((u) => u.name).join(', ')}`
    );

    removeRoom(normalizedRoomId);
  }

  broadcastAll(wss, respond.updateRoom(getAvailableRooms()));
}
