"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoConnectionRepository = void 0;
const tsyringe_1 = require("tsyringe");
const ConnectionStatus_1 = require("../../../domain/enums/ConnectionStatus");
const ConnectionRequest_1 = require("../../../domain/entities/ConnectionRequest");
const ConnectionModel_1 = require("../models/ConnectionModel");
let MongoConnectionRepository = class MongoConnectionRepository {
    mapToDomain(doc) {
        return new ConnectionRequest_1.ConnectionRequest(doc._id.toString(), doc.senderDiscordId, doc.receiverDiscordId, doc.status, doc.createdAt, doc.updatedAt, doc.senderGuildId, doc.senderChannelId, doc.receiverChannelId, doc.revealedUsers || []);
    }
    async save(connection) {
        try {
            const doc = new ConnectionModel_1.ConnectionModel({
                senderDiscordId: connection.senderDiscordId,
                receiverDiscordId: connection.receiverDiscordId,
                status: connection.status,
                senderGuildId: connection.senderGuildId,
                senderChannelId: connection.senderChannelId,
                receiverChannelId: connection.receiverChannelId,
                revealedUsers: connection.revealedUsers,
            });
            const savedDoc = await doc.save();
            return this.mapToDomain(savedDoc);
        }
        catch (error) {
            if (error.code === 11000) {
                throw new Error('A connection or request already exists between these users.');
            }
            throw error;
        }
    }
    async update(connection) {
        const doc = await ConnectionModel_1.ConnectionModel.findByIdAndUpdate(connection.id, {
            $set: {
                status: connection.status,
                senderChannelId: connection.senderChannelId,
                receiverChannelId: connection.receiverChannelId,
                revealedUsers: connection.revealedUsers,
            },
        }, { returnDocument: 'after' }).exec();
        if (!doc)
            throw new Error('Connection not found for update');
        return this.mapToDomain(doc);
    }
    async findById(id) {
        const doc = await ConnectionModel_1.ConnectionModel.findById(id).exec();
        return doc ? this.mapToDomain(doc) : null;
    }
    async findByUsers(userA, userB) {
        const doc = await ConnectionModel_1.ConnectionModel.findOne({
            $or: [
                { senderDiscordId: userA, receiverDiscordId: userB },
                { senderDiscordId: userB, receiverDiscordId: userA }
            ]
        }).exec();
        return doc ? this.mapToDomain(doc) : null;
    }
    async findByChannelId(channelId) {
        const doc = await ConnectionModel_1.ConnectionModel.findOne({
            $or: [{ senderChannelId: channelId }, { receiverChannelId: channelId }]
        }).exec();
        return doc ? this.mapToDomain(doc) : null;
    }
    async findPendingRequests(discordId) {
        const docs = await ConnectionModel_1.ConnectionModel.find({
            receiverDiscordId: discordId,
            status: ConnectionStatus_1.ConnectionStatus.PENDING
        }).exec();
        return docs.map(doc => this.mapToDomain(doc));
    }
    async getInteractedUserIds(discordId) {
        const docs = await ConnectionModel_1.ConnectionModel.find({
            $or: [{ senderDiscordId: discordId }, { receiverDiscordId: discordId }]
        }).select('senderDiscordId receiverDiscordId').exec();
        const ids = new Set();
        docs.forEach(doc => {
            if (doc.senderDiscordId !== discordId)
                ids.add(doc.senderDiscordId);
            if (doc.receiverDiscordId !== discordId)
                ids.add(doc.receiverDiscordId);
        });
        return Array.from(ids);
    }
};
exports.MongoConnectionRepository = MongoConnectionRepository;
exports.MongoConnectionRepository = MongoConnectionRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoConnectionRepository);
