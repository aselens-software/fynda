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
exports.EditProfileCommand = void 0;
const discord_js_1 = require("discord.js");
const tsyringe_1 = require("tsyringe");
const ProfileService_1 = require("../../application/services/ProfileService");
let EditProfileCommand = class EditProfileCommand {
    profileService;
    data = new discord_js_1.SlashCommandBuilder()
        .setName('editprofile')
        .setDescription('Edit your Fynda profile (Languages, Interests, Bio)');
    constructor(profileService) {
        this.profileService = profileService;
    }
    async execute(interaction) {
        const user = await this.profileService.getOrCreateUser(interaction.user.id);
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId('edit_profile_modal')
            .setTitle('Edit Your Profile');
        const languagesInput = new discord_js_1.TextInputBuilder()
            .setCustomId('languages')
            .setLabel('Languages (comma separated)')
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setPlaceholder('English, Turkish, Spanish')
            .setValue(user.profile.languages.join(', '))
            .setRequired(false);
        const interestsInput = new discord_js_1.TextInputBuilder()
            .setCustomId('interests')
            .setLabel('Interests (comma separated)')
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setPlaceholder('Coding, Anime, Music')
            .setValue(user.profile.interests.join(', '))
            .setRequired(false);
        const lookingForInput = new discord_js_1.TextInputBuilder()
            .setCustomId('lookingFor')
            .setLabel('Looking For (FRIENDSHIP, GAMING, etc)')
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setPlaceholder('FRIENDSHIP, GAMING, PROGRAMMING')
            .setValue(user.profile.lookingFor.join(', '))
            .setRequired(false);
        const bioInput = new discord_js_1.TextInputBuilder()
            .setCustomId('bio')
            .setLabel('Short Bio')
            .setStyle(discord_js_1.TextInputStyle.Paragraph)
            .setPlaceholder('Hi! I love writing code and playing games.')
            .setValue(user.profile.bio || '')
            .setRequired(false)
            .setMaxLength(500);
        modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(languagesInput), new discord_js_1.ActionRowBuilder().addComponents(interestsInput), new discord_js_1.ActionRowBuilder().addComponents(lookingForInput), new discord_js_1.ActionRowBuilder().addComponents(bioInput));
        await interaction.showModal(modal);
    }
};
exports.EditProfileCommand = EditProfileCommand;
exports.EditProfileCommand = EditProfileCommand = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(ProfileService_1.ProfileService)),
    __metadata("design:paramtypes", [ProfileService_1.ProfileService])
], EditProfileCommand);
