import { injectable } from 'tsyringe';
import { IConnectionRepository } from '../../../application/interfaces/IConnectionRepository';
import { ConnectionStatus } from '../../../domain/enums/ConnectionStatus';
import { ConnectionRequest } from '../../../domain/entities/ConnectionRequest';
import { ConnectionModel, IConnectionDocument } from '../models/ConnectionModel';

@injectable()
export class MongoConnectionRepository implements IConnectionRepository {
  private mapToDomain(doc: IConnectionDocument): ConnectionRequest {
    return new ConnectionRequest(
      doc._id.toString(),
      doc.senderDiscordId,
      doc.receiverDiscordId,
      doc.status,
      doc.createdAt,
      doc.updatedAt,
      doc.senderGuildId,
      doc.senderChannelId,
      doc.receiverChannelId,
      doc.revealedUsers || []
    );
  }

  async save(connection: ConnectionRequest): Promise<ConnectionRequest> {
    try {
      const doc = new ConnectionModel({
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
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('A connection or request already exists between these users.');
      }
      throw error;
    }
  }

  async update(connection: ConnectionRequest): Promise<ConnectionRequest> {
    const doc = await ConnectionModel.findByIdAndUpdate(
      connection.id,
      {
        $set: {
          status: connection.status,
          senderChannelId: connection.senderChannelId,
          receiverChannelId: connection.receiverChannelId,
          revealedUsers: connection.revealedUsers,
        },
      },
      { returnDocument: 'after' }
    ).exec();
    
    if (!doc) throw new Error('Connection not found for update');
    return this.mapToDomain(doc);
  }

  async findById(id: string): Promise<ConnectionRequest | null> {
    const doc = await ConnectionModel.findById(id).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByUsers(userA: string, userB: string): Promise<ConnectionRequest | null> {
    const doc = await ConnectionModel.findOne({
      $or: [
        { senderDiscordId: userA, receiverDiscordId: userB },
        { senderDiscordId: userB, receiverDiscordId: userA }
      ]
    }).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByChannelId(channelId: string): Promise<ConnectionRequest | null> {
    const doc = await ConnectionModel.findOne({ 
      $or: [{ senderChannelId: channelId }, { receiverChannelId: channelId }]
    }).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findPendingRequests(discordId: string): Promise<ConnectionRequest[]> {
    const docs = await ConnectionModel.find({
      receiverDiscordId: discordId,
      status: ConnectionStatus.PENDING
    }).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async getInteractedUserIds(discordId: string): Promise<string[]> {
    const docs = await ConnectionModel.find({
      $or: [{ senderDiscordId: discordId }, { receiverDiscordId: discordId }]
    }).select('senderDiscordId receiverDiscordId').exec();
    
    const ids = new Set<string>();
    docs.forEach(doc => {
      if (doc.senderDiscordId !== discordId) ids.add(doc.senderDiscordId);
      if (doc.receiverDiscordId !== discordId) ids.add(doc.receiverDiscordId);
    });
    return Array.from(ids);
  }
}
