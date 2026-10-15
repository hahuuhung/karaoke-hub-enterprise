/**
 * Karaoke Hub Enterprise - Hostess Dispatch & Round-Robin Queue Engine
 * Handles hostess turn rotation, in-room session tracking, overtime alerts, and commission calculations.
 */

import { Hostess, HostessSessionLog, HostessStatus } from './types';

export interface HostessQueueConfig {
  overtimeThresholdMinutes: number; // e.g. 120 mins -> trigger warning
  defaultCommissionRate: number;    // e.g. 0.8 (80% to hostess, 20% to venue)
  minimumSessionMinutes: number;    // e.g. 30 mins minimum billing
}

export const DEFAULT_HOSTESS_CONFIG: HostessQueueConfig = {
  overtimeThresholdMinutes: 120,
  defaultCommissionRate: 0.8,
  minimumSessionMinutes: 30,
};

export interface HostessLiveStatus {
  hostess: Hostess;
  sessionLog?: HostessSessionLog;
  servingDurationMinutes: number;
  isOvertime: boolean;
  overtimeExceededMinutes: number;
  currentEstimatedFee: number;
}

export class HostessQueueEngine {
  private config: HostessQueueConfig;

  constructor(config: Partial<HostessQueueConfig> = {}) {
    this.config = { ...DEFAULT_HOSTESS_CONFIG, ...config };
  }

  /**
   * Sort available hostesses by fair round-robin:
   * 1. Lowest turns today first
   * 2. Longest waiting time (earliest lastAvailableAt)
   */
  public getSortedAvailableQueue(hostesses: Hostess[]): Hostess[] {
    return hostesses
      .filter((h) => h.status === 'AVAILABLE')
      .sort((a, b) => {
        if (a.turnsToday !== b.turnsToday) {
          return a.turnsToday - b.turnsToday;
        }
        return new Date(a.lastAvailableAt).getTime() - new Date(b.lastAvailableAt).getTime();
      });
  }

  /**
   * Calculate live serving status and overtime alerts for hostesses currently in rooms
   */
  public evaluateLiveStatus(
    hostess: Hostess,
    activeLog?: HostessSessionLog,
    currentTime: Date = new Date()
  ): HostessLiveStatus {
    if (hostess.status !== 'IN_ROOM' || !activeLog) {
      return {
        hostess,
        servingDurationMinutes: 0,
        isOvertime: false,
        overtimeExceededMinutes: 0,
        currentEstimatedFee: 0,
      };
    }

    const checkIn = new Date(activeLog.checkInTime);
    const elapsedMinutes = Math.max(0, Math.floor((currentTime.getTime() - checkIn.getTime()) / (1000 * 60)));
    const isOvertime = elapsedMinutes >= this.config.overtimeThresholdMinutes;
    const overtimeExceededMinutes = isOvertime ? elapsedMinutes - this.config.overtimeThresholdMinutes : 0;

    // Estimated fee: minimum session block or exact pro-rata
    const effectiveMinutes = Math.max(elapsedMinutes, this.config.minimumSessionMinutes);
    const currentEstimatedFee = Math.round((hostess.hourlyRate / 60) * effectiveMinutes);

    return {
      hostess,
      sessionLog: activeLog,
      servingDurationMinutes: elapsedMinutes,
      isOvertime,
      overtimeExceededMinutes,
      currentEstimatedFee,
    };
  }

  /**
   * Complete hostess session, calculate total fee and commission split
   */
  public calculateCheckout(
    log: HostessSessionLog,
    checkOutTime: Date,
    tipAmount: number = 0,
    commissionRateOverride?: number
  ): HostessSessionLog {
    const checkIn = new Date(log.checkInTime);
    const elapsedMs = Math.max(0, checkOutTime.getTime() - checkIn.getTime());
    const durationMinutes = Math.floor(elapsedMs / (1000 * 60));

    // Billable duration
    const effectiveMinutes = Math.max(durationMinutes, this.config.minimumSessionMinutes);
    const totalFee = Math.round((log.hourlyRate / 60) * effectiveMinutes);

    const commissionRate = commissionRateOverride ?? this.config.defaultCommissionRate;
    const hostessCommission = Math.round(totalFee * commissionRate) + tipAmount;
    const venueCommission = totalFee - Math.round(totalFee * commissionRate);

    return {
      ...log,
      checkOutTime: checkOutTime.toISOString(),
      durationMinutes,
      tipAmount,
      hostessCommission,
      venueCommission,
      totalFee: totalFee + tipAmount,
    };
  }
}
