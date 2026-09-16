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
exports.VisibilityCommand = void 0;
const discord_js_1 = require("discord.js");
const tsyringe_1 = require("tsyringe");
const ProfileService_1 = require("../../application/services/ProfileService");
let VisibilityCommand = class VisibilityCommand {
    profileService;
    data = new discord_js_1.SlashCommandBuilder()
        .setName('visibility')
        .setDescription('Toggle your profile visibility in the discovery pool.')
        .addBooleanOption(option => option.setName('discoverable')
        .setDescription('Set to true to be found by others, false to hide.')
        .setRequired(true));
    constructor(profileService) {
        this.profileService = profileService;
    }
    async execute(interaction) {
        await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
        const isDiscoverable = interaction.options.getBoolean('discoverable', true);
        try {
            await this.profileService.toggleVisibility(interaction.user.id, isDiscoverable);
            await interaction.editReply(`Your profile is now **${isDiscoverable ? 'Visible 🟢' : 'Hidden 🔴'}** in the discovery pool.`);
        }
        catch (error) {
            await interaction.editReply(error.message || 'An error occurred.');
        }
    }
};
exports.VisibilityCommand = VisibilityCommand;
exports.VisibilityCommand = VisibilityCommand = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(ProfileService_1.ProfileService)),
    __metadata("design:paramtypes", [ProfileService_1.ProfileService])
], VisibilityCommand);
