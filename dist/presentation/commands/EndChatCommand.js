"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndChatCommand = void 0;
const discord_js_1 = require("discord.js");
const tsyringe_1 = require("tsyringe");
const ConnectionService_1 = require("../../application/services/ConnectionService");
const logger_1 = require("../../core/logger/logger");
let EndChatCommand = class EndChatCommand {
    connectionService;
    data = new discord_js_1.SlashCommandBuilder()
        .setName('endchat')
        .setDescription('End this private chat and delete the channel.');
    constructor(connectionService) {
        this.connectionService = connectionService;
    }
    async execute(interaction) {
        await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
        try {
            const request = await this.connectionService.endChat(interaction.channelId);
            const otherChannelId = request.senderChannelId === interaction.channelId ? request.receiverChannelId : request.senderChannelId;
            const otherChannel = otherChannelId ? await interaction.client.channels.fetch(otherChannelId) : null;
            await interaction.editReply('Chat ended. Deleting channel in 5 seconds...');
            if (otherChannel && otherChannel.isTextBased() && 'send' in otherChannel) {
                await otherChannel.send('The other user ended the chat. Deleting channel in 5 seconds...');
            }
            setTimeout(async () => {
                try {
                    if (interaction.channel) {
                        await interaction.channel.delete('User ended the chat.');
                    }
                    if (otherChannel) {
                        await otherChannel.delete('Other user ended the chat.');
                    }
                }
                catch (e) {
                    logger_1.logger.error({ err: e }, 'Failed to delete channel');
                }
            }, 5000);
        }
        catch (error) {
            await interaction.editReply(error.message || 'Failed to end chat.');
        }
    }
};
exports.EndChatCommand = EndChatCommand;
exports.EndChatCommand = EndChatCommand = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(ConnectionService_1.ConnectionService)),
    __metadata("design:paramtypes", [ConnectionService_1.ConnectionService])
], EndChatCommand);
