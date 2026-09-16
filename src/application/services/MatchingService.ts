import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IConnectionRepository } from '../interfaces/IConnectionRepository';
import { User } from '../../domain/entities/User';

export interface MatchScore {
  user: User;
  score: number;
  sharedInterests: string[];
  sharedLanguages: string[];
}

@injectable()
export class MatchingService {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject('IConnectionRepository') private readonly connectionRepository: IConnectionRepository
  ) {}

  public async getDiscoverableProfiles(discordId: string, limit: number = 5): Promise<MatchScore[]> {
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

  private calculateCompatibility(me: User, them: User): MatchScore {
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
}
