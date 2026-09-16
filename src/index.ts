import 'reflect-metadata';
import { Client, GatewayIntentBits } from 'discord.js';
import mongoose from 'mongoose';
import { config } from './core/config/env.config';
import { logger } from './core/logger/logger';
import { container } from './core/di/container';
import { DiscordManager } from './core/discord/DiscordManager';
import { ReadyEvent } from './presentation/events/ReadyEvent';
import { InteractionCreateEvent } from './presentation/events/InteractionCreateEvent';
import { MessageCreateEvent } from './presentation/events/MessageCreateEvent';
import { ProfileCommand } from './presentation/commands/ProfileCommand';
import { DiscoverCommand } from './presentation/commands/DiscoverCommand';
import { EditProfileCommand } from './presentation/commands/EditProfileCommand';
import { VisibilityCommand } from './presentation/commands/VisibilityCommand';
import { RequestsCommand } from './presentation/commands/RequestsCommand';
import { RevealCommand } from './presentation/commands/RevealCommand';
import { EndChatCommand } from './presentation/commands/EndChatCommand';
import { HelpCommand } from './presentation/commands/HelpCommand';
import { StatsCommand } from './presentation/commands/StatsCommand';
import { FeedbackCommand } from './presentation/commands/FeedbackCommand';

async function bootstrap() {
  try {
    logger.info('Starting Fynda Discord Bot...');

    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(config.MONGO_URI);
    logger.info('Successfully connected to MongoDB.');

    // Initialize Discord Client
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    // Resolve Discord Manager and Events/Commands from DI
    const discordManager = container.resolve<DiscordManager>('DiscordManager');
    const readyEvent = container.resolve(ReadyEvent);
    const interactionEvent = container.resolve(InteractionCreateEvent);
    const messageCreateEvent = container.resolve(MessageCreateEvent);
    const profileCmd = container.resolve(ProfileCommand);
    const discoverCmd = container.resolve(DiscoverCommand);
    const editProfileCmd = container.resolve(EditProfileCommand);
    const visibilityCmd = container.resolve(VisibilityCommand);
    const requestsCmd = container.resolve(RequestsCommand);
    const revealCmd = container.resolve(RevealCommand);
    const endChatCmd = container.resolve(EndChatCommand);
    const helpCmd = container.resolve(HelpCommand);
    const statsCmd = container.resolve(StatsCommand);
    const feedbackCmd = container.resolve(FeedbackCommand);

    // Register Events
    discordManager.registerEvent(client, readyEvent);
    discordManager.registerEvent(client, interactionEvent);
    discordManager.registerEvent(client, messageCreateEvent);

    // Register Commands
    discordManager.registerCommand(profileCmd);
    discordManager.registerCommand(discoverCmd);
    discordManager.registerCommand(editProfileCmd);
    discordManager.registerCommand(visibilityCmd);
    discordManager.registerCommand(requestsCmd);
    discordManager.registerCommand(revealCmd);
    discordManager.registerCommand(endChatCmd);
    discordManager.registerCommand(helpCmd);
    discordManager.registerCommand(statsCmd);
    discordManager.registerCommand(feedbackCmd);

    // Deploy Slash Commands to Discord API
    await discordManager.deployCommands();

    logger.info('Logging into Discord...');
    await client.login(config.DISCORD_BOT_TOKEN);
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start application');
    process.exit(1);
  }
}

bootstrap();
