import { container } from 'tsyringe';
import { MongoUserRepository } from '../../infrastructure/database/repositories/MongoUserRepository';
import { ProfileService } from '../../application/services/ProfileService';

import { MongoConnectionRepository } from '../../infrastructure/database/repositories/MongoConnectionRepository';
import { MatchingService } from '../../application/services/MatchingService';
import { ConnectionService } from '../../application/services/ConnectionService';
import { ConnectionChannelCache } from '../../infrastructure/cache/ConnectionChannelCache';

// Using 'IUserRepository' string token because TS interfaces don't exist at runtime
container.register('IUserRepository', {
  useClass: MongoUserRepository,
});

container.register('IConnectionRepository', {
  useClass: MongoConnectionRepository,
});

// Register singleton cache for message relay performance
container.registerSingleton(ConnectionChannelCache, ConnectionChannelCache);

// Register Services
container.register(ProfileService, {
  useClass: ProfileService,
});
container.register(MatchingService, {
  useClass: MatchingService,
});
container.register(ConnectionService, {
  useClass: ConnectionService,
});

// Presentation layer (Discord)
import { DiscordManager } from '../discord/DiscordManager';
import { ProfileCommand } from '../../presentation/commands/ProfileCommand';
import { ReadyEvent } from '../../presentation/events/ReadyEvent';
import { InteractionCreateEvent } from '../../presentation/events/InteractionCreateEvent';
import { MessageCreateEvent } from '../../presentation/events/MessageCreateEvent';
import { DiscoverCommand } from '../../presentation/commands/DiscoverCommand';
import { EditProfileCommand } from '../../presentation/commands/EditProfileCommand';
import { VisibilityCommand } from '../../presentation/commands/VisibilityCommand';
import { RequestsCommand } from '../../presentation/commands/RequestsCommand';
import { RevealCommand } from '../../presentation/commands/RevealCommand';
import { EndChatCommand } from '../../presentation/commands/EndChatCommand';
import { HelpCommand } from '../../presentation/commands/HelpCommand';
import { StatsCommand } from '../../presentation/commands/StatsCommand';
import { FeedbackCommand } from '../../presentation/commands/FeedbackCommand';

// We register DiscordManager as a singleton so it can hold the state of registered commands
container.registerSingleton('DiscordManager', DiscordManager);

export { container };
