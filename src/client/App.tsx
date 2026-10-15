import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { RoomGridView } from './components/RoomGridView';
import { HostessKanbanView } from './components/HostessKanbanView';
import { InventoryView } from './components/InventoryView';
import { OutboxView } from './components/OutboxView';
import { OpenRoomModal } from './components/OpenRoomModal';
import { OrderModal } from './components/OrderModal';
import { ReturnAuditModal } from './components/ReturnAuditModal';
import { TransferModal } from './components/TransferModal';
import { CheckoutModal } from './components/CheckoutModal';
import { Room, Hostess, MenuItem, OrderItem, OutboxSyncEvent, Invoice } from '../core/types';

export function App() {
  const [currentTab, setCurrentTab] = useState<'rooms' | 'hostesses' | 'inventory' | 'sync'>('rooms');

  // Core domain data states
  const [rooms, setRooms] = useState<any[]>([]);
  const [hostesses, setHostesses] = useState<any[]>([]);
  const [availableQueue, setAvailableQueue] = useState<Hostess[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [outboxEvents, setOutboxEvents] = useState<OutboxSyncEvent[]>([]);
  const [connectedClients, setConnectedClients] = useState<number>(1);
  const [isFlushing, setIsFlushing] = useState<boolean>(false);

  // Modal control states
  const [activeModal, setActiveModal] = useState<
    'OPEN_ROOM' | 'ORDER' | 'RETURN_AUDIT' | 'TRANSFER' | 'CHECKOUT' | null
  >(null);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [checkoutPreview, setCheckoutPreview] = useState<any | null>(null);

  // -------------------------------------------------------------
  // Data Fetching Functions
  // -------------------------------------------------------------
  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error('Failed to fetch rooms', err);
    }
  }, []);

  const fetchHostesses = useCallback(async () => {
    try {
      const res = await fetch('/api/hostesses');
      if (res.ok) {
        const data = await res.json();
        setHostesses(data.allHostesses || []);
        setAvailableQueue(data.availableQueue || []);
      }
    } catch (err) {
      console.error('Failed to fetch hostesses', err);
    }
  }, []);

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch menu', err);
    }
  }, []);

  const fetchOutbox = useCallback(async () => {
    try {
      const res = await fetch('/api/sync/outbox');
      if (res.ok) {
        const data = await res.json();
        setOutboxEvents(data);
      }
    } catch (err) {
      console.error('Failed to fetch outbox', err);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchRooms();
    fetchHostesses();
    fetchMenu();
    fetchOutbox();
  }, [fetchRooms, fetchHostesses, fetchMenu, fetchOutbox]);

  // Initial load & Periodic poll for timers
  useEffect(() => {
    refreshAll();
    const interval = setInterval(() => {
      fetchRooms();
      fetchHostesses();
    }, 5000); // 5s refresh for live timers & billing
    return () => clearInterval(interval);
  }, [refreshAll, fetchRooms, fetchHostesses]);

  // WebSocket Setup for Realtime LAN events
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'CONNECTED') {
            setConnectedClients(msg.payload?.clientCount || 1);
          } else {
            // Trigger refresh on any broadcasted state change
            refreshAll();
          }
        } catch (e) {
          console.error('WS parse error', e);
        }
      };
    } catch (e) {
      console.warn('WS connection failed, fallback to polling', e);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [refreshAll]);

  // -------------------------------------------------------------
  // Room Actions
  // -------------------------------------------------------------
  const handleOpenRoomConfirm = async (customerName: string, customerPhone: string) => {
    if (!selectedRoom) return;
    try {
      const res = await fetch(`/api/rooms/${selectedRoom.id}/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, customerPhone }),
      });
      if (res.ok) {
        setActiveModal(null);
        refreshAll();
      }
    } catch (err) {
      console.error('Failed to open room', err);
    }
  };

  const handleTogglePause = async (roomId: string) => {
    try {
      await fetch(`/api/rooms/${roomId}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      fetchRooms();
    } catch (err) {
      console.error('Failed to toggle pause', err);
    }
  };

  const handleTransferConfirm = async (targetRoomId: string) => {
    if (!selectedRoom) return;
    try {
      const res = await fetch(`/api/rooms/${selectedRoom.id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRoomId }),
      });
      if (res.ok) {
        setActiveModal(null);
        refreshAll();
      }
    } catch (err) {
      console.error('Failed to transfer room', err);
    }
  };

  const handleMarkClean = async (roomId: string) => {
    try {
      await fetch(`/api/rooms/${roomId}/clean`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      fetchRooms();
    } catch (err) {
      console.error('Failed to mark clean', err);
    }
  };

  // -------------------------------------------------------------
  // Hostess Actions
  // -------------------------------------------------------------
  const handleDispatchHostess = async (hostessId: string, roomId: string) => {
    try {
      const res = await fetch('/api/hostesses/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostessId, roomId }),
      });
      if (res.ok) {
        refreshAll();
      }
    } catch (err) {
      console.error('Failed to dispatch hostess', err);
    }
  };

  const handleCheckoutHostess = async (hostessId: string) => {
    try {
      const res = await fetch('/api/hostesses/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostessId, tipAmount: 0 }),
      });
      if (res.ok) {
        refreshAll();
      }
    } catch (err) {
      console.error('Failed to checkout hostess', err);
    }
  };

  const handleToggleHostessStatus = async (hostessId: string, newStatus: 'AVAILABLE' | 'OFF_DUTY') => {
    try {
      await fetch('/api/hostesses/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostessId, status: newStatus }),
      });
      fetchHostesses();
    } catch (err) {
      console.error('Failed to change hostess status', err);
    }
  };

  // -------------------------------------------------------------
  // Order & Return Audit Actions
  // -------------------------------------------------------------
  const handleOpenOrderModal = (room: any) => {
    setSelectedRoom(room);
    setActiveModal('ORDER');
  };

  const handleDispatchOrder = async (menuItemId: string, quantity: number) => {
    if (!selectedRoom?.currentSessionId) return;
    try {
      await fetch('/api/orders/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedRoom.currentSessionId,
          menuItemId,
          quantity,
        }),
      });
      refreshAll();
    } catch (err) {
      console.error('Failed to dispatch order', err);
    }
  };

  const handleOpenReturnAuditModal = async (room: any) => {
    setSelectedRoom(room);
    if (room.currentSessionId) {
      try {
        const res = await fetch(`/api/orders/${room.currentSessionId}`);
        if (res.ok) {
          const orders = await res.json();
          setCurrentOrderItems(orders);
          setActiveModal('RETURN_AUDIT');
        }
      } catch (err) {
        console.error('Failed to fetch orders for return audit', err);
      }
    }
  };

  const handleSubmitAudit = async (
    auditInputs: Array<{ orderItemId: string; returnedQty: number }>
  ) => {
    if (!selectedRoom?.currentSessionId) return;
    try {
      await fetch('/api/orders/audit-return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedRoom.currentSessionId,
          auditInputs,
        }),
      });
      refreshAll();
    } catch (err) {
      console.error('Failed to submit return audit', err);
    }
  };

  // -------------------------------------------------------------
  // Checkout & Invoicing Actions
  // -------------------------------------------------------------
  const handleOpenCheckoutModal = async (room: any) => {
    setSelectedRoom(room);
    try {
      const res = await fetch('/api/invoices/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setCheckoutPreview(data);
        setActiveModal('CHECKOUT');
      }
    } catch (err) {
      console.error('Failed to generate preview invoice', err);
    }
  };

  const handleConfirmCheckout = async (invoice: Invoice) => {
    if (!selectedRoom) return;
    try {
      const res = await fetch('/api/invoices/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: selectedRoom.id, invoice }),
      });
      if (res.ok) {
        setActiveModal(null);
        refreshAll();
      }
    } catch (err) {
      console.error('Failed to confirm checkout', err);
    }
  };

  // -------------------------------------------------------------
  // Cloud Sync Flush
  // -------------------------------------------------------------
  const handleFlushOutbox = async () => {
    setIsFlushing(true);
    try {
      await fetch('/api/sync/flush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      await fetchOutbox();
    } catch (err) {
      console.error('Failed to flush outbox', err);
    } finally {
      setIsFlushing(false);
    }
  };

  const pendingSyncCount = outboxEvents.filter((e) => e.status === 'PENDING').length;
  const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED');
  const availableRooms = rooms.filter((r) => r.status === 'AVAILABLE');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation & Status Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingSyncCount={pendingSyncCount}
        connectedClients={connectedClients}
        onRefresh={refreshAll}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'rooms' && (
          <RoomGridView
            rooms={rooms}
            onOpenRoom={(room) => {
              setSelectedRoom(room);
              setActiveModal('OPEN_ROOM');
            }}
            onOpenOrder={handleOpenOrderModal}
            onOpenReturnAudit={handleOpenReturnAuditModal}
            onOpenCheckout={handleOpenCheckoutModal}
            onTogglePause={handleTogglePause}
            onOpenTransfer={(room) => {
              setSelectedRoom(room);
              setActiveModal('TRANSFER');
            }}
            onMarkClean={handleMarkClean}
          />
        )}

        {currentTab === 'hostesses' && (
          <HostessKanbanView
            hostesses={hostesses}
            availableQueue={availableQueue}
            occupiedRooms={occupiedRooms}
            onDispatchHostess={handleDispatchHostess}
            onCheckoutHostess={handleCheckoutHostess}
            onToggleStatus={handleToggleHostessStatus}
          />
        )}

        {currentTab === 'inventory' && <InventoryView menuItems={menuItems} />}

        {currentTab === 'sync' && (
          <OutboxView
            events={outboxEvents}
            onFlush={handleFlushOutbox}
            isFlushing={isFlushing}
          />
        )}
      </main>

      {/* Modal Dialogs */}
      {activeModal === 'OPEN_ROOM' && selectedRoom && (
        <OpenRoomModal
          room={selectedRoom}
          onClose={() => setActiveModal(null)}
          onConfirm={handleOpenRoomConfirm}
        />
      )}

      {activeModal === 'ORDER' && selectedRoom && (
        <OrderModal
          room={selectedRoom}
          menuItems={menuItems}
          onClose={() => setActiveModal(null)}
          onDispatchOrder={handleDispatchOrder}
        />
      )}

      {activeModal === 'RETURN_AUDIT' && selectedRoom && (
        <ReturnAuditModal
          room={selectedRoom}
          orderItems={currentOrderItems}
          onClose={() => setActiveModal(null)}
          onSubmitAudit={handleSubmitAudit}
        />
      )}

      {activeModal === 'TRANSFER' && selectedRoom && (
        <TransferModal
          currentRoom={selectedRoom}
          availableRooms={availableRooms}
          onClose={() => setActiveModal(null)}
          onConfirmTransfer={handleTransferConfirm}
        />
      )}

      {activeModal === 'CHECKOUT' && selectedRoom && checkoutPreview && (
        <CheckoutModal
          room={selectedRoom}
          previewData={checkoutPreview}
          onClose={() => setActiveModal(null)}
          onConfirmCheckout={handleConfirmCheckout}
        />
      )}
    </div>
  );
}

export default App;
