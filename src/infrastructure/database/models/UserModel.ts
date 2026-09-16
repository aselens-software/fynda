import mongoose, { Schema, Document } from 'mongoose';
import { DiscoveryIntent } from '../../../domain/enums/DiscoveryIntent';

export interface IUserDocument extends Document {
  discordId: string;
  isDiscoverable: boolean;
  profile: {
    languages: string[];
    interests: string[];
    hobbies: string[];
    games: string[];
    activityTime: {
      startHour: number;
      endHour: number;
    };
    lookingFor: DiscoveryIntent[];
    bio?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    discordId: { type: String, required: true, unique: true, index: true },
    isDiscoverable: { type: Boolean, default: false, index: true },
    profile: {
      languages: [{ type: String }],
      interests: [{ type: String }],
      hobbies: [{ type: String }],
      games: [{ type: String }],
      activityTime: {
        startHour: { type: Number, min: 0, max: 23, default: 0 },
        endHour: { type: Number, min: 0, max: 23, default: 23 },
      },
      lookingFor: [{ type: String, enum: Object.values(DiscoveryIntent) }],
      bio: { type: String, maxlength: 500 },
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
