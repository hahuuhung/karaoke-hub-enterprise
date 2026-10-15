import { describe, it, expect } from 'vitest';
import { InventoryAuditEngine } from '../src/core/InventoryAuditEngine';
import { OrderItem } from '../src/core/types';

describe('InventoryAuditEngine', () => {
  const engine = new InventoryAuditEngine({
    bankId: 'MB',
    accountNo: '0999999999',
    accountName: 'KARAOKE HUB ENTERPRISE',
    template: 'compact2',
  });

  const sampleOrderItems: OrderItem[] = [
    {
      id: 'ord-1',
      roomSessionId: 'sess-1',
      menuItemId: 'item-beer-tiger',
      name: 'Bia Tiger Crystal',
      unit: 'Lon',
      dispatchedQty: 24,
      returnedQty: 0,
      consumedQty: 24,
      unitPrice: 30000,
      totalPrice: 720000,
      dispatchedAt: '2026-10-15T12:00:00Z',
    },
    {
      id: 'ord-2',
      roomSessionId: 'sess-1',
      menuItemId: 'item-water',
      name: 'Nước suối Aquafina',
      unit: 'Chai',
      dispatchedQty: 6,
      returnedQty: 0,
      consumedQty: 6,
      unitPrice: 15000,
      totalPrice: 90000,
      dispatchedAt: '2026-10-15T12:00:00Z',
    },
  ];

  it('audits returned unopened items and calculates restock quantities correctly', () => {
    // Return 8 beers and 4 water bottles
    const auditInputs = [
      { orderItemId: 'ord-1', returnedQty: 8 },
      { orderItemId: 'ord-2', returnedQty: 4 },
    ];

    const result = engine.auditReturnedItems(sampleOrderItems, auditInputs);

    // Beer: 24 dispatched - 8 returned = 16 consumed @ 30k = 480k
    const beerItem = result.updatedOrderItems.find((i) => i.id === 'ord-1');
    expect(beerItem?.returnedQty).toBe(8);
    expect(beerItem?.consumedQty).toBe(16);
    expect(beerItem?.totalPrice).toBe(480000);

    // Water: 6 dispatched - 4 returned = 2 consumed @ 15k = 30k
    const waterItem = result.updatedOrderItems.find((i) => i.id === 'ord-2');
    expect(waterItem?.returnedQty).toBe(4);
    expect(waterItem?.consumedQty).toBe(2);
    expect(waterItem?.totalPrice).toBe(30000);

    // Total F&B = 480k + 30k = 510k
    expect(result.totalFnbCharge).toBe(510000);

    // Restock manifest
    expect(result.restockManifest).toEqual([
      { menuItemId: 'item-beer-tiger', restockQty: 8 },
      { menuItemId: 'item-water', restockQty: 4 },
    ]);
  });

  it('generates invoice with VAT, discount, and correct grand total', () => {
    const invoice = engine.generateInvoice(
      'sess-1',
      'VIP 02',
      '2026-10-15T12:00:00Z',
      '2026-10-15T14:30:00Z',
      150, // 2h30m
      450000, // room charge
      510000, // fnb charge
      700000, // hostess charge
      100000, // 100k discount
      0.08,   // 8% VAT
      'VIETQR',
      'Anh Minh'
    );

    // Subtotal = 450,000 + 510,000 + 700,000 - 100,000 = 1,560,000
    // VAT 8% = 124,800
    // Final Amount = 1,684,800
    expect(invoice.roomCharge).toBe(450000);
    expect(invoice.discountAmount).toBe(100000);
    expect(invoice.vatAmount).toBe(124800);
    expect(invoice.finalAmount).toBe(1684800);
    expect(invoice.isPaid).toBe(false);
  });

  it('generates valid dynamic VietQR Napas247 URL', () => {
    const qrUrl = engine.generateVietQRUrl(1684800, 'KTVIP02 THANHTOAN');
    expect(qrUrl).toContain('https://img.vietqr.io/image/MB-0999999999-compact2.png');
    expect(qrUrl).toContain('amount=1684800');
    expect(qrUrl).toContain('addInfo=KTVIP02%20THANHTOAN');
  });
});
