"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoUserRepository = void 0;
const tsyringe_1 = require("tsyringe");
const User_1 = require("../../../domain/entities/User");
const UserModel_1 = require("../models/UserModel");
let MongoUserRepository = class MongoUserRepository {
    mapToDomain(doc) {
        return new User_1.User(doc._id.toString(), doc.discordId, doc.isDiscoverable, doc.profile, doc.createdAt, doc.updatedAt);
    }
    async findByDiscordId(discordId) {
        const doc = await UserModel_1.UserModel.findOne({ discordId }).exec();
        if (!doc)
            return null;
        return this.mapToDomain(doc);
    }
    async save(user) {
        const doc = new UserModel_1.UserModel({
            discordId: user.discordId,
            isDiscoverable: user.isDiscoverable,
            profile: user.profile,
        });
        const savedDoc = await doc.save();
        return this.mapToDomain(savedDoc);
    }
    async update(user) {
        const doc = await UserModel_1.UserModel.findOneAndUpdate({ discordId: user.discordId }, {
            $set: {
                isDiscoverable: user.isDiscoverable,
                profile: user.profile,
            },
        }, { returnDocument: 'after' }).exec();
        if (!doc)
            throw new Error('User not found for update');
        return this.mapToDomain(doc);
    }
    async findDiscoverableUsers(excludeDiscordIds, limit = 10) {
        const docs = await UserModel_1.UserModel.aggregate([
            {
                $match: {
                    isDiscoverable: true,
                    discordId: { $nin: excludeDiscordIds },
                },
            },
            { $sample: { size: limit } },
        ]).exec();
        return docs.map((doc) => this.mapToDomain(doc));
    }
};
exports.MongoUserRepository = MongoUserRepository;
exports.MongoUserRepository = MongoUserRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoUserRepository);
