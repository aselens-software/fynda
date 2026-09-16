import { ConnectionRequest } from '../../domain/entities/ConnectionRequest';
import { ConnectionStatus } from '../../domain/enums/ConnectionStatus';

export interface IConnectionRepository {
  save(connection: ConnectionRequest): Promise<ConnectionRequest>;
  update(connection: ConnectionRequest): Promise<ConnectionRequest>;
  findById(id: string): Promise<ConnectionRequest | null>;
  findByUsers(userA: string, userB: string): Promise<ConnectionRequest | null>;
  findByChannelId(channelId: string): Promise<ConnectionRequest | null>;
  findPendingRequests(discordId: string): Promise<ConnectionRequest[]>;
  getInteractedUserIds(discordId: string): Promise<string[]>; // To exclude them from future matching
}
