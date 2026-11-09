import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  recordId?: string;
  referenceNo?: string;
  details: string;
  deviceId?: string;
  ipAddress?: string;
  previousValue?: string;
  newValue?: string;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    recordId: { type: String, index: true },
    referenceNo: { type: String, index: true },
    details: { type: String, required: true },
    deviceId: { type: String },
    ipAddress: { type: String },
    previousValue: { type: String },
    newValue: { type: String },
  },
  { timestamps: true }
);

export const AuditLogModel =
  mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);

