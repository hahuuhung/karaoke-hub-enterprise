import { describe, it, expect } from 'vitest';
import { HostessQueueEngine } from '../src/core/HostessQueueEngine';
import { Hostess, HostessSessionLog } from '../src/core/types';

describe('HostessQueueEngine', () => {
  const engine = new HostessQueueEngine({
    overtimeThresholdMinutes: 120,
    defaultCommissionRate: 0.8,
    minimumSessionMinutes: 30,
  });

  const sampleHostesses: Hostess[] = [
    {
      id: 'h1',
      code: 'TV01',
      name: 'Mai Linh',
      teamName: 'Tổ 1',
      status: 'AVAILABLE',
      lastAvailableAt: '2026-10-15T10:00:00Z',
      turnsToday: 2,
      hourlyRate: 300000,
      commissionRate: 0.8,
    },
    {
      id: 'h2',
      code: 'TV02',
      name: 'Thu Hương',
      teamName: 'Tổ 1',
      status: 'AVAILABLE',
      lastAvailableAt: '2026-10-15T11:00:00Z',
      turnsToday: 1, // fewer turns -> should be prioritized first
      hourlyRate: 300000,
      commissionRate: 0.8,
    },
    {
      id: 'h3',
      code: 'TV03',
      name: 'Kim Anh',
      teamName: 'Tổ 2',
      status: 'AVAILABLE',
      lastAvailableAt: '2026-10-15T09:30:00Z',
      turnsToday: 2, // same turns as h1, but waited earlier (09:30 vs 10:00) -> before h1
      hourlyRate: 300000,
      commissionRate: 0.8,
    },
    {
      id: 'h4',
      code: 'TV04',
      name: 'Bích Tuyền',
      teamName: 'Tổ 2',
      status: 'OFF_DUTY',
      lastAvailableAt: '2026-10-15T08:00:00Z',
      turnsToday: 0,
      hourlyRate: 300000,
      commissionRate: 0.8,
    },
  ];

  it('sorts available hostesses fairly by turns today and waiting time', () => {
    const queue = engine.getSortedAvailableQueue(sampleHostesses);
    // h4 is OFF_DUTY -> excluded
    expect(queue.length).toBe(3);
    // h2 has 1 turn -> 1st
    expect(queue[0].id).toBe('h2');
    // h3 has 2 turns, waited since 09:30 -> 2nd
    expect(queue[1].id).toBe('h3');
    // h1 has 2 turns, waited since 10:00 -> 3rd
    expect(queue[2].id).toBe('h1');
  });

  it('triggers overtime warning when hostess is in room >= 120 minutes', () => {
    const checkIn = new Date('2026-10-15T12:00:00Z');
    const currentTime = new Date('2026-10-15T14:15:00Z'); // 135 mins

    const hostess: Hostess = {
      ...sampleHostesses[0],
      status: 'IN_ROOM',
      currentRoomId: 'room-vip-2',
    };

    const activeLog: HostessSessionLog = {
      id: 'log-1',
      roomSessionId: 'sess-1',
      hostessId: hostess.id,
      hostessName: hostess.name,
      checkInTime: checkIn.toISOString(),
      durationMinutes: 0,
      hourlyRate: 300000,
      tipAmount: 0,
      hostessCommission: 0,
      venueCommission: 0,
      totalFee: 0,
    };

    const status = engine.evaluateLiveStatus(hostess, activeLog, currentTime);
    expect(status.servingDurationMinutes).toBe(135);
    expect(status.isOvertime).toBe(true);
    expect(status.overtimeExceededMinutes).toBe(15);
    expect(status.currentEstimatedFee).toBeGreaterThan(0);
  });

  it('calculates checkout commission split and tip properly', () => {
    const checkIn = new Date('2026-10-15T12:00:00Z');
    const checkOut = new Date('2026-10-15T14:00:00Z'); // exactly 2 hours (120 mins)

    const log: HostessSessionLog = {
      id: 'log-2',
      roomSessionId: 'sess-1',
      hostessId: 'h1',
      hostessName: 'Mai Linh',
      checkInTime: checkIn.toISOString(),
      durationMinutes: 0,
      hourlyRate: 300000,
      tipAmount: 0,
      hostessCommission: 0,
      venueCommission: 0,
      totalFee: 0,
    };

    // Rate: 300k/h * 2h = 600k total base fee
    // Hostess: 80% = 480k + 100k tip = 580k
    // Venue: 20% = 120k
    // Total Fee on bill = 600k + 100k tip = 700k
    const result = engine.calculateCheckout(log, checkOut, 100000, 0.8);
    expect(result.durationMinutes).toBe(120);
    expect(result.hostessCommission).toBe(580000);
    expect(result.venueCommission).toBe(120000);
    expect(result.totalFee).toBe(700000);
  });
});
