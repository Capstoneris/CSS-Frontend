import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {environment} from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket;

  constructor() {
  }

  setupSocketConnection(authToken: string) {
    this.socket = io(environment.websocketUrl, {
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      this.login(authToken);
    });
    this.socket.on('error', (data: string) => {
      console.log(data);
    });
  }

  closeSocketConnection() {
    this.socket.disconnect();
  }

  private login(authToken: string) {
    this.socket.emit('login', {
      token: authToken+'a'
    });
  }

  startSession() {
    this.socket.emit('start-sessions', {});
  }
}
