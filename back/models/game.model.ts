import { Ship } from './ws-payloads.model';

export interface GamePlayer {
  index: number;
  ships: Ship[];
  ready: boolean;
}

export interface GameState {
  idGame: string;
  players: GamePlayer[];
  currentPlayer: number;
}
