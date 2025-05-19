import { WebSocketServer } from 'ws';
import { Player } from './models/player.model';
import { Room } from './models/room.model';

export const logger = {
  info: (msg: string) => console.log(`${msg}`),
  success: (msg: string) => console.log(`${msg}`),
  warn: (msg: string) => console.warn(`${msg}`),
  error: (msg: string) => console.error(`${msg}`),
};

export const respond = {
  regOk: (player: Player, id = 0) =>
    JSON.stringify({
      type: 'reg',
      data: JSON.stringify({
        name: player.name,
        index: player.index,
      }),
      id,
    }),

  regError: (errorText: string, id = 0) =>
    JSON.stringify({
      type: 'reg',
      data: JSON.stringify({
        error: true,
        errorText,
      }),
      id,
    }),

  updateWinners: (players: Pick<Player, 'name' | 'wins'>[], id = 0) =>
    JSON.stringify({
      type: 'update_winners',
      data: JSON.stringify(players),
      id,
    }),

  updateRoom: (rooms: Room[], id = 0) =>
    JSON.stringify({
      type: 'update_room',
      data: JSON.stringify(rooms),
      id,
    }),

  createGame: (idGame: string | number, idPlayer: string | number, id = 0) =>
    JSON.stringify({
      type: 'create_game',
      data: JSON.stringify({ idGame, idPlayer }),
      id,
    }),
};

export function broadcastAll(wss: WebSocketServer, json: string) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      console.log('send json = ', json);
      client.send(json);
    }
  });
}
