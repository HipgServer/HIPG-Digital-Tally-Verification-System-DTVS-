import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  username: string;
  name: string;
  email: string;
  role: string;
  badgeNumber: string;
  department: string;
  phone?: string;
  isActive: boolean;
  avatarUrl?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    username: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      required: true,
      enum: [
        'Administrator',
        'Security Officer',
        'Supervisor',
        'CSD',
        'Security Viewer',
        'Delivery Driver',
      ],
      index: true,
    },
    badgeNumber: { type: String, required: true },
    department: { type: String, required: true },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
    avatarUrl: { type: String },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

