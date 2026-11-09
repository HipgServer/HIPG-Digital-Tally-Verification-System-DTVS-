import mongoose, { Schema, Document } from 'mongoose';

export interface IVesselDocument extends Document {
  name: string;
  imoNumber: string;
  voyageNumber: string;
  docNumber: string;
  shippingAgent: string;
  berthLocation: string;
  arrivalDate: Date;
  operationStartDate: Date;
  operationEndDate?: Date;
  status: 'Scheduled' | 'Arrived' | 'In Progress' | 'Completed';
  totalManifestedVehicles: number;
  dischargedCount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VesselSchema = new Schema<IVesselDocument>(
  {
    name: { type: String, required: true, index: true },
    imoNumber: { type: String, required: true },
    voyageNumber: { type: String, required: true, index: true },
    docNumber: { type: String, required: true, index: true },
    shippingAgent: { type: String, required: true },
    berthLocation: { type: String, required: true },
    arrivalDate: { type: Date, required: true },
    operationStartDate: { type: Date, required: true },
    operationEndDate: { type: Date },
    status: {
      type: String,
      required: true,
      enum: ['Scheduled', 'Arrived', 'In Progress', 'Completed'],
      default: 'Scheduled',
      index: true,
    },
    totalManifestedVehicles: { type: Number, default: 0 },
    dischargedCount: { type: Number, default: 0 },
    approvedCount: { type: Number, default: 0 },
    pendingCount: { type: Number, default: 0 },
    rejectedCount: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

export const VesselModel = mongoose.models.Vessel || mongoose.model<IVesselDocument>('Vessel', VesselSchema);

