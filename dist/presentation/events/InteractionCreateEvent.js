"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionCreateEvent = void 0;
const discord_js_1 = require("discord.js");
const container_1 = require("../../core/di/container");
const ConnectionStatus_1 = require("../../domain/enums/ConnectionStatus");
const tsyringe_1 = require("tsyringe");
const DiscordManager_1 = require("../../core/discord/DiscordManager");
const ConnectionChannelCache_1 = require("../../infrastructure/cache/ConnectionChannelCache");
const logger_1 = require("../../core/logger/logger");
let InteractionCreateEvent = class InteractionCreateEvent {
    discordManager;
    name = discord_js_1.Events.InteractionCreate;
    constructor(discordManager) {
        this.discordManager = discordManager;
    }
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            await this.handleChatInput(interaction);
        }
        else if (interaction.isModalSubmit()) {
            await this.handleModalSubmit(interaction);
        }
        else if (interaction.isButton()) {
            await this.handleButtonSubmit(interaction);
        }
    }
    async handleChatInput(interaction) {
        const command = this.discordManager.getCommand(interaction.commandName);
        if (!command) {
            logger_1.logger.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            await command.execute(interaction);
        }
        catch (error) {
            logger_1.logger.error({ err: error, command: interaction.commandName }, `Error executing command`);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', flags: discord_js_1.MessageFlags.Ephemeral });
            }
            else {
                await interaction.reply({ content: 'There was an error while executing this command!', flags: discord_js_1.MessageFlags.Ephemeral });
            }
        }
    }
    async handleModalSubmit(interaction) {
        if (interaction.customId === 'edit_profile_modal') {
            await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
            try {
                const languages = interaction.fields.getTextInputValue('languages').split(',').map(s => s.trim()).filter(Boolean);
                const interests = interaction.fields.getTextInputValue('interests').split(',').map(s => s.trim()).filter(Boolean);
                const bio = interaction.fields.getTextInputValue('bio').trim();
                // This expects enum values like FRIENDSHIP, GAMING
                const lookingForRaw = interaction.fields.getTextInputValue('lookingFor').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
                const { ProfileService } = await Promise.resolve().then(() => __importStar(require('../../application/services/ProfileService')));
                const profileService = container_1.container.resolve(ProfileService);
                await profileService.updateProfile(interaction.user.id, {
                    languages,
                    interests,
                    bio,
                    lookingFor: lookingForRaw, // Casting for now, normally validate against enum
                });
                await interaction.editReply('Your profile has been updated successfully!');
            }
            catch (error) {
                logger_1.logger.error({ err: error, userId: interaction.user.id }, 'Failed to update profile via modal');
                await interaction.editReply('Failed to update profile: ' + (error.message || 'Unknown error'));
            }
        }
    }
    async handleButtonSubmit(interaction) {
        const customId = interaction.customId;
        const { ConnectionService } = await Promise.resolve().then(() => __importStar(require('../../application/services/ConnectionService')));
        const connectionService = container_1.container.resolve(ConnectionService);
        if (customId.startsWith('connect_')) {
            const targetId = customId.substring('connect_'.length);
            await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
            try {
                if (!interaction.guildId)
                    throw new Error('Must be used in a server.');
                await connectionService.sendRequest(interaction.user.id, targetId, interaction.guildId);
                await interaction.editReply('Connection request sent! 📨');
                // Attempt to send DM
                try {
                    const targetUser = await interaction.client.users.fetch(targetId);
                    const dmEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle('📬 New Connection Request!')
                        .setColor(0x00ff00)
                        .setDescription('Someone on the server wants to connect with you anonymously on Fynda!')
                        .addFields({ name: 'Action Required', value: 'Head over to the server and type `/requests` to view their profile and accept or reject the request.' })
                        .setFooter({ text: 'Fynda Matchmaking' });
                    await targetUser.send({ embeds: [dmEmbed] });
                }
                catch (dmError) {
                    logger_1.logger.warn({ err: dmError, targetId }, 'Could not send DM to user (DMs may be disabled)');
                }
            }
            catch (error) {
                await interaction.editReply(error.message || 'Failed to send request.');
            }
        }
        else if (customId.startsWith('skip_')) {
            const targetId = customId.substring('skip_'.length);
            await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
            try {
                await connectionService.skipUser(interaction.user.id, targetId);
                await interaction.editReply('Profile skipped.');
            }
            catch (error) {
                await interaction.editReply(error.message || 'Error skipping profile.');
            }
        }
        else if (customId.startsWith('accept_')) {
            const requestId = customId.substring('accept_'.length);
            await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
            try {
                if (!interaction.guild)
                    throw new Error('Must be used in a server.');
                // Check if request is valid and pending
                const existingRequest = await connectionService.getRequestById(requestId);
                if (!existingRequest)
                    throw new Error('Connection request not found.');
                if (existingRequest.status !== ConnectionStatus_1.ConnectionStatus.PENDING)
                    throw new Error('This request has already been processed.');
                // Validate senderGuildId exists before proceeding
                if (!existingRequest.senderGuildId) {
                    throw new Error('Cannot accept this request: the sender\'s server information is missing.');
                }
                // Find or create category
                let category = interaction.guild.channels.cache.find(c => c.name === 'Fynda Chats' && c.type === discord_js_1.ChannelType.GuildCategory);
                if (!category) {
                    category = await interaction.guild.channels.create({
                        name: 'Fynda Chats',
                        type: discord_js_1.ChannelType.GuildCategory,
                        permissionOverwrites: [
                            { id: interaction.guild.roles.everyone.id, deny: [discord_js_1.PermissionFlagsBits.ViewChannel] }
                        ]
                    });
                }
                // Create a private text channel for receiver
                const receiverChannel = await interaction.guild.channels.create({
                    name: `fynda-chat-${requestId.substring(0, 5)}`,
                    type: discord_js_1.ChannelType.GuildText,
                    parent: category.id,
                    permissionOverwrites: [
                        { id: interaction.guild.roles.everyone.id, deny: [discord_js_1.PermissionFlagsBits.ViewChannel] },
                        { id: interaction.client.user.id, allow: [discord_js_1.PermissionFlagsBits.ViewChannel, discord_js_1.PermissionFlagsBits.SendMessages] },
                        { id: interaction.user.id, allow: [discord_js_1.PermissionFlagsBits.ViewChannel, discord_js_1.PermissionFlagsBits.SendMessages], type: discord_js_1.OverwriteType.Member }
                    ]
                });
                // Find or create category in sender's guild
                const senderGuild = await interaction.client.guilds.fetch(existingRequest.senderGuildId);
                let senderCategory = senderGuild.channels.cache.find(c => c.name === 'Fynda Chats' && c.type === discord_js_1.ChannelType.GuildCategory);
                if (!senderCategory) {
                    senderCategory = await senderGuild.channels.create({
                        name: 'Fynda Chats',
                        type: discord_js_1.ChannelType.GuildCategory,
                        permissionOverwrites: [
                            { id: senderGuild.roles.everyone.id, deny: [discord_js_1.PermissionFlagsBits.ViewChannel] }
                        ]
                    });
                }
                // Create a private text channel for sender
                const senderChannel = await senderGuild.channels.create({
                    name: `fynda-chat-${requestId.substring(0, 5)}`,
                    type: discord_js_1.ChannelType.GuildText,
                    parent: senderCategory.id,
                    permissionOverwrites: [
                        { id: senderGuild.roles.everyone.id, deny: [discord_js_1.PermissionFlagsBits.ViewChannel] },
                        { id: interaction.client.user.id, allow: [discord_js_1.PermissionFlagsBits.ViewChannel, discord_js_1.PermissionFlagsBits.SendMessages] },
                        { id: existingRequest.senderDiscordId, allow: [discord_js_1.PermissionFlagsBits.ViewChannel, discord_js_1.PermissionFlagsBits.SendMessages], type: discord_js_1.OverwriteType.Member }
                    ]
                });
                // Now respond to request (update status to accepted)
                const request = await connectionService.respondToRequest(requestId, true, senderChannel.id, receiverChannel.id);
                // Invalidate channel cache for newly created channels
                const channelCache = container_1.container.resolve(ConnectionChannelCache_1.ConnectionChannelCache);
                channelCache.invalidateChannel(senderChannel.id);
                channelCache.invalidateChannel(receiverChannel.id);
                const welcomeMessage = `🎉 You are now connected! This channel is completely private. You can chat anonymously here.\n\n**⚠️ IMPORTANT REMINDER:**\n\`/reveal\` - Vote to reveal your true Discord identities to each other.\n\`/endchat\` - End the conversation and close this channel permanently.`;
                await receiverChannel.send(welcomeMessage);
                await senderChannel.send(welcomeMessage);
                await interaction.editReply(`Request accepted! Check out <#${receiverChannel.id}>`);
                // Send DM to the sender to notify them
                try {
                    const senderUser = await interaction.client.users.fetch(request.senderDiscordId);
                    const acceptedEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle('✅ Request Accepted!')
                        .setColor(0x00ff00)
                        .setDescription(`Your connection request was accepted! A new private room has been created for you.`)
                        .addFields({ name: 'Go to Chat', value: `<#${senderChannel.id}>` })
                        .setFooter({ text: 'Enjoy your chat!' });
                    await senderUser.send({ embeds: [acceptedEmbed] });
                }
                catch (dmError) {
                    logger_1.logger.warn({ err: dmError, senderId: existingRequest.senderDiscordId }, 'Could not send acceptance DM to sender');
                }
            }
            catch (error) {
                logger_1.logger.error({ err: error, requestId }, 'Error accepting connection request');
                await interaction.editReply(error.message || 'Error accepting request.');
            }
        }
        else if (customId.startsWith('reject_')) {
            const requestId = customId.substring('reject_'.length);
            await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
            try {
                await connectionService.respondToRequest(requestId, false);
                await interaction.editReply('Request rejected.');
            }
            catch (error) {
                await interaction.editReply(error.message || 'Error rejecting request.');
            }
        }
    }
};
exports.InteractionCreateEvent = InteractionCreateEvent;
exports.InteractionCreateEvent = InteractionCreateEvent = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('DiscordManager')),
    __metadata("design:paramtypes", [DiscordManager_1.DiscordManager])
], InteractionCreateEvent);
