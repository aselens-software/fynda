"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionRequest = void 0;
const ConnectionStatus_1 = require("../enums/ConnectionStatus");
class ConnectionRequest {
    id;
    senderDiscordId;
    receiverDiscordId;
    status;
    createdAt;
    updatedAt;
    senderGuildId;
    senderChannelId;
    receiverChannelId;
    revealedUsers;
    constructor(id, senderDiscordId, receiverDiscordId, status, createdAt, updatedAt, senderGuildId, senderChannelId, receiverChannelId, revealedUsers = []) {
        this.id = id;
        this.senderDiscordId = senderDiscordId;
        this.receiverDiscordId = receiverDiscordId;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.senderGuildId = senderGuildId;
        this.senderChannelId = senderChannelId;
        this.receiverChannelId = receiverChannelId;
        this.revealedUsers = revealedUsers;
    }
    accept(senderChannel, receiverChannel) {
        this.status = ConnectionStatus_1.ConnectionStatus.ACCEPTED;
        this.senderChannelId = senderChannel;
        this.receiverChannelId = receiverChannel;
        this.updatedAt = new Date();
    }
    reject() {
        this.status = ConnectionStatus_1.ConnectionStatus.REJECTED;
        this.updatedAt = new Date();
    }
    end() {
        this.status = ConnectionStatus_1.ConnectionStatus.ENDED;
        this.updatedAt = new Date();
    }
    reveal(discordId) {
        if (!this.revealedUsers.includes(discordId)) {
            this.revealedUsers.push(discordId);
            this.updatedAt = new Date();
        }
        if (this.revealedUsers.length >= 2) {
            this.status = ConnectionStatus_1.ConnectionStatus.REVEALED;
            return true; // Both revealed
        }
        return false; // Only one revealed
    }
}
exports.ConnectionRequest = ConnectionRequest;
