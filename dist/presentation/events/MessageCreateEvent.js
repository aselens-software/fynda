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
exports.MessageCreateEvent = void 0;
const discord_js_1 = require("discord.js");
const tsyringe_1 = require("tsyringe");
const ConnectionService_1 = require("../../application/services/ConnectionService");
const ConnectionChannelCache_1 = require("../../infrastructure/cache/ConnectionChannelCache");
const logger_1 = require("../../core/logger/logger");
let MessageCreateEvent = class MessageCreateEvent {
    connectionService;
    channelCache;
    name = discord_js_1.Events.MessageCreate;
    constructor(connectionService, channelCache) {
        this.connectionService = connectionService;
        this.channelCache = channelCache;
    }
    async execute(message) {
        if (message.author.bot)
            return;
        if (!message.guildId)
            return;
        // Fast path: check negative cache first (most channels are NOT connection channels)
        if (this.channelCache.isMiss(message.channelId))
            return;
        // Check in-memory cache before hitting the DB
        let request = this.channelCache.get(message.channelId);
        if (!request) {
            // Cache miss — query DB
            request = (await this.connectionService.getRequestByChannelId(message.channelId)) ?? undefined;
            if (!request) {
                // Not a connection channel — cache the miss to avoid future DB lookups
                this.channelCache.setMiss(message.channelId);
                return;
            }
            // Cache the hit for future messages
            this.channelCache.set(request);
        }
        // Relay the message to the other channel
        const isSender = request.senderChannelId === message.channelId;
        const targetChannelId = isSender ? request.receiverChannelId : request.senderChannelId;
        if (!targetChannelId)
            return;
        try {
            // Use cache first, then fetch from API only if needed
            const targetChannel = message.client.channels.cache.get(targetChannelId)
                ?? await message.client.channels.fetch(targetChannelId);
            if (targetChannel && targetChannel.isTextBased() && 'send' in targetChannel) {
                const prefix = `**Anon:** `;
                const files = Array.from(message.attachments.values()).map(a => a.url);
                const textContent = message.content ? message.content : (files.length > 0 ? '' : '*[Boş/Okunamayan Mesaj]*');
                await targetChannel.send({
                    content: prefix + textContent,
                    files: files.length > 0 ? files : undefined
                });
            }
        }
        catch (error) {
            logger_1.logger.error({ err: error, channelId: message.channelId }, 'Failed to relay message');
        }
    }
};
exports.MessageCreateEvent = MessageCreateEvent;
exports.MessageCreateEvent = MessageCreateEvent = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(ConnectionService_1.ConnectionService)),
    __param(1, (0, tsyringe_1.inject)(ConnectionChannelCache_1.ConnectionChannelCache)),
    __metadata("design:paramtypes", [ConnectionService_1.ConnectionService,
        ConnectionChannelCache_1.ConnectionChannelCache])
], MessageCreateEvent);
