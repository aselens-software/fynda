"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    id;
    discordId;
    isDiscoverable;
    profile;
    createdAt;
    updatedAt;
    constructor(id, // Internal ID or MongoDB ObjectId string
    discordId, isDiscoverable, profile, createdAt, updatedAt) {
        this.id = id;
        this.discordId = discordId;
        this.isDiscoverable = isDiscoverable;
        this.profile = profile;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    updateProfile(newProfile) {
        this.profile = { ...this.profile, ...newProfile };
        this.updatedAt = new Date();
    }
    toggleDiscoverability(status) {
        this.isDiscoverable = status;
        this.updatedAt = new Date();
    }
}
exports.User = User;
