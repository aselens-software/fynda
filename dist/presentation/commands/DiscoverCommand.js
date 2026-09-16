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
exports.DiscoverCommand = void 0;
const discord_js_1 = require("discord.js");
const tsyringe_1 = require("tsyringe");
const TopggUtil_1 = require("../../core/utils/TopggUtil");
const MatchingService_1 = require("../../application/services/MatchingService");
const ConnectionService_1 = require("../../application/services/ConnectionService");
const logger_1 = require("../../core/logger/logger");
let DiscoverCommand = class DiscoverCommand {
    matchingService;
    connectionService;
    data = new discord_js_1.SlashCommandBuilder()
        .setName('discover')
        .setDescription('Find new potential connections anonymously!');
    constructor(matchingService, connectionService) {
        this.matchingService = matchingService;
        this.connectionService = connectionService;
    }
    async execute(interaction) {
        await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
        try {
            const hasVoted = await TopggUtil_1.TopggUtil.hasVoted(interaction.user.id);
            if (!hasVoted) {
                await interaction.editReply('🔒 **You must upvote the bot to use this command!**\n\nPlease vote for Fynda on Top.gg here: https://top.gg/bot/1530886185009021019/vote\n*(It may take a minute for the vote to register)*');
                return;
            }
            const matches = await this.matchingService.getDiscoverableProfiles(interaction.user.id, 1);
            if (matches.length === 0) {
                await interaction.editReply('No new profiles found right now. Check back later or update your profile to increase matches!');
                return;
            }
            const match = matches[0];
            const targetUser = match.user;
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle('🔎 New Potential Connection')
                .setColor(0x00aaff)
                .setDescription(`We found a profile with **${match.score}%** compatibility!`)
                .addFields({ name: 'Looking For', value: targetUser.profile.lookingFor.join(', ') || 'Unspecified', inline: true }, { name: 'Shared Languages', value: match.sharedLanguages.join(', ') || 'None', inline: true }, { name: 'Shared Interests', value: match.sharedInterests.join(', ') || 'None', inline: false }, { name: 'Bio', value: targetUser.profile.bio || '*This user has no bio.*', inline: false })
                .setFooter({ text: 'This profile is fully anonymous.' });
            const row = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId(`connect_${targetUser.discordId}`)
                .setLabel('Send Request')
                .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
                .setCustomId(`skip_${targetUser.discordId}`)
                .setLabel('Skip')
                .setStyle(discord_js_1.ButtonStyle.Secondary));
            await interaction.editReply({ embeds: [embed], components: [row] });
        }
        catch (error) {
            logger_1.logger.error({ err: error, userId: interaction.user.id }, 'Error during discovery');
            await interaction.editReply(error.message || 'An error occurred during discovery.');
        }
    }
};
exports.DiscoverCommand = DiscoverCommand;
exports.DiscoverCommand = DiscoverCommand = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(MatchingService_1.MatchingService)),
    __param(1, (0, tsyringe_1.inject)(ConnectionService_1.ConnectionService)),
    __metadata("design:paramtypes", [MatchingService_1.MatchingService,
        ConnectionService_1.ConnectionService])
], DiscoverCommand);
