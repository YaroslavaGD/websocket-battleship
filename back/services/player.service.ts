import { Player } from '../models/player.model';

const players: Player[] = [];

export function registerPlayer(name: string, password: string): Player | null {
  const isExisting = players.find((p) => p.name === name);
  if (isExisting) return null;

  const player: Player = {
    name,
    password,
    index: players.length,
    wins: 0,
  };

  players.push(player);

  return player;
}

export function getAllWinners() {
  return players.map((p) => ({ name: p.name, wins: p.wins }));
}
