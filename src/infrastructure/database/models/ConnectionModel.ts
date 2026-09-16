import mongoose, { Schema, Document } from 'mongoose';
import { ConnectionStatus } from '../../../domain/enums/ConnectionStatus';

export interface IConnectionDocument extends Document {
  senderDiscordId: string;
  receiverDiscordId: string;
  status: ConnectionStatus;
  senderGuildId?: string;
  senderChannelId?: string;
  receiverChannelId?: string;
  revealedUsers: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ConnectionSchema = new Schema<IConnectionDocument>(
  {
    senderDiscordId: { type: String, required: true, index: true },
    receiverDiscordId: { type: String, required: true, index: true },
    status: { type: String, enum: Object.values(ConnectionStatus), default: ConnectionStatus.PENDING, index: true },
    senderGuildId: { type: String },
    senderChannelId: { type: String, index: true },
    receiverChannelId: { type: String, index: true },
    revealedUsers: [{ type: String }],
  },
  { timestamps: true }
);

// Ensure a user can only have one active interaction with another user at a time
ConnectionSchema.index({ senderDiscordId: 1, receiverDiscordId: 1 }, { unique: true });

// Compound index for pending request queries (receiverDiscordId + status)
ConnectionSchema.index({ receiverDiscordId: 1, status: 1 });

export const ConnectionModel = mongoose.model<IConnectionDocument>('Connection', ConnectionSchema);

