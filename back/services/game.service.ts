import { GameState } from '../models/game.model';
import { Ship } from '../models/ws-payloads.model';

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
  return game.players.find((p) => p.index !== currentIndex);
}
