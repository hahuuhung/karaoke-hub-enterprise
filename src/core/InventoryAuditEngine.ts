/**
 * Karaoke Hub Enterprise - Inventory & Return Audit Engine
 * Handles F&B dispatching, return item auditing (auto-restock for unopened items),
 * and dynamic VietQR payload generation.
 */

import { MenuItem, OrderItem, Invoice, PaymentMethod } from './types';

export interface AuditItemInput {
  orderItemId: string;
  returnedQty: number; // Items returned unopened/unconsumed
}

export interface AuditResult {
  updatedOrderItems: OrderItem[];
  restockManifest: Array<{ menuItemId: string; restockQty: number }>;
  totalFnbCharge: number;
}

export interface VietQRConfig {
  bankId: string;      // e.g. "MB" or "970422"
  accountNo: string;   // e.g. "0999999999"
  accountName: string; // e.g. "KARAOKE HUB ENTERPRISE"
  template: string;    // e.g. "compact2" or "qr_only"
}

export const DEFAULT_VIETQR_CONFIG: VietQRConfig = {
  bankId: 'MB',
  accountNo: '0999999999',
  accountName: 'KARAOKE HUB ENTERPRISE',
  template: 'compact2',
};

export class InventoryAuditEngine {
  private qrConfig: VietQRConfig;

  constructor(qrConfig: Partial<VietQRConfig> = {}) {
    this.qrConfig = { ...DEFAULT_VIETQR_CONFIG, ...qrConfig };
  }

  /**
   * Process "Kiểm đồ trả lại" - Audit returned unopened goods
   * Calculates actual consumed items and prepares inventory restock quantities.
   */
  public auditReturnedItems(
    orderItems: OrderItem[],
    auditInputs: AuditItemInput[]
  ): AuditResult {
    const inputMap = new Map(auditInputs.map((i) => [i.orderItemId, i.returnedQty]));
    const restockManifest: Array<{ menuItemId: string; restockQty: number }> = [];
    let totalFnbCharge = 0;

    const updatedOrderItems = orderItems.map((item) => {
      const returned = inputMap.get(item.id) ?? item.returnedQty;
      // Clamped to not exceed dispatched quantity
      const validReturned = Math.min(item.dispatchedQty, Math.max(0, returned));
      const consumed = Math.max(0, item.dispatchedQty - validReturned);
      const total = consumed * item.unitPrice;

      // Calculate newly returned delta for restocking
      const deltaRestock = validReturned - item.returnedQty;
      if (deltaRestock > 0) {
        restockManifest.push({
          menuItemId: item.menuItemId,
          restockQty: deltaRestock,
        });
      }

      totalFnbCharge += total;

      return {
        ...item,
        returnedQty: validReturned,
        consumedQty: consumed,
        totalPrice: total,
      };
    });

    return {
      updatedOrderItems,
      restockManifest,
      totalFnbCharge,
    };
  }

  /**
   * Compile final invoice
   */
  public generateInvoice(
    sessionId: string,
    roomName: string,
    checkInTime: string,
    checkOutTime: string,
    totalMinutes: number,
    roomCharge: number,
    fnbCharge: number,
    hostessCharge: number,
    discountAmount: number = 0,
    vatRate: number = 0.08, // 8% VAT
    paymentMethod: PaymentMethod = 'VIETQR',
    customerName?: string
  ): Invoice {
    const subtotal = Math.max(0, roomCharge + fnbCharge + hostessCharge - discountAmount);
    const vatAmount = Math.round(subtotal * vatRate);
    const finalAmount = subtotal + vatAmount;

    const invoiceCode = `INV-${Date.now().toString().slice(-6)}`;

    return {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      roomSessionId: sessionId,
      invoiceCode,
      roomName,
      customerName,
      checkInTime,
      checkOutTime,
      totalRoomMinutes: totalMinutes,
      roomCharge,
      fnbCharge,
      hostessCharge,
      discountAmount,
      vatRate,
      vatAmount,
      finalAmount,
      paymentMethod,
      isPaid: false,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generate dynamic VietQR image URL & deep link via vietqr.io Napas247 standard
   */
  public generateVietQRUrl(amount: number, description: string): string {
    const cleanDesc = encodeURIComponent(description.replace(/[^a-zA-Z0-9 ]/g, ''));
    return `https://img.vietqr.io/image/${this.qrConfig.bankId}-${this.qrConfig.accountNo}-${this.qrConfig.template}.png?amount=${amount}&addInfo=${cleanDesc}&accountName=${encodeURIComponent(this.qrConfig.accountName)}`;
  }
}
