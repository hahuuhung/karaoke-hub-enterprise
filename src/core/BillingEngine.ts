/**
 * Karaoke Hub Enterprise - Room Billing Engine
 * Supports block-based calculation, grace period, room transfers, pause intervals, and timeframe multipliers.
 */

import { RoomType, RoomSession, PauseInterval, RoomTransferLog } from './types';

export interface BillingConfig {
  gracePeriodMinutes: number; // e.g. 10 mins (0 VND if cancelled within 10 mins)
  firstBlockMinutes: number;   // e.g. 60 mins
  subsequentBlockMinutes: number; // e.g. 15 mins
  peakHourStart: number;       // e.g. 18 (6:00 PM)
  peakHourEnd: number;         // e.g. 24 (12:00 AM)
  peakMultiplier: number;      // e.g. 1.2 (20% surcharge)
  weekendMultiplier: number;   // e.g. 1.15 (15% surcharge)
}

export const DEFAULT_BILLING_CONFIG: BillingConfig = {
  gracePeriodMinutes: 10,
  firstBlockMinutes: 60,
  subsequentBlockMinutes: 15,
  peakHourStart: 18,
  peakHourEnd: 24,
  peakMultiplier: 1.2,
  weekendMultiplier: 1.15,
};

export interface BillingResult {
  rawMinutes: number;
  pausedMinutes: number;
  billableMinutes: number;
  chargedBlocksCount: number;
  baseHourlyRate: number;
  effectiveHourlyRate: number;
  totalRoomCharge: number;
  transferAccumulatedCharge: number;
  breakdown: {
    firstBlockCharge: number;
    subsequentBlocksCharge: number;
    transfersCharge: number;
    appliedMultiplier: number;
  };
}

export class BillingEngine {
  private config: BillingConfig;

  constructor(config: Partial<BillingConfig> = {}) {
    this.config = { ...DEFAULT_BILLING_CONFIG, ...config };
  }

  /**
   * Calculate billing for an active or completed session
   */
  public calculateSessionBilling(
    session: RoomSession,
    baseHourlyRate: number,
    currentTime: Date = new Date()
  ): BillingResult {
    const checkIn = new Date(session.checkInTime);
    const checkOut = session.checkOutTime ? new Date(session.checkOutTime) : currentTime;

    // 1. Raw total duration in minutes
    const totalElapsedMs = Math.max(0, checkOut.getTime() - checkIn.getTime());
    const rawMinutes = Math.floor(totalElapsedMs / (1000 * 60));

    // 2. Calculate paused minutes
    const pausedMinutes = this.calculateTotalPausedMinutes(session.pauseHistory, currentTime);
    const activeMinutes = Math.max(0, rawMinutes - pausedMinutes);

    // 3. Grace period check (if session is cancelled or within grace period with 0 charge requirement)
    if (session.status === 'CANCELLED' && activeMinutes <= this.config.gracePeriodMinutes) {
      return {
        rawMinutes,
        pausedMinutes,
        billableMinutes: 0,
        chargedBlocksCount: 0,
        baseHourlyRate,
        effectiveHourlyRate: baseHourlyRate,
        totalRoomCharge: 0,
        transferAccumulatedCharge: 0,
        breakdown: {
          firstBlockCharge: 0,
          subsequentBlocksCharge: 0,
          transfersCharge: 0,
          appliedMultiplier: 1.0,
        },
      };
    }

    // 4. Calculate rate multipliers based on check-in time
    const multiplier = this.calculateRateMultiplier(checkIn);
    const effectiveHourlyRate = Math.round(baseHourlyRate * multiplier);

    // 5. Calculate block charges for current room
    let billableMinutes = 0;
    let chargedBlocksCount = 0;
    let firstBlockCharge = 0;
    let subsequentBlocksCharge = 0;

    if (activeMinutes > 0) {
      if (activeMinutes <= this.config.firstBlockMinutes) {
        // Less than or equal to first block (e.g. 60m)
        billableMinutes = this.config.firstBlockMinutes;
        chargedBlocksCount = 1;
        firstBlockCharge = effectiveHourlyRate;
      } else {
        // First block + subsequent blocks
        const extraMinutes = activeMinutes - this.config.firstBlockMinutes;
        const subsequentBlocks = Math.ceil(extraMinutes / this.config.subsequentBlockMinutes);
        
        billableMinutes = this.config.firstBlockMinutes + subsequentBlocks * this.config.subsequentBlockMinutes;
        chargedBlocksCount = 1 + subsequentBlocks;
        
        firstBlockCharge = effectiveHourlyRate;
        const subBlockRate = (effectiveHourlyRate / 60) * this.config.subsequentBlockMinutes;
        subsequentBlocksCharge = Math.round(subsequentBlocks * subBlockRate);
      }
    }

    // 6. Add accumulated charges from previous rooms if transferred
    const transferAccumulatedCharge = (session.transferHistory || []).reduce(
      (sum, item) => sum + (item.chargeSnapshot || 0),
      0
    );

    const totalRoomCharge = firstBlockCharge + subsequentBlocksCharge + transferAccumulatedCharge;

    return {
      rawMinutes,
      pausedMinutes,
      billableMinutes,
      chargedBlocksCount,
      baseHourlyRate,
      effectiveHourlyRate,
      totalRoomCharge,
      transferAccumulatedCharge,
      breakdown: {
        firstBlockCharge,
        subsequentBlocksCharge,
        transfersCharge: transferAccumulatedCharge,
        appliedMultiplier: multiplier,
      },
    };
  }

  /**
   * Sum up paused intervals
   */
  public calculateTotalPausedMinutes(
    pauseHistory: PauseInterval[] | undefined,
    currentTime: Date
  ): number {
    if (!pauseHistory || pauseHistory.length === 0) return 0;

    let totalMinutes = 0;
    for (const pause of pauseHistory) {
      if (pause.resumedAt) {
        const start = new Date(pause.pausedAt).getTime();
        const end = new Date(pause.resumedAt).getTime();
        totalMinutes += Math.max(0, Math.floor((end - start) / (1000 * 60)));
      } else {
        // Currently paused
        const start = new Date(pause.pausedAt).getTime();
        const end = currentTime.getTime();
        totalMinutes += Math.max(0, Math.floor((end - start) / (1000 * 60)));
      }
    }
    return totalMinutes;
  }

  /**
   * Calculate surcharge multipliers (Peak hours & Weekends)
   */
  public calculateRateMultiplier(checkIn: Date): number {
    let multiplier = 1.0;
    const hour = checkIn.getHours();
    const day = checkIn.getDay(); // 0 is Sunday, 6 is Saturday

    // Weekend surcharge (Sat & Sun)
    if (day === 0 || day === 6) {
      multiplier *= this.config.weekendMultiplier;
    }

    // Peak hour surcharge
    if (hour >= this.config.peakHourStart && hour < this.config.peakHourEnd) {
      multiplier *= this.config.peakMultiplier;
    }

    return parseFloat(multiplier.toFixed(2));
  }
}
