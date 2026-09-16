import { DiscoveryIntent } from '../enums/DiscoveryIntent';

export interface UserProfile {
  languages: string[];
  interests: string[];
  hobbies: string[];
  games: string[];
  activityTime: {
    startHour: number; // 0-23 (UTC)
    endHour: number; // 0-23 (UTC)
  };
  lookingFor: DiscoveryIntent[];
  bio?: string;
}
