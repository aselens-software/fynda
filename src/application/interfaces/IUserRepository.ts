import { User } from '../../domain/entities/User';

export interface IUserRepository {
  findByDiscordId(discordId: string): Promise<User | null>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  findDiscoverableUsers(excludeDiscordIds: string[], limit: number): Promise<User[]>;
}
