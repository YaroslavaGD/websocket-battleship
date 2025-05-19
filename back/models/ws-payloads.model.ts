export interface RegPayload {
  name: string;
  password: string;
}

export interface AddUserPayload {
  indexRoom: number | string;
}

export interface AddShipPayload {
  gameId: string;
  indexPlayer: number;
  ships: [];
}

export type AttackStatus = 'miss' | 'shot' | 'killed';

export interface AttackPayload {
  gameId: string;
  x: number;
  y: number;
  indexPlayer: number;
}
