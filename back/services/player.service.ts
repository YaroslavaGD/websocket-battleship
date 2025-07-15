import { Player } from '../models/player.model';

const players: Player[] = [];

export function registerOrLoginPlayer(name: string, password: string): Player | null {
  const existingPlayer = players.find((p) => p.name === name);
  if (existingPlayer) {
    if (existingPlayer.password !== password) {
      return null;
    }

    return existingPlayer;
  }

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
