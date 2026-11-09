import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicleTallyDocument extends Document {
  referenceNo: string;
  vesselId: string;
  vesselName: string;
  voyageNo: string;
  docNo: string;
  vehicleNo: string;
  chassisNo: string;
  tagNo?: string;
  agentName: string;
  yardLocation: string;
  brandModel: string;
  cargoType: string;
  driverName?: string;
  driverLicense?: string;
  checklist: Array<{
    id: string;
    name: string;
    label: string;
    status: 'OK' | 'Missing' | 'Damaged' | 'NA';
    notes?: string;
  }>;
  hasDamage: boolean;
  damages: Array<{
    id: string;
    category: string;
    location: string;
    severity: string;
    remarks: string;
    photoUrl?: string;
  }>;
  photos: Array<{
    id: string;
    type: string;
    label: string;
    dataUrl: string;
    uploadedAt: Date;
  }>;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Changes Requested';
  isLocked: boolean;
  createdBy: {
    id: string;
    name: string;
    role: string;
    badgeNo: string;
  };
  deviceId: string;
  createdAt: Date;
  submittedAt?: Date;
  approvalDetails?: {
    approvedBy: string;
    supervisorName: string;
    approvedAt: Date;
    comments?: string;
  };
  rejectionDetails?: {
    rejectedBy: string;
    supervisorName: string;
    rejectedAt: Date;
    reason: string;
  };
  correctionDetails?: {
    requestedBy: string;
    supervisorName: string;
    requestedAt: Date;
    comments: string;
  };
  qrCodeDataUrl?: string;
  syncStatus: 'synced' | 'pending' | 'failed';
}

const VehicleTallySchema = new Schema<IVehicleTallyDocument>(
  {
    referenceNo: { type: String, required: true, unique: true, index: true },
    vesselId: { type: String, required: true, index: true },
    vesselName: { type: String, required: true },
    voyageNo: { type: String, required: true },
    docNo: { type: String, required: true },
    vehicleNo: { type: String, required: true, index: true },
    chassisNo: { type: String, required: true, index: true },
    tagNo: { type: String },
    agentName: { type: String, required: true },
    yardLocation: { type: String, required: true },
    brandModel: { type: String, required: true },
    cargoType: { type: String, required: true },
    driverName: { type: String },
    driverLicense: { type: String },
    checklist: [
      {
        id: String,
        name: String,
        label: String,
        status: { type: String, enum: ['OK', 'Missing', 'Damaged', 'NA'] },
        notes: String,
      },
    ],
    hasDamage: { type: Boolean, default: false },
    damages: [
      {
        id: String,
        category: String,
        location: String,
        severity: String,
        remarks: String,
        photoUrl: String,
      },
    ],
    photos: [
      {
        id: String,
        type: String,
        label: String,
        dataUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Changes Requested'],
      default: 'Pending Approval',
      index: true,
    },
    isLocked: { type: Boolean, default: false },
    createdBy: {
      id: String,
      name: String,
      role: String,
      badgeNo: String,
    },
    deviceId: { type: String, default: 'PORT-DEVICE-01' },
    submittedAt: { type: Date },
    approvalDetails: {
      approvedBy: String,
      supervisorName: String,
      approvedAt: Date,
      comments: String,
    },
    rejectionDetails: {
      rejectedBy: String,
      supervisorName: String,
      rejectedAt: Date,
      reason: String,
    },
    correctionDetails: {
      requestedBy: String,
      supervisorName: String,
      requestedAt: Date,
      comments: String,
    },
    qrCodeDataUrl: String,
    syncStatus: { type: String, enum: ['synced', 'pending', 'failed'], default: 'synced' },
  },
  { timestamps: true }
);

export const VehicleTallyModel =
  mongoose.models.VehicleTally || mongoose.model<IVehicleTallyDocument>('VehicleTally', VehicleTallySchema);

