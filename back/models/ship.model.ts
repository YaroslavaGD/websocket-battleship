export interface ShipCell {
  x: number;
  y: number;
  hit: boolean;
}

export interface Ship {
  position: { x: number; y: number };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
  cells: ShipCell[];
}
