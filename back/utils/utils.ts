import { WebSocketServer } from 'ws';
import { Player } from '../models/player.model';
import { Room } from '../models/room.model';
import { Ship } from '../models/ship.model';
import { GameState } from '../models/game.model';
import { AttackStatus } from '../models/ws-payloads.model';
import { getSocketByIndex } from '../services/session.service';

export const logger = {
  info: (msg: string) => console.log(`${msg}`),
  success: (msg: string) => console.log(`${msg}`),
  warn: (msg: string) => console.warn(`${msg}`),
  error: (msg: string) => console.error(`${msg}`),
};

export function logGamePlayers(gameId: string, game: GameState) {
  logger.info(`[debug] Game ${gameId} players:`);
  game.players.forEach((p) => {
    logger.info(`  - Player ${p.index}, ready: ${p.ready}, ships: ${p.ships?.length}`);
  });
}

export const respond = {
  regOk: (player: Player, id = 0) =>
    JSON.stringify({
      type: 'reg',
      data: JSON.stringify({
        name: player.name,
        index: player.index,
      }),
      id,
    }),

  regError: (errorText: string, id = 0) =>
    JSON.stringify({
      type: 'reg',
      data: JSON.stringify({
        error: true,
        errorText,
      }),
      id,
    }),
  addUserToRoomError: (errorText: string, id = 0) =>
    JSON.stringify({
      type: 'add_user_to_room',
      data: JSON.stringify({
        error: true,
        errorText,
      }),
      id,
    }),
  updateWinners: (players: Pick<Player, 'name' | 'wins'>[], id = 0) =>
    JSON.stringify({
      type: 'update_winners',
      data: JSON.stringify(players),
      id,
    }),

  updateRoom: (rooms: Room[], id = 0) =>
    JSON.stringify({
      type: 'update_room',
      data: JSON.stringify(rooms),
      id,
    }),

  createGame: (idGame: string | number, idPlayer: string | number, id = 0) =>
    JSON.stringify({
      type: 'create_game',
      data: JSON.stringify({ idGame, idPlayer }),
      id,
    }),
  startGame: (ships: Ship[], currentPlayerIndex: number, id = 0) =>
    JSON.stringify({
      type: 'start_game',
      data: JSON.stringify({ ships, currentPlayerIndex }),
      id,
    }),
  turn: (currentPlayer: number, id = 0) =>
    JSON.stringify({
      type: 'turn',
      data: JSON.stringify({ currentPlayer }),
      id,
    }),
  attack: (
    position: { x: number; y: number },
    currentPlayer: number,
    status: AttackStatus,
    id = 0
  ) =>
    JSON.stringify({
      type: 'attack',
      data: JSON.stringify({ position, currentPlayer, status }),
      id,
    }),

  finish: (winPlayer: number, id = 0) =>
    JSON.stringify({
      type: 'finish',
      data: JSON.stringify({ winPlayer }),
      id,
    }),
  serverError: (errorText: string, id = 0) =>
    JSON.stringify({
      type: 'error',
      data: JSON.stringify({
        error: true,
        errorText,
      }),
      id,
    }),
};

export function broadcastAll(wss: WebSocketServer, json: string) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      console.log('send json = ', json);
      client.send(json);
    }
  });
}

export function broadcastAttackToAll(
  game: GameState,
  x: number,
  y: number,
  shooterIndex: number,
  status: AttackStatus
) {
  game.players.forEach((player) => {
    const socket = getSocketByIndex(player.index);
    if (socket) {
      socket.send(respond.attack({ x, y }, shooterIndex, status));
    }
  });
}

export function broadcastFinish(game: GameState, winner: number) {
  game.players.forEach((player) => {
    const socket = getSocketByIndex(player.index);

    if (socket) {
      socket.send(respond.finish(winner));
    }
  });
}
