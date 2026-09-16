"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpCommand = void 0;
const discord_js_1 = require("discord.js");
const tsyringe_1 = require("tsyringe");
let HelpCommand = class HelpCommand {
    data = new discord_js_1.SlashCommandBuilder()
        .setName('help')
        .setDescription('List all available Fynda commands and how to use them.');
    async execute(interaction) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Fynda Help & Commands')
            .setColor(0x00ff00)
            .setDescription('Welcome to Fynda! Here is how you can use the bot:')
            .addFields({ name: '📝 Profile Management', value: '`/editprofile` - Setup or edit your profile (bio, languages, interests)\n`/visibility` - Turn your discoverability ON or OFF' }, { name: '🔍 Matching & Discovery', value: '`/discover` - Find new potential friends anonymously\n`/requests` - View and accept/reject your pending connection requests' }, { name: '💬 Private Chats', value: '`/reveal` - Vote to reveal your true identity in a private chat\n`/endchat` - End a private chat and close the channel' }, { name: '🛠️ Other', value: '`/feedback` - Send feedback or report an issue directly to the developers' }, { name: 'How it works', value: '1. Setup profile\n2. Turn on visibility\n3. Use /discover to send requests\n4. Accept requests in /requests to open a private, anonymous chat channel!' })
            .setFooter({ text: 'Enjoy meeting new people on Fynda!' });
        await interaction.reply({ embeds: [embed], flags: discord_js_1.MessageFlags.Ephemeral });
    }
};
exports.HelpCommand = HelpCommand;
exports.HelpCommand = HelpCommand = __decorate([
    (0, tsyringe_1.injectable)()
], HelpCommand);
