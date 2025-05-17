import { Room } from '../models/room.model';
import { RoomUser } from '../models/roomUser.model';

let roomCounter = 1;
const rooms: Room[] = [];

export function createRoom(user: RoomUser): Room {
  const room: Room = {
    roomId: roomCounter++,
    users: [user],
  };
  rooms.push(room);
  return room;
}

export function addUserToRoom(roomId: number, user: RoomUser): Room | null {
  const room = rooms.find((r) => r.roomId === roomId && r.users.length === 1);
  if (!room) return null;

  room.users.push(user);
  return room;
}

export function getAvailableRooms(): Room[] {
  return rooms.filter((r) => r.users.length === 1);
}

export function removeRoom(roomId: number) {
  const index = rooms.findIndex((r) => r.roomId === roomId);

  if (index !== -1) rooms.splice(index, 1);
}
