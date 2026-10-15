/**
 * Karaoke Hub Enterprise - Core Domain Types & Data Models
 */

export type RoomType = 'STANDARD' | 'VIP' | 'SUPER_VIP' | 'PARTY';

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'RESERVED';

export interface Room {
  id: string;
  code: string;
  name: string;
  type: RoomType;
  hourlyRate: number; // Base rate per hour (VND)
  status: RoomStatus;
  currentSessionId?: string | null;
  cleaningStartedAt?: string | null;
}

export interface PauseInterval {
  pausedAt: string; // ISO 8601
  resumedAt?: string | null; // ISO 8601
  durationMinutes: number;
}

export interface RoomTransferLog {
  fromRoomId: string;
  toRoomId: string;
  transferredAt: string; // ISO 8601
  durationMinutes: number;
  chargeSnapshot: number;
}

export interface RoomSession {
  id: string;
  roomId: string;
  customerName?: string;
  customerPhone?: string;
  checkInTime: string; // ISO 8601
  checkOutTime?: string | null; // ISO 8601
  isPaused: boolean;
  pauseHistory: PauseInterval[];
  transferHistory: RoomTransferLog[];
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  customHourlyRate?: number;
}

export type HostessStatus = 'AVAILABLE' | 'IN_ROOM' | 'OFF_DUTY';

export interface Hostess {
  id: string;
  code: string;
  name: string;
  teamName: string;
  phone?: string;
  status: HostessStatus;
  currentRoomId?: string | null;
  currentRoomSessionId?: string | null;
  lastAvailableAt: string; // ISO 8601 - used for round-robin queue sorting
  turnsToday: number;
  hourlyRate: number; // Default: 300,000 VND / hour
  commissionRate: number; // e.g. 0.8 = 80% to hostess, 20% to venue
}

export interface HostessSessionLog {
  id: string;
  roomSessionId: string;
  hostessId: string;
  hostessName: string;
  checkInTime: string; // ISO 8601
  checkOutTime?: string | null; // ISO 8601
  durationMinutes: number;
  hourlyRate: number;
  tipAmount: number;
  hostessCommission: number;
  venueCommission: number;
  totalFee: number;
}

export type MenuCategory = 'BEVERAGE' | 'FOOD' | 'SNACK' | 'OTHER';

export interface MenuItem {
  id: string;
  code: string;
  name: string;
  category: MenuCategory;
  unit: string;
  price: number;
  stockQuantity: number;
}

export interface OrderItem {
  id: string;
  roomSessionId: string;
  menuItemId: string;
  name: string;
  unit: string;
  dispatchedQty: number; // Mang vào phòng
  returnedQty: number;   // Kiểm đồ trả lại (chưa khui)
  consumedQty: number;   // Thực tế dùng (dispatched - returned)
  unitPrice: number;
  totalPrice: number;
  dispatchedAt: string;
}

export type PaymentMethod = 'VIETQR' | 'CASH' | 'CARD';

export interface Invoice {
  id: string;
  roomSessionId: string;
  invoiceCode: string;
  roomName: string;
  customerName?: string;
  checkInTime: string;
  checkOutTime: string;
  totalRoomMinutes: number;
  roomCharge: number;
  fnbCharge: number;
  hostessCharge: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  createdAt: string;
}

export interface OutboxSyncEvent {
  id: string;
  eventType: 'ROOM_SESSION_CREATED' | 'ROOM_SESSION_UPDATED' | 'ORDER_PLACED' | 'ORDER_RETURNED' | 'HOSTESS_DISPATCHED' | 'HOSTESS_CHECKOUT' | 'INVOICE_PAID';
  payload: any;
  createdAt: string;
  syncedAt?: string | null;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  retryCount: number;
}

export type StaffRole = 'MANAGER' | 'CASHIER' | 'WAITER';

export interface StaffUser {
  id: string;
  name: string;
  username: string; // Email or phone
  phone?: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
}

export type AuditActionType =
  | 'ALL'
  | 'PAYMENT'
  | 'ROOM'
  | 'FNB'
  | 'HOSTESS'
  | 'INVOICE_EDIT'
  | 'AUTH'
  | 'CONFIG';

export interface AuditLog {
  id: string;
  timestamp: string;
  who: string;
  role: string;
  type: AuditActionType;
  action: string;
  detail: string;
}

export interface VenueSettings {
  venueName: string;
  phone: string;
  address: string;
  slogan: string;
  wifiSsid: string;
  wifiPassword: string;
  bankId: string;
  bankAccountNo: string;
  bankAccountName: string;
  firstBlockMinutes: number;
  subsequentBlockMinutes: number;
  gracePeriodMinutes: number;
  peakHourSurchargeRate: number;
}

