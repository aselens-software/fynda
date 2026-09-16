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
exports.MatchingService = void 0;
const tsyringe_1 = require("tsyringe");
let MatchingService = class MatchingService {
    userRepository;
    connectionRepository;
    constructor(userRepository, connectionRepository) {
        this.userRepository = userRepository;
        this.connectionRepository = connectionRepository;
    }
    async getDiscoverableProfiles(discordId, limit = 5) {
        const currentUser = await this.userRepository.findByDiscordId(discordId);
        if (!currentUser || !currentUser.isDiscoverable) {
            throw new Error('You must setup your profile and be discoverable to find others.');
        }
        // Get users we have already interacted with (so we don't see them again)
        const interactedUserIds = await this.connectionRepository.getInteractedUserIds(discordId);
        const excludedIds = [...interactedUserIds, discordId]; // Add self to excluded without mutating original
        // Fetch potential matches from DB
        // In a real huge production app, we would use Redis or Aggregation Pipeline here to sort by score.
        // For now, we fetch a batch and sort in memory.
        const candidates = await this.userRepository.findDiscoverableUsers(excludedIds, 50);
        const scoredCandidates = candidates.map(candidate => this.calculateCompatibility(currentUser, candidate));
        // Sort descending by score and return top N
        scoredCandidates.sort((a, b) => b.score - a.score);
        return scoredCandidates.slice(0, limit);
    }
    calculateCompatibility(me, them) {
        let score = 0;
        const sharedInterests = me.profile.interests.filter(i => them.profile.interests.includes(i));
        const sharedLanguages = me.profile.languages.filter(l => them.profile.languages.includes(l));
        const sharedLookingFor = me.profile.lookingFor.filter(lf => them.profile.lookingFor.includes(lf));
        // Base score from shared intents (crucial for matching)
        score += sharedLookingFor.length * 20;
        // Score from languages
        score += sharedLanguages.length * 10;
        // Score from interests
        score += sharedInterests.length * 5;
        // Timezone/Activity overlap (basic check)
        const myStart = me.profile.activityTime.startHour;
        const theirStart = them.profile.activityTime.startHour;
        if (Math.abs(myStart - theirStart) <= 4) {
            score += 10;
        }
        return {
            user: them,
            score: Math.min(score, 100), // Cap at 100%
            sharedInterests,
            sharedLanguages
        };
    }
};
exports.MatchingService = MatchingService;
exports.MatchingService = MatchingService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRepository')),
    __param(1, (0, tsyringe_1.inject)('IConnectionRepository')),
    __metadata("design:paramtypes", [Object, Object])
], MatchingService);
