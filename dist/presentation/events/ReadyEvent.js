"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadyEvent = void 0;
const discord_js_1 = require("discord.js");
const tsyringe_1 = require("tsyringe");
const logger_1 = require("../../core/logger/logger");
let ReadyEvent = class ReadyEvent {
    name = discord_js_1.Events.ClientReady;
    once = true;
    execute(client) {
        logger_1.logger.info(`Discord client is ready! Logged in as ${client.user?.tag}`);
        client.user?.setActivity('/discover - Find friends', { type: discord_js_1.ActivityType.Listening });
    }
};
exports.ReadyEvent = ReadyEvent;
exports.ReadyEvent = ReadyEvent = __decorate([
    (0, tsyringe_1.injectable)()
], ReadyEvent);
