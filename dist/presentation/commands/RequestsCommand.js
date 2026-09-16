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
exports.RequestsCommand = void 0;
const discord_js_1 = require("discord.js");
const tsyringe_1 = require("tsyringe");
const TopggUtil_1 = require("../../core/utils/TopggUtil");
const ConnectionService_1 = require("../../application/services/ConnectionService");
const ProfileService_1 = require("../../application/services/ProfileService");
const logger_1 = require("../../core/logger/logger");
let RequestsCommand = class RequestsCommand {
    connectionService;
    profileService;
    data = new discord_js_1.SlashCommandBuilder()
        .setName('requests')
        .setDescription('View your pending connection requests.');
    constructor(connectionService, profileService) {
        this.connectionService = connectionService;
        this.profileService = profileService;
    }
    async execute(interaction) {
        await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
        try {
            const hasVoted = await TopggUtil_1.TopggUtil.hasVoted(interaction.user.id);
            if (!hasVoted) {
                await interaction.editReply('🔒 **You must upvote the bot to use this command!**\n\nPlease vote for Fynda on Top.gg here: https://top.gg/bot/1530886185009021019/vote\n*(It may take a minute for the vote to register)*');
                return;
            }
            const requests = await this.connectionService.getPendingRequests(interaction.user.id);
            if (requests.length === 0) {
                await interaction.editReply('You have no pending connection requests at the moment.');
                return;
            }
            // Display the first request for simplicity, users can keep using /requests to go through them
            const request = requests[0];
            const sender = await this.profileService.getOrCreateUser(request.senderDiscordId);
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle('📬 New Connection Request')
                .setColor(0x00ff00)
                .setDescription(`Someone wants to connect with you!`)
                .addFields({ name: 'Looking For', value: sender.profile.lookingFor.join(', ') || 'Unspecified', inline: true }, { name: 'Languages', value: sender.profile.languages.join(', ') || 'None', inline: true }, { name: 'Interests', value: sender.profile.interests.join(', ') || 'None', inline: false }, { name: 'Bio', value: sender.profile.bio || '*This user has no bio.*', inline: false })
                .setFooter({ text: 'Accept to reveal identities and chat privately.' });
            const row = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId(`accept_${request.id}`)
                .setLabel('Accept & Chat')
                .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
                .setCustomId(`reject_${request.id}`)
                .setLabel('Reject')
                .setStyle(discord_js_1.ButtonStyle.Danger));
            await interaction.editReply({ embeds: [embed], components: [row] });
        }
        catch (error) {
            logger_1.logger.error({ err: error, userId: interaction.user.id }, 'Error fetching requests');
            await interaction.editReply(error.message || 'An error occurred while fetching requests.');
        }
    }
};
exports.RequestsCommand = RequestsCommand;
exports.RequestsCommand = RequestsCommand = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(ConnectionService_1.ConnectionService)),
    __param(1, (0, tsyringe_1.inject)(ProfileService_1.ProfileService)),
    __metadata("design:paramtypes", [ConnectionService_1.ConnectionService,
        ProfileService_1.ProfileService])
], RequestsCommand);
