import { injectable } from 'tsyringe';
import { IUserRepository } from '../../../application/interfaces/IUserRepository';
import { User } from '../../../domain/entities/User';
import { UserModel, IUserDocument } from '../models/UserModel';

@injectable()
export class MongoUserRepository implements IUserRepository {
  private mapToDomain(doc: IUserDocument): User {
    return new User(
      doc._id.toString(),
      doc.discordId,
      doc.isDiscoverable,
      doc.profile,
      doc.createdAt,
      doc.updatedAt
    );
  }

  async findByDiscordId(discordId: string): Promise<User | null> {
    const doc = await UserModel.findOne({ discordId }).exec();
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async save(user: User): Promise<User> {
    const doc = new UserModel({
      discordId: user.discordId,
      isDiscoverable: user.isDiscoverable,
      profile: user.profile,
    });
    const savedDoc = await doc.save();
    return this.mapToDomain(savedDoc);
  }

  async update(user: User): Promise<User> {
    const doc = await UserModel.findOneAndUpdate(
      { discordId: user.discordId },
      {
        $set: {
          isDiscoverable: user.isDiscoverable,
          profile: user.profile,
        },
      },
      { returnDocument: 'after' }
    ).exec();

    if (!doc) throw new Error('User not found for update');
    return this.mapToDomain(doc);
  }

  async findDiscoverableUsers(excludeDiscordIds: string[], limit: number = 10): Promise<User[]> {
    const docs = await UserModel.aggregate<IUserDocument>([
      {
        $match: {
          isDiscoverable: true,
          discordId: { $nin: excludeDiscordIds },
        },
      },
      { $sample: { size: limit } },
    ]).exec();

    return docs.map((doc) => this.mapToDomain(doc as IUserDocument));
  }
}
