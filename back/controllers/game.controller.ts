import { WebSocket } from 'ws';
import { AddShipPayload } from '../models/ws-payloads.model';
import { logger, respond } from '../utils';
import {
  addPlayerShipsToGame,
  createGameIfMissing,
  getGameById,
  isGameReady,
  setRandomStartingPlayer,
} from '../services/game.service';
import { getSocketByIndex } from '../services/session.service';

export default function handleAddShips(ws: WebSocket, rawData: unknown) {
  let payload: AddShipPayload;

  try {
    payload = JSON.parse(typeof rawData === 'string' ? rawData : '') as AddShipPayload;

    logger.info(`[add_ships] Incoming payload: ${JSON.stringify(payload)}`);
  } catch {
    ws.send(respond.serverError('Invalid add_ships JSON format'));

    logger.warn('[add_ships] Invalid JSON format');
    return;
  }

  const { gameId, ships, indexPlayer } = payload;
  if (!Array.isArray(ships) || !gameId || indexPlayer === undefined) {
    ws.send(respond.serverError('Missing required fields in add_ships'));
  }

  createGameIfMissing(gameId);
  addPlayerShipsToGame(gameId, indexPlayer, ships);

  const game = getGameById(gameId);

  if (!game) {
    logger.error(`[add_ships] Game ${gameId} not found`);
    return;
  }

  if (isGameReady(game)) {
    setRandomStartingPlayer(game);

    game.players.forEach((player) => {
      const client = getSocketByIndex(player.index);

      if (client) {
        client.send(respond.startGame(player.ships, game.currentPlayer));
      }
    });

    const current = getSocketByIndex(game.currentPlayer);
    if (current) {
      current.send(respond.turn(game.currentPlayer));
    }

    logger.success(
      `[add_ships] Game ${gameId} started with ${game.players.map((p) => p.index).join(', ')}`
    );
  }
}
