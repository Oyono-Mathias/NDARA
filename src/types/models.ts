import type { Timestamp } from 'firebase/firestore';

export interface BaseModel {
  id?: string;
  createdAt?: Timestamp | string | Date;
  updatedAt?: Timestamp | string | Date;
}

export type KycStatus = 'pending' | 'verified' | 'rejected';
export type UserRole = 'user' | 'admin' | 'instructor' | 'agent';

export interface User extends BaseModel {
  uid: string;
  phone: string;
  email?: string;
  pinHash?: string; // Optionnel côté client, utilisé pour sécuriser les transactions (Phase future)
  kycStatus: KycStatus;
  role: UserRole;
}

export interface KycRecord extends BaseModel {
  userId: string;
  documentType: string;
  documentUrl: string;
  status: KycStatus;
}

export interface AuditLog extends BaseModel {
  action: string;
  userId: string;
  timestamp: string; // ISO 8601 string pour garantir la précision
  ipAddress?: string;
}
