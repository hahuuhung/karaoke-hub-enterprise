import { WebSocket } from 'ws';
import { logger } from './logger';

export interface WSMessage {
  type: 'ROOM_UPDATE' | 'HOSTESS_UPDATE' | 'ORDER_UPDATE' | 'SYNC_STATUS' | 'CONNECTED';
  payload: any;
  timestamp: string;
}

export class WebSocketHub {
  private clients: Set<WebSocket> = new Set();

  public registerClient(socket: WebSocket) {
    this.clients.add(socket);
    logger.info({ clientCount: this.clients.size }, 'New WebSocket client connected');

    socket.send(
      JSON.stringify({
        type: 'CONNECTED',
        payload: { clientCount: this.clients.size, message: 'Connected to Karaoke Hub LAN Sync' },
        timestamp: new Date().toISOString(),
      })
    );

    socket.on('close', () => {
      this.clients.delete(socket);
      logger.info({ clientCount: this.clients.size }, 'WebSocket client disconnected');
    });

    socket.on('error', (err) => {
      logger.error({ err }, 'WebSocket client error');
      this.clients.delete(socket);
    });
  }

  public broadcast(type: WSMessage['type'], payload: any) {
    const msg: WSMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
    const data = JSON.stringify(msg);

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  public getConnectedCount(): number {
    return this.clients.size;
  }
}

export const wsHub = new WebSocketHub();
