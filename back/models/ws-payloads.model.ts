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

export interface Ship {
  position: { x: number; y: number };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}
