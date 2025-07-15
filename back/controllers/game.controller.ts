import { WebSocket } from 'ws';
import { AddShipPayload, AttackPayload } from '../models/ws-payloads.model';
import {
  broadcastAttackToAll,
  broadcastFinish,
  logGamePlayers,
  logger,
  respond,
} from '../utils/utils';
import {
  addPlayerShipsToGame,
  createGameIfMissing,
  getGameById,
  getOpponentPlayer,
  isAllShipsDestroyed,
  isGameReady,
  markHit,
  rotateShip,
  sendTurnToCurrent,
  setRandomStartingPlayer,
  switchTurn,
  updateGamePlayer,
} from '../services/game.service';
import { getSocketByIndex } from '../services/session.service';

export function handleAddShips(ws: WebSocket, rawData: unknown) {
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
  const shipsWithCells = ships.map(rotateShip);
  createGameIfMissing(gameId);
  addPlayerShipsToGame(gameId, indexPlayer, shipsWithCells);

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

export function handleAttack(ws: WebSocket, rawData: unknown) {
  let payload: AttackPayload;
  try {
    payload = JSON.parse(typeof rawData === 'string' ? rawData : '') as AttackPayload;

    logger.info(`[attack] Request: ${JSON.stringify(payload)}`);
  } catch {
    ws.send(respond.serverError('Invalid attack format'));
    return;
  }

  const { gameId, x, y, indexPlayer } = payload;
  const game = getGameById(gameId);
  if (!game) {
    ws.send(respond.serverError('Game not found'));
    return;
  }
  //   logger.info(`[attack] Players in game ${gameId}: ${JSON.stringify(game.players, null, 2)}`);
  logGamePlayers(gameId, game);

  if (game.currentPlayer !== indexPlayer) {
    ws.send(respond.serverError('Not your turn'));
    return;
  }

  const opponent = getOpponentPlayer(game, indexPlayer);
  if (!opponent) {
    ws.send(respond.serverError('Opponent not found'));
    return;
  }

  if (!opponent.ships?.length) {
    logger.error(`[attack] Opponent ${opponent.index} has no ships`);
    ws.send(respond.serverError('Opponent has no ships'));
    return;
  }

  logger.info(`[debug] Calling markHit on opponent: ${JSON.stringify(opponent, null, 2)}`);
  const { status, updatedPlayer } = markHit(opponent, x, y);
  console.log('Here?');
  logger.info(`[debug] updatedPlayer: ${JSON.stringify(updatedPlayer, null, 2)}`);
  updateGamePlayer(gameId, updatedPlayer);

  broadcastAttackToAll(game, x, y, indexPlayer, status);

  if (isAllShipsDestroyed(updatedPlayer)) {
    broadcastFinish(game, indexPlayer);
    logger.success(`[finish] Player ${indexPlayer} won in game ${gameId}`);
    return;
  }

  if (status === 'miss') {
    switchTurn(gameId);
  }

  sendTurnToCurrent(gameId);
}
