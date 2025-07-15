export interface RoomUser {
  name: string;
  index: number;
}
export interface Room {
  roomId: number;
  roomUsers: RoomUser[];
}
