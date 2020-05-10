import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {environment} from '@environments/environment';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Group, Invitation, User} from '@app/_models';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket;

  private invitationsSubject: BehaviorSubject<Invitation[]> = new BehaviorSubject<Invitation[]>([]);
  public readonly invitations: Observable<Invitation[]> = this.invitationsSubject.asObservable();

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
    this.socket.on('hello', (data: any) => {
      const invites: Invitation[] = data.invites;
      this.invitationsSubject.next(invites);
    });
    this.socket.on('invitation-list-update', (data:any) => {
      const invites: Invitation[] = data.invites;
      this.invitationsSubject.next(invites);
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
