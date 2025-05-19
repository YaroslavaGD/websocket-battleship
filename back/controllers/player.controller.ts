import { WebSocket, WebSocketServer } from 'ws';
import { addSession, isPlayerConnected } from '../services/session.service';
import { broadcastAll, logger, respond } from '../utils';
import { getAllWinners, registerOrLoginPlayer } from '../services/player.service';
import { getAvailableRooms } from '../services/room.service';
import { RegPayload } from '../models/ws-payloads.model';

export default function handleRegisterOrLogin(
  ws: WebSocket,
  rawData: unknown,
  wss: WebSocketServer
) {
  let payload: RegPayload;

  try {
    payload = JSON.parse(typeof rawData === 'string' ? rawData : '');

    logger.info(`[reg] Incoming request`);
  } catch {
    ws.send(respond.regError('Invalid registration or login format'));

    logger.warn('[reg] Invalid JSON format');
    return;
  }

  const { name, password } = payload;

  if (isPlayerConnected(name)) {
    ws.send(respond.regError('User already connected'));

    logger.warn(`[reg] ${name} already connected`);
    return;
  }

  const player = registerOrLoginPlayer(name, password);
  if (!player) {
    ws.send(respond.regError('Incorrect password'));

    logger.warn(`[reg] Incorrect password for ${name}`);
    return;
  }

  addSession(player.name, player.index, ws);
  ws.send(respond.regOk(player));

  logger.success(`[reg] ${name} connected`);

  broadcastAll(wss, respond.updateWinners(getAllWinners()));
  broadcastAll(wss, respond.updateRoom(getAvailableRooms()));
}
