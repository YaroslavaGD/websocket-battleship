import { Room } from '../models/room.model';
import { RoomUser } from '../models/roomUser.model';

let roomCounter = 1;
const rooms: Room[] = [];

export function createRoom(user: RoomUser): Room {
  const room: Room = {
    roomId: roomCounter++,
    roomUsers: [user],
  };
  rooms.push(room);
  console.log('rooms state = ', rooms);
  return room;
}

export function addUserToRoom(roomId: number, user: RoomUser): Room | null {
  console.log('rooms state = ', rooms);
  const room = rooms.find((r) => r.roomId === roomId && r.roomUsers.length === 1);
  console.log('room = ', room);
  if (!room) return null;

  room.roomUsers.push(user);
  return room;
}

export function getAvailableRooms(): Room[] {
  return rooms.filter((r) => r.roomUsers.length === 1);
}

export function removeRoom(roomId: number) {
  const index = rooms.findIndex((r) => r.roomId === roomId);

  if (index !== -1) rooms.splice(index, 1);
}
