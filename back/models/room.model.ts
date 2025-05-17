import { RoomUser } from './roomUser.model';

export interface Room {
  roomId: number;
  users: RoomUser[];
}
