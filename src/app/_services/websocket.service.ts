import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {environment} from '@environments/environment';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Group, InputfieldState, Invitation, User} from '@app/_models';
import {BehaviorSubject, Observable} from 'rxjs';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket;

  private invitationsSubject: BehaviorSubject<Invitation[]> = new BehaviorSubject<Invitation[]>([]);
  public readonly invitations: Observable<Invitation[]> = this.invitationsSubject.asObservable();

  constructor(private snackBar: MatSnackBar, private router: Router) {
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
      const invitations: Invitation[] = data.invitations;
      this.invitationsSubject.next(invitations);
    });
    this.socket.on('invitation-list-update', (data: any) => {
      const invitations: Invitation[] = data.invitations;
      this.invitationsSubject.next(invitations);
    });
    this.socket.on('session-started', () => {
      this.router.navigate(['/example-form']);
    });
    this.socket.on('session-joined', () => {
      this.router.navigate(['/example-form']);
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

  startSession(group: Group, message: string, users: User[]) {
    this.socket.emit('start-session', {
      timestamp: Date.now(),
      group,
      message,
      users,
      inputfieldStates: [] // TODO
    });
  }

  joinSession(host: User) {
    this.socket.emit('join-session', {
      host
    });
  }

  sendInputfieldInteraction(fieldId: string, changed: boolean, oldValue: string, newValue: string, selectionStart: number,
                            selectionEnd: number) {
    this.socket.emit('inputfield-interaction', {
      fieldId,
      changed,
      oldValue: changed ? oldValue : '',
      newValue: changed ? newValue : '',
      selectionStart,
      selectionEnd
    });
  }

  listenForInputfieldChanges() {
    return new Observable<{ user: User, state: InputfieldState }>(subscriber => {
      this.socket.on('inputfield-changed', data => subscriber.next(data));
    });
  }
}
