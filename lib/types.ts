export type UserRole =
  | 'Administrator'
  | 'Security Officer'
  | 'Supervisor'
  | 'CSD'
  | 'Security Viewer'
  | 'Delivery Driver';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  badgeNumber: string;
  department: string;
  phone?: string;
  isActive: boolean;
  avatarUrl?: string;
  lastLogin?: string;
}

export type VesselStatus = 'Scheduled' | 'Arrived' | 'In Progress' | 'Completed';

export interface Vessel {
  id: string;
  name: string;
  imoNumber: string;
  voyageNumber: string;
  docNumber: string;
  shippingAgent: string;
  berthLocation: string;
  arrivalDate: string;
  operationStartDate: string;
  operationEndDate?: string;
  status: VesselStatus;
  totalManifestedVehicles: number;
  dischargedCount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ChecklistItemStatus = 'OK' | 'Missing' | 'Damaged' | 'NA';

export interface InspectionItem {
  id: string;
  name: string;
  label: string;
  status: ChecklistItemStatus;
  notes?: string;
}

export type DamageCategory =
  | 'Torn'
  | 'Bent'
  | 'Rusty'
  | 'Glass Cracked'
  | 'Scratched'
  | 'Bumpy'
  | 'Dented'
  | 'Engine Failure';

export interface DamageEntry {
  id: string;
  category: DamageCategory;
  location: string;
  severity: 'Minor' | 'Moderate' | 'Severe';
  remarks: string;
  photoUrl?: string;
}

export type PhotoType = 'front' | 'rear' | 'chassis' | 'damage' | 'additional';

export interface PhotoEvidenceItem {
  id: string;
  type: PhotoType;
  label: string;
  dataUrl: string; // Base64 data URL or remote path
  uploadedAt: string;
}

export type TallyStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Changes Requested';

export interface VehicleTally {
  id: string;
  referenceNo: string; // e.g. DTVS-2026-000784
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
  cargoType: 'Vehicle (CBU)' | 'Heavy Equipment' | 'High & Heavy' | 'Breakbulk' | 'Machinery';
  driverName?: string;
  driverLicense?: string;

  checklist: InspectionItem[];
  hasDamage: boolean;
  damages: DamageEntry[];
  photos: PhotoEvidenceItem[];

  status: TallyStatus;
  isLocked: boolean; // True once approved

  createdBy: {
    id: string;
    name: string;
    role: string;
    badgeNo: string;
  };
  deviceId: string;
  createdAt: string;
  submittedAt?: string;

  approvalDetails?: {
    approvedBy: string;
    supervisorName: string;
    approvedAt: string;
    comments?: string;
  };

  rejectionDetails?: {
    rejectedBy: string;
    supervisorName: string;
    rejectedAt: string;
    reason: string;
  };

  correctionDetails?: {
    requestedBy: string;
    supervisorName: string;
    requestedAt: string;
    comments: string;
    history?: Array<{
      requestedAt: string;
      supervisorName: string;
      comments: string;
      resolvedAt?: string;
    }>;
  };

  qrCodeDataUrl?: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  localModifiedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole | string;
  action:
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'TALLY_CREATED'
  | 'TALLY_DRAFT_SAVED'
  | 'TALLY_SUBMITTED'
  | 'TALLY_APPROVED'
  | 'TALLY_REJECTED'
  | 'TALLY_CHANGES_REQUESTED'
  | 'TALLY_UPDATED'
  | 'QR_VERIFIED'
  | 'PDF_GENERATED'
  | 'OFFLINE_SYNC_COMPLETED'
  | 'VESSEL_CREATED'
  | 'VESSEL_UPDATED'
  | 'SYSTEM_CONFIG_CHANGED';
  recordId?: string;
  referenceNo?: string;
  details: string;
  deviceId?: string;
  ipAddress?: string;
  previousValue?: string;
  newValue?: string;
}

export interface SyncQueueItem {
  id: string;
  localId: string;
  type: 'TALLY_SUBMIT' | 'TALLY_DRAFT' | 'PHOTO_UPLOAD' | 'APPROVAL';
  payload: any;
  createdAt: string;
  attempts: number;
  lastAttempt?: string;
  error?: string;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
}

export interface DashboardStats {
  totalVehicles: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  vesselsInOperation: number;
  todayTallyCount: number;
  todayOperation: {
    vesselName: string;
    voyageNo: string;
    docNo: string;
    status: VesselStatus;
    totalManifested: number;
    dischargedCount: number;
    percentComplete: number;
  };
  recentActivities: Array<{
    id: string;
    type: 'approved' | 'photo' | 'created' | 'rejected' | 'sync';
    description: string;
    actor: string;
    timestamp: string;
    referenceNo?: string;
  }>;
}

