"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackCommand = void 0;
const discord_js_1 = require("discord.js");
const tsyringe_1 = require("tsyringe");
const env_config_1 = require("../../core/config/env.config");
const logger_1 = require("../../core/logger/logger");
let FeedbackCommand = class FeedbackCommand {
    data = new discord_js_1.SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Send feedback to the developers.')
        .addStringOption(option => option
        .setName('message')
        .setDescription('Your feedback message')
        .setRequired(true));
    async execute(interaction) {
        await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
        const webhookUrl = env_config_1.config.FEEDBACK_WEBHOOK_URL;
        if (!webhookUrl) {
            await interaction.editReply('Feedback system is currently unavailable. Please try again later.');
            return;
        }
        const message = interaction.options.getString('message', true);
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: `**New Feedback from <@${interaction.user.id}> (${interaction.user.username})**\n> ${message}`
                }),
            });
            if (!response.ok) {
                throw new Error(`Webhook returned ${response.status} ${response.statusText}`);
            }
            await interaction.editReply('Thank you for your feedback! It has been successfully sent to the developers.');
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Failed to send feedback to webhook');
            await interaction.editReply('An error occurred while sending your feedback. Please try again later.');
        }
    }
};
exports.FeedbackCommand = FeedbackCommand;
exports.FeedbackCommand = FeedbackCommand = __decorate([
    (0, tsyringe_1.injectable)()
], FeedbackCommand);
