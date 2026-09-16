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
exports.RevealCommand = void 0;
const discord_js_1 = require("discord.js");
const tsyringe_1 = require("tsyringe");
const ConnectionService_1 = require("../../application/services/ConnectionService");
let RevealCommand = class RevealCommand {
    connectionService;
    data = new discord_js_1.SlashCommandBuilder()
        .setName('reveal')
        .setDescription('Vote to reveal your identity. If both vote yes, identities are shared!');
    constructor(connectionService) {
        this.connectionService = connectionService;
    }
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const { bothRevealed, request } = await this.connectionService.handleReveal(interaction.channelId, interaction.user.id);
            const otherChannelId = request.senderChannelId === interaction.channelId ? request.receiverChannelId : request.senderChannelId;
            const otherChannel = otherChannelId ? await interaction.client.channels.fetch(otherChannelId) : null;
            if (bothRevealed) {
                // Find both users
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle('🎉 Identities Revealed! 🎉')
                    .setColor(0xffd700)
                    .setDescription(`Both users have agreed to reveal their identities!\n\nThis chat is between <@${request.senderDiscordId}> and <@${request.receiverDiscordId}>. Have fun!`);
                await interaction.editReply({ embeds: [embed] });
                if (otherChannel && otherChannel.isTextBased() && 'send' in otherChannel) {
                    await otherChannel.send({ embeds: [embed] });
                }
            }
            else {
                await interaction.editReply(`🟢 You have voted to reveal your identity! Waiting for the other person to use \`/reveal\`...`);
                if (otherChannel && otherChannel.isTextBased() && 'send' in otherChannel) {
                    await otherChannel.send(`🟢 The other user has voted to reveal their identity! Type \`/reveal\` to agree and reveal yourselves!`);
                }
            }
        }
        catch (error) {
            await interaction.editReply({ content: error.message || 'Failed to reveal identity.', flags: discord_js_1.MessageFlags.Ephemeral });
        }
    }
};
exports.RevealCommand = RevealCommand;
exports.RevealCommand = RevealCommand = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(ConnectionService_1.ConnectionService)),
    __metadata("design:paramtypes", [ConnectionService_1.ConnectionService])
], RevealCommand);
