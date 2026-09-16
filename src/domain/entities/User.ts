import { UserProfile } from './Profile';

export class User {
  constructor(
    public readonly id: string, // Internal ID or MongoDB ObjectId string
    public readonly discordId: string,
    public isDiscoverable: boolean,
    public profile: UserProfile,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  public updateProfile(newProfile: Partial<UserProfile>): void {
    this.profile = { ...this.profile, ...newProfile };
    this.updatedAt = new Date();
  }

  public toggleDiscoverability(status: boolean): void {
    this.isDiscoverable = status;
    this.updatedAt = new Date();
  }
}
