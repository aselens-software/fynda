import { ClientEvents } from 'discord.js';

export interface IEvent<K extends keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute(...args: ClientEvents[K]): Promise<void> | void;
}
