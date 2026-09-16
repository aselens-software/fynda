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
exports.ProfileCommand = void 0;
const discord_js_1 = require("discord.js");
const tsyringe_1 = require("tsyringe");
const ProfileService_1 = require("../../application/services/ProfileService");
const logger_1 = require("../../core/logger/logger");
let ProfileCommand = class ProfileCommand {
    profileService;
    data = new discord_js_1.SlashCommandBuilder()
        .setName('profile')
        .setDescription('View and manage your Fynda discovery profile.');
    constructor(profileService) {
        this.profileService = profileService;
    }
    async execute(interaction) {
        await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
        try {
            const user = await this.profileService.getOrCreateUser(interaction.user.id);
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle('Your Fynda Profile')
                .setColor(user.isDiscoverable ? 0x00ff00 : 0xff0000)
                .setDescription('This profile is completely anonymous in the discovery pool.')
                .addFields({ name: 'Status', value: user.isDiscoverable ? '🟢 Discoverable' : '🔴 Hidden', inline: true }, { name: 'Looking For', value: user.profile.lookingFor.length > 0 ? user.profile.lookingFor.join(', ') : 'None selected', inline: true }, { name: 'Languages', value: user.profile.languages.length > 0 ? user.profile.languages.join(', ') : 'None selected', inline: false }, { name: 'Interests', value: user.profile.interests.length > 0 ? user.profile.interests.join(', ') : 'None selected', inline: false }, { name: 'Bio', value: user.profile.bio || 'No bio set.', inline: false })
                .setFooter({ text: 'Use buttons below to edit (Coming Soon)' });
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            logger_1.logger.error({ err: error, userId: interaction.user.id }, 'Error fetching profile');
            await interaction.editReply('An error occurred while fetching your profile.');
        }
    }
};
exports.ProfileCommand = ProfileCommand;
exports.ProfileCommand = ProfileCommand = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(ProfileService_1.ProfileService)),
    __metadata("design:paramtypes", [ProfileService_1.ProfileService])
], ProfileCommand);
