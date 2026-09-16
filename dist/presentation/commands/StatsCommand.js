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
exports.StatsCommand = void 0;
const discord_js_1 = require("discord.js");
const tsyringe_1 = require("tsyringe");
const ProfileService_1 = require("../../application/services/ProfileService");
let StatsCommand = class StatsCommand {
    profileService;
    data = new discord_js_1.SlashCommandBuilder()
        .setName('stats')
        .setDescription('View live statistics about Fynda.');
    constructor(profileService) {
        this.profileService = profileService;
    }
    async execute(interaction) {
        // Total users across all servers the bot is in
        const totalServerMembers = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const serverCount = interaction.client.guilds.cache.size;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('📊 Fynda Statistics')
            .setColor(0x00aaff)
            .addFields({ name: 'Total Reach', value: `${totalServerMembers} users across ${serverCount} servers`, inline: false }, { name: 'Bot Ping', value: `${interaction.client.ws.ping}ms`, inline: false })
            .setFooter({ text: 'Growing bigger every day!' });
        await interaction.reply({ embeds: [embed], flags: discord_js_1.MessageFlags.Ephemeral });
    }
};
exports.StatsCommand = StatsCommand;
exports.StatsCommand = StatsCommand = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(ProfileService_1.ProfileService)),
    __metadata("design:paramtypes", [ProfileService_1.ProfileService])
], StatsCommand);
