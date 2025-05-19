import { GamePlayer, GameState } from '../models/game.model';
import { Ship, ShipCell } from '../models/ship.model';
import { AttackStatus } from '../models/ws-payloads.model';
import { respond } from '../utils/utils';
import { getSocketByIndex } from './session.service';

const games = new Map<string, GameState>();

export function createGameIfMissing(idGame: string) {
  if (!games.has(idGame)) {
    games.set(idGame, {
      idGame,
      players: [],
      currentPlayer: -1,
    });
  }
}

export function addPlayerShipsToGame(idGame: string, index: number, ships: Ship[]) {
  const game = games.get(idGame);
  if (!game) return;

  const existing = game.players.find((p) => p.index === index);
  if (existing) {
    existing.ships = ships;
    existing.ready = true;
  } else {
    game.players.push({ index, ships, ready: true });
  }
}

export function isGameReady(game: GameState): boolean {
  return game.players.length === 2 && game.players.every((p) => p.ready);
}

export function setRandomStartingPlayer(game: GameState): void {
  const randomIndex = Math.floor(Math.random() * 2);
  const updatedGame: GameState = {
    ...game,
    currentPlayer: game.players[randomIndex].index,
  };

  games.set(game.idGame, updatedGame);
}

export function getGameById(idGame: string): GameState | undefined {
  return games.get(idGame);
}

export function getOpponentPlayer(game: GameState, currentIndex: number) {
  if (!game) return undefined;
  return game.players.find((p) => p.index !== currentIndex);
}

export function rotateShip(ship: Omit<Ship, 'cells'>): Ship {
  const cells: ShipCell[] = [];

  for (let i = 0; i <= ship.length; i++) {
    cells.push({
      x: ship.position.x + (ship.direction ? i : 0),
      y: ship.position.y + (ship.direction ? i : 0),
      hit: false,
    });
  }

  return {
    ...ship,
    cells,
  };
}

export function markHit(player: GamePlayer, x: number, y: number) {
  let status: AttackStatus = 'miss';

  const updatedShips = player.ships.map((ship) => {
    const updatedCells = ship.cells.map((cell) => {
      if (cell.x === x && cell.y === y && !cell.hit) {
        const allOthersHit = ship.cells
          .filter((c) => !(c.x === x && c.y === y))
          .every((c) => c.hit);

        status = allOthersHit ? 'killed' : 'shot';
        return { ...cell, hit: true };
      }

      return cell;
    });

    return { ...ship, cells: updatedCells };
  });

  return {
    status,
    updatedPlayer: {
      ...player,
      ships: updatedShips,
    },
  };
}

export function isAllShipsDestroyed(player: GamePlayer): boolean {
  return player.ships.every((ship) => ship.cells.every((cell) => cell.hit));
}

export function switchTurn(gameId: string): void {
  const game = games.get(gameId);
  if (!game) return;

  const other = game.players.find((p) => p.index !== game.currentPlayer);
  if (!other) return;

  games.set(gameId, { ...game, currentPlayer: other.index });
}

export function updateGamePlayer(gameId: string, updatedPlayer: GamePlayer) {
  const game = games.get(gameId);
  if (!game) return;

  const players = game.players.map((p) => (p.index === updatedPlayer.index ? updatedPlayer : p));

  games.set(gameId, { ...game, players });
}

export function sendTurnToCurrent(gameId: string): void {
  const game = games.get(gameId);
  if (!game) return;

  const socket = getSocketByIndex(game.currentPlayer);
  if (socket) {
    socket.send(respond.turn(game.currentPlayer));
  }
}
