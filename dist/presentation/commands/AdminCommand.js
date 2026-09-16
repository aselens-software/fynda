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
exports.AdminCommand = void 0;
const discord_js_1 = require("discord.js");
const tsyringe_1 = require("tsyringe");
const DiscordManager_1 = require("../../core/discord/DiscordManager");
let AdminCommand = class AdminCommand {
    discordManager;
    data = new discord_js_1.SlashCommandBuilder()
        .setName('admin')
        .setDescription('Admin operations (Owner only)')
        .addSubcommand(subcmd => subcmd.setName('sync')
        .setDescription('Sync slash commands to Discord'))
        .addSubcommand(subcmd => subcmd.setName('reboot')
        .setDescription('Restart the bot process'));
    OWNER_ID = '380080470555230209';
    constructor(discordManager) {
        this.discordManager = discordManager;
    }
    async execute(interaction) {
        if (interaction.user.id !== this.OWNER_ID) {
            await interaction.reply({ content: 'You do not have permission to use this command.', flags: discord_js_1.MessageFlags.Ephemeral });
            return;
        }
        const subcmd = interaction.options.getSubcommand();
        await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
        try {
            if (subcmd === 'sync') {
                await this.discordManager.deployCommands();
                await interaction.editReply('Successfully synchronized all application commands.');
            }
            else if (subcmd === 'reboot') {
                await interaction.editReply('Rebooting... The process manager (Docker) will restart the bot.');
                process.exit(0);
            }
        }
        catch (error) {
            console.error(error);
            await interaction.editReply('An error occurred during admin operation.');
        }
    }
};
exports.AdminCommand = AdminCommand;
exports.AdminCommand = AdminCommand = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('DiscordManager')),
    __metadata("design:paramtypes", [DiscordManager_1.DiscordManager])
], AdminCommand);
