import { Player } from './models/player.model';

export function logger(message: string) {
  console.log(message);
}

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
};
