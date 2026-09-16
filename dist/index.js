"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const discord_js_1 = require("discord.js");
const mongoose_1 = __importDefault(require("mongoose"));
const env_config_1 = require("./core/config/env.config");
const logger_1 = require("./core/logger/logger");
const container_1 = require("./core/di/container");
const ReadyEvent_1 = require("./presentation/events/ReadyEvent");
const InteractionCreateEvent_1 = require("./presentation/events/InteractionCreateEvent");
const MessageCreateEvent_1 = require("./presentation/events/MessageCreateEvent");
const ProfileCommand_1 = require("./presentation/commands/ProfileCommand");
const DiscoverCommand_1 = require("./presentation/commands/DiscoverCommand");
const EditProfileCommand_1 = require("./presentation/commands/EditProfileCommand");
const VisibilityCommand_1 = require("./presentation/commands/VisibilityCommand");
const RequestsCommand_1 = require("./presentation/commands/RequestsCommand");
const RevealCommand_1 = require("./presentation/commands/RevealCommand");
const EndChatCommand_1 = require("./presentation/commands/EndChatCommand");
const HelpCommand_1 = require("./presentation/commands/HelpCommand");
const StatsCommand_1 = require("./presentation/commands/StatsCommand");
const FeedbackCommand_1 = require("./presentation/commands/FeedbackCommand");
async function bootstrap() {
    try {
        logger_1.logger.info('Starting Fynda Discord Bot...');
        // Connect to MongoDB
        logger_1.logger.info('Connecting to MongoDB...');
        await mongoose_1.default.connect(env_config_1.config.MONGO_URI);
        logger_1.logger.info('Successfully connected to MongoDB.');
        // Initialize Discord Client
        const client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
            ],
        });
        // Resolve Discord Manager and Events/Commands from DI
        const discordManager = container_1.container.resolve('DiscordManager');
        const readyEvent = container_1.container.resolve(ReadyEvent_1.ReadyEvent);
        const interactionEvent = container_1.container.resolve(InteractionCreateEvent_1.InteractionCreateEvent);
        const messageCreateEvent = container_1.container.resolve(MessageCreateEvent_1.MessageCreateEvent);
        const profileCmd = container_1.container.resolve(ProfileCommand_1.ProfileCommand);
        const discoverCmd = container_1.container.resolve(DiscoverCommand_1.DiscoverCommand);
        const editProfileCmd = container_1.container.resolve(EditProfileCommand_1.EditProfileCommand);
        const visibilityCmd = container_1.container.resolve(VisibilityCommand_1.VisibilityCommand);
        const requestsCmd = container_1.container.resolve(RequestsCommand_1.RequestsCommand);
        const revealCmd = container_1.container.resolve(RevealCommand_1.RevealCommand);
        const endChatCmd = container_1.container.resolve(EndChatCommand_1.EndChatCommand);
        const helpCmd = container_1.container.resolve(HelpCommand_1.HelpCommand);
        const statsCmd = container_1.container.resolve(StatsCommand_1.StatsCommand);
        const feedbackCmd = container_1.container.resolve(FeedbackCommand_1.FeedbackCommand);
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
        logger_1.logger.info('Logging into Discord...');
        await client.login(env_config_1.config.DISCORD_BOT_TOKEN);
    }
    catch (error) {
        logger_1.logger.fatal({ err: error }, 'Failed to start application');
        process.exit(1);
    }
}
bootstrap();
