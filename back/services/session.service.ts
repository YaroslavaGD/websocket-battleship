import { WebSocket } from 'ws';

type PlayerSession = {
  name: string;
  index: number;
  socket: WebSocket;
};

const nameToSession = new Map<string, PlayerSession>();
const wsToName = new Map<WebSocket, string>();

export function isPlayerConnected(name: string): boolean {
  return nameToSession.has(name);
}

export function addSession(name: string, index: number, socket: WebSocket) {
  nameToSession.set(name, { name, index, socket });
  wsToName.set(socket, name);
}

export function removeSessionBySocket(socket: WebSocket): void {
  const name = wsToName.get(socket);

  if (name) {
    nameToSession.delete(name);
    wsToName.delete(socket);
  }
}

export function getSessionBySocket(socket: WebSocket): PlayerSession | undefined {
  const name = wsToName.get(socket);
  if (!name) return undefined;

  return nameToSession.get(name);
}

export function getSocketByIndex(index: number): WebSocket | undefined {
  return [...nameToSession.values()].find((s) => s.index === index)?.socket;
}

export function getAllSessions(): PlayerSession[] {
  return Array.from(nameToSession.values());
}
