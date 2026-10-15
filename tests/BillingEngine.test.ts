import { describe, it, expect } from 'vitest';
import { BillingEngine } from '../src/core/BillingEngine';
import { RoomSession } from '../src/core/types';

describe('BillingEngine', () => {
  const engine = new BillingEngine({
    gracePeriodMinutes: 10,
    firstBlockMinutes: 60,
    subsequentBlockMinutes: 15,
    peakHourStart: 18,
    peakHourEnd: 24,
    peakMultiplier: 1.2,
    weekendMultiplier: 1.15,
  });

  const baseRate = 200000; // 200,000 VND / hour

  it('charges 0 VND if session is cancelled within grace period (<= 10 mins)', () => {
    const baseTime = new Date('2026-10-15T14:00:00Z');
    const checkOut = new Date('2026-10-15T14:08:00Z'); // 8 mins

    const session: RoomSession = {
      id: 'sess-1',
      roomId: 'room-1',
      checkInTime: baseTime.toISOString(),
      checkOutTime: checkOut.toISOString(),
      isPaused: false,
      pauseHistory: [],
      transferHistory: [],
      status: 'CANCELLED',
    };

    const result = engine.calculateSessionBilling(session, baseRate, checkOut);
    expect(result.rawMinutes).toBe(8);
    expect(result.billableMinutes).toBe(0);
    expect(result.totalRoomCharge).toBe(0);
  });

  it('charges full 1st block (60 mins) when session is active for 40 minutes', () => {
    // Normal weekday morning/afternoon (e.g. Thursday 14:00)
    const checkIn = new Date('2026-10-15T07:00:00Z'); // UTC
    const checkOut = new Date(checkIn.getTime() + 40 * 60 * 1000); // 40 mins

    const session: RoomSession = {
      id: 'sess-2',
      roomId: 'room-1',
      checkInTime: checkIn.toISOString(),
      isPaused: false,
      pauseHistory: [],
      transferHistory: [],
      status: 'ACTIVE',
    };

    const result = engine.calculateSessionBilling(session, baseRate, checkOut);
    expect(result.rawMinutes).toBe(40);
    expect(result.billableMinutes).toBe(60);
    expect(result.chargedBlocksCount).toBe(1);
    expect(result.totalRoomCharge).toBe(result.effectiveHourlyRate);
  });

  it('rounds up subsequent 15-minute blocks (e.g. 65 mins -> 75 mins charged)', () => {
    const checkIn = new Date('2026-10-15T07:00:00Z');
    const checkOut = new Date(checkIn.getTime() + 65 * 60 * 1000); // 65 mins

    const session: RoomSession = {
      id: 'sess-3',
      roomId: 'room-1',
      checkInTime: checkIn.toISOString(),
      isPaused: false,
      pauseHistory: [],
      transferHistory: [],
      status: 'ACTIVE',
    };

    const result = engine.calculateSessionBilling(session, baseRate, checkOut);
    expect(result.rawMinutes).toBe(65);
    expect(result.billableMinutes).toBe(75); // 60 + 15
    expect(result.chargedBlocksCount).toBe(2);
    // 200,000 for 1st block + (200,000 / 60 * 15 = 50,000) for 2nd block = 250,000 * multiplier
    const expectedRate = result.effectiveHourlyRate;
    const expectedCharge = expectedRate + Math.round((expectedRate / 60) * 15);
    expect(result.totalRoomCharge).toBe(expectedCharge);
  });

  it('deducts paused duration properly', () => {
    const checkIn = new Date('2026-10-15T07:00:00Z');
    const checkOut = new Date(checkIn.getTime() + 90 * 60 * 1000); // 90 mins total
    const pauseStart = new Date(checkIn.getTime() + 20 * 60 * 1000);
    const pauseEnd = new Date(checkIn.getTime() + 50 * 60 * 1000); // 30 mins paused

    const session: RoomSession = {
      id: 'sess-4',
      roomId: 'room-1',
      checkInTime: checkIn.toISOString(),
      isPaused: false,
      pauseHistory: [
        {
          pausedAt: pauseStart.toISOString(),
          resumedAt: pauseEnd.toISOString(),
          durationMinutes: 30,
        },
      ],
      transferHistory: [],
      status: 'ACTIVE',
    };

    const result = engine.calculateSessionBilling(session, baseRate, checkOut);
    expect(result.rawMinutes).toBe(90);
    expect(result.pausedMinutes).toBe(30);
    // Active minutes = 90 - 30 = 60 minutes -> exactly 1 block of 60 mins
    expect(result.billableMinutes).toBe(60);
    expect(result.chargedBlocksCount).toBe(1);
  });

  it('preserves and aggregates room transfer snapshots', () => {
    const checkIn = new Date('2026-10-15T07:00:00Z');
    const checkOut = new Date(checkIn.getTime() + 30 * 60 * 1000);

    const session: RoomSession = {
      id: 'sess-5',
      roomId: 'room-vip-2',
      checkInTime: checkIn.toISOString(),
      isPaused: false,
      pauseHistory: [],
      transferHistory: [
        {
          fromRoomId: 'room-std-1',
          toRoomId: 'room-vip-2',
          transferredAt: checkIn.toISOString(),
          durationMinutes: 60,
          chargeSnapshot: 150000, // 150k from room-std-1
        },
      ],
      status: 'ACTIVE',
    };

    const result = engine.calculateSessionBilling(session, baseRate, checkOut);
    expect(result.transferAccumulatedCharge).toBe(150000);
    expect(result.totalRoomCharge).toBeGreaterThan(150000);
    expect(result.breakdown.transfersCharge).toBe(150000);
  });
});
