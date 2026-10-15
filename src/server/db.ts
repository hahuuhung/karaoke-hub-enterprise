import fs from 'fs';
import path from 'path';
import {
  Room,
  RoomSession,
  Hostess,
  HostessSessionLog,
  MenuItem,
  OrderItem,
  Invoice,
  OutboxSyncEvent,
} from '../core/types';
import { logger } from './logger';

export interface DatabaseState {
  rooms: Room[];
  sessions: RoomSession[];
  hostesses: Hostess[];
  hostessLogs: HostessSessionLog[];
  menuItems: MenuItem[];
  orderItems: OrderItem[];
  invoices: Invoice[];
  outbox: OutboxSyncEvent[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'local_db.json');

const INITIAL_ROOMS: Room[] = [
  { id: 'r101', code: 'P101', name: 'Phòng 101 (Standard)', type: 'STANDARD', hourlyRate: 150000, status: 'AVAILABLE' },
  { id: 'r102', code: 'P102', name: 'Phòng 102 (Standard)', type: 'STANDARD', hourlyRate: 150000, status: 'AVAILABLE' },
  { id: 'r103', code: 'P103', name: 'Phòng 103 (Standard)', type: 'STANDARD', hourlyRate: 150000, status: 'AVAILABLE' },
  { id: 'r201', code: 'VIP01', name: 'Phòng VIP 01', type: 'VIP', hourlyRate: 220000, status: 'AVAILABLE' },
  { id: 'r202', code: 'VIP02', name: 'Phòng VIP 02', type: 'VIP', hourlyRate: 220000, status: 'AVAILABLE' },
  { id: 'r203', code: 'VIP03', name: 'Phòng VIP 03', type: 'VIP', hourlyRate: 220000, status: 'AVAILABLE' },
  { id: 'r301', code: 'SVIP01', name: 'Phòng Super VIP 01', type: 'SUPER_VIP', hourlyRate: 320000, status: 'AVAILABLE' },
  { id: 'r302', code: 'SVIP02', name: 'Phòng Super VIP 02', type: 'SUPER_VIP', hourlyRate: 320000, status: 'AVAILABLE' },
  { id: 'r401', code: 'PARTY01', name: 'Phòng Sân Khấu Party 01', type: 'PARTY', hourlyRate: 450000, status: 'AVAILABLE' },
];

const INITIAL_HOSTESSES: Hostess[] = [
  { id: 'h01', code: 'TV01', name: 'Mai Linh', teamName: 'Tổ 1', status: 'AVAILABLE', lastAvailableAt: new Date(Date.now() - 3600000 * 2).toISOString(), turnsToday: 1, hourlyRate: 300000, commissionRate: 0.8 },
  { id: 'h02', code: 'TV02', name: 'Thu Hương', teamName: 'Tổ 1', status: 'AVAILABLE', lastAvailableAt: new Date(Date.now() - 3600000 * 1.5).toISOString(), turnsToday: 0, hourlyRate: 300000, commissionRate: 0.8 },
  { id: 'h03', code: 'TV03', name: 'Kim Anh', teamName: 'Tổ 2', status: 'AVAILABLE', lastAvailableAt: new Date(Date.now() - 3600000 * 3).toISOString(), turnsToday: 2, hourlyRate: 300000, commissionRate: 0.8 },
  { id: 'h04', code: 'TV04', name: 'Bảo Ngọc', teamName: 'Tổ 2', status: 'AVAILABLE', lastAvailableAt: new Date(Date.now() - 3600000 * 1.8).toISOString(), turnsToday: 1, hourlyRate: 300000, commissionRate: 0.8 },
  { id: 'h05', code: 'TV05', name: 'Kiều Oanh', teamName: 'Tổ 1', status: 'AVAILABLE', lastAvailableAt: new Date(Date.now() - 3600000 * 2.5).toISOString(), turnsToday: 2, hourlyRate: 300000, commissionRate: 0.8 },
  { id: 'h06', code: 'TV06', name: 'Phương Thảo', teamName: 'Tổ 3', status: 'AVAILABLE', lastAvailableAt: new Date(Date.now() - 3600000 * 0.5).toISOString(), turnsToday: 0, hourlyRate: 300000, commissionRate: 0.8 },
  { id: 'h07', code: 'TV07', name: 'Thảo Nhi', teamName: 'Tổ 3', status: 'AVAILABLE', lastAvailableAt: new Date(Date.now() - 3600000 * 1.2).toISOString(), turnsToday: 1, hourlyRate: 300000, commissionRate: 0.8 },
  { id: 'h08', code: 'TV08', name: 'Cẩm Tú', teamName: 'Tổ 2', status: 'AVAILABLE', lastAvailableAt: new Date(Date.now() - 3600000 * 4).toISOString(), turnsToday: 3, hourlyRate: 300000, commissionRate: 0.8 },
  { id: 'h09', code: 'TV09', name: 'Bích Tuyền', teamName: 'Tổ 3', status: 'OFF_DUTY', lastAvailableAt: new Date().toISOString(), turnsToday: 1, hourlyRate: 300000, commissionRate: 0.8 },
];

const INITIAL_MENU: MenuItem[] = [
  { id: 'm01', code: 'BIA01', name: 'Bia Heineken Silver', category: 'BEVERAGE', unit: 'Lon', price: 32000, stockQuantity: 240 },
  { id: 'm02', code: 'BIA02', name: 'Bia Tiger Crystal', category: 'BEVERAGE', unit: 'Lon', price: 28000, stockQuantity: 180 },
  { id: 'm03', code: 'BIA03', name: 'Bia Corona Extra', category: 'BEVERAGE', unit: 'Chai', price: 55000, stockQuantity: 96 },
  { id: 'm04', code: 'NUOC01', name: 'Nước Suối Aquafina', category: 'BEVERAGE', unit: 'Chai', price: 15000, stockQuantity: 150 },
  { id: 'm05', code: 'NUOC02', name: 'Nước Tăng Lực RedBull', category: 'BEVERAGE', unit: 'Lon', price: 25000, stockQuantity: 120 },
  { id: 'm06', code: 'KHAN01', name: 'Khăn Lạnh Cao Cấp', category: 'OTHER', unit: 'Cái', price: 5000, stockQuantity: 500 },
  { id: 'm07', code: 'DOAN01', name: 'Đĩa Trái Cây Thập Cẩm Đặc Biệt', category: 'FOOD', unit: 'Đĩa', price: 220000, stockQuantity: 50 },
  { id: 'm08', code: 'DOAN02', name: 'Bò Khô Xé Sợi Chanh Ớt', category: 'SNACK', unit: 'Đĩa', price: 95000, stockQuantity: 80 },
  { id: 'm09', code: 'DOAN03', name: 'Mực Trứng Hấp Gừng', category: 'FOOD', unit: 'Đĩa', price: 260000, stockQuantity: 30 },
  { id: 'm10', code: 'DOAN04', name: 'Hạt Điều Rang Muối', category: 'SNACK', unit: 'Hộp', price: 65000, stockQuantity: 70 },
];

export class LocalDatabase {
  private state: DatabaseState;

  constructor() {
    this.ensureDataDir();
    this.state = this.loadFromDisk();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadFromDisk(): DatabaseState {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        logger.info('Loaded existing database from disk');
        return JSON.parse(raw);
      } catch (err) {
        logger.error({ err }, 'Failed to parse database file, resetting to initial seed');
      }
    }

    const initialState: DatabaseState = {
      rooms: INITIAL_ROOMS,
      sessions: [],
      hostesses: INITIAL_HOSTESSES,
      hostessLogs: [],
      menuItems: INITIAL_MENU,
      orderItems: [],
      invoices: [],
      outbox: [],
    };

    this.saveToDisk(initialState);
    return initialState;
  }

  public saveToDisk(state?: DatabaseState) {
    if (state) this.state = state;
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      logger.error({ err }, 'Error writing database to disk');
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public addOutboxEvent(eventType: OutboxSyncEvent['eventType'], payload: any) {
    const event: OutboxSyncEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventType,
      payload,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      retryCount: 0,
    };
    this.state.outbox.unshift(event);
    this.saveToDisk();
    return event;
  }
}

export const db = new LocalDatabase();
