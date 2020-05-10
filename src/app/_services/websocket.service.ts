import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {environment} from '@environments/environment';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Group, User} from '@app/_models';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket;

  constructor(private snackBar: MatSnackBar) {
  }

  setupSocketConnection(authToken: string) {
    this.socket = io(environment.websocketUrl, {
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      this.login(authToken);
    });
    this.socket.on('error', (error: any) => {
      this.snackBar.open(`Socket Error ${error.status}: ${error.message}`, 'Dismiss', {
        duration: 3000
      });
    });
  }

  closeSocketConnection() {
    this.socket.disconnect();
  }

  private login(authToken: string) {
    this.socket.emit('login', {
      token: authToken
    });
  }

  startSession(group: Group, startMessage: string, users: User[]) {
    this.socket.emit('start-session', {
      timestamp: Date.now(),
      groupName: group.title,
      startMessageContent: startMessage,
      users
    });
  }
}
