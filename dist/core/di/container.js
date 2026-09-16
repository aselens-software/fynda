"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
const tsyringe_1 = require("tsyringe");
Object.defineProperty(exports, "container", { enumerable: true, get: function () { return tsyringe_1.container; } });
const MongoUserRepository_1 = require("../../infrastructure/database/repositories/MongoUserRepository");
const ProfileService_1 = require("../../application/services/ProfileService");
const MongoConnectionRepository_1 = require("../../infrastructure/database/repositories/MongoConnectionRepository");
const MatchingService_1 = require("../../application/services/MatchingService");
const ConnectionService_1 = require("../../application/services/ConnectionService");
const ConnectionChannelCache_1 = require("../../infrastructure/cache/ConnectionChannelCache");
// Using 'IUserRepository' string token because TS interfaces don't exist at runtime
tsyringe_1.container.register('IUserRepository', {
    useClass: MongoUserRepository_1.MongoUserRepository,
});
tsyringe_1.container.register('IConnectionRepository', {
    useClass: MongoConnectionRepository_1.MongoConnectionRepository,
});
// Register singleton cache for message relay performance
tsyringe_1.container.registerSingleton(ConnectionChannelCache_1.ConnectionChannelCache, ConnectionChannelCache_1.ConnectionChannelCache);
// Register Services
tsyringe_1.container.register(ProfileService_1.ProfileService, {
    useClass: ProfileService_1.ProfileService,
});
tsyringe_1.container.register(MatchingService_1.MatchingService, {
    useClass: MatchingService_1.MatchingService,
});
tsyringe_1.container.register(ConnectionService_1.ConnectionService, {
    useClass: ConnectionService_1.ConnectionService,
});
// Presentation layer (Discord)
const DiscordManager_1 = require("../discord/DiscordManager");
// We register DiscordManager as a singleton so it can hold the state of registered commands
tsyringe_1.container.registerSingleton('DiscordManager', DiscordManager_1.DiscordManager);
