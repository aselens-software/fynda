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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordManager = void 0;
const discord_js_1 = require("discord.js");
const tsyringe_1 = require("tsyringe");
const env_config_1 = require("../config/env.config");
const logger_1 = require("../logger/logger");
let DiscordManager = class DiscordManager {
    commands = new discord_js_1.Collection();
    rest = new discord_js_1.REST({ version: '10' }).setToken(env_config_1.config.DISCORD_BOT_TOKEN);
    constructor() { }
    registerCommand(command) {
        this.commands.set(command.data.name, command);
    }
    registerEvent(client, event) {
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        }
        else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
    getCommand(name) {
        return this.commands.get(name);
    }
    async deployCommands() {
        try {
            logger_1.logger.info(`Started refreshing ${this.commands.size} application (/) commands.`);
            const commandData = this.commands.map(cmd => cmd.data.toJSON());
            await this.rest.put(discord_js_1.Routes.applicationCommands(env_config_1.config.DISCORD_CLIENT_ID), { body: commandData });
            logger_1.logger.info('Successfully reloaded application (/) commands.');
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Failed to deploy application commands');
        }
    }
};
exports.DiscordManager = DiscordManager;
exports.DiscordManager = DiscordManager = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], DiscordManager);
