import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {environment} from '@environments/environment';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Group, InputfieldState, Invitation, Session, User} from '@app/_models';
import {BehaviorSubject, Observable} from 'rxjs';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket;

  private currentSessionSubject: BehaviorSubject<Session> = new BehaviorSubject<Session>(null);
  public readonly currentSession: Observable<Session> = this.currentSessionSubject.asObservable();

  private invitationsSubject: BehaviorSubject<Invitation[]> = new BehaviorSubject<Invitation[]>([]);
  public readonly invitations: Observable<Invitation[]> = this.invitationsSubject.asObservable();

  private sessionMembersSubject: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  public readonly sessionMembers: Observable<User[]> = this.sessionMembersSubject.asObservable();

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
      this.currentSessionSubject.next({isOwn: true, host: null});
      this.router.navigate(['/example-form']);
    });
    this.socket.on('session-joined', (data: any) => {
      this.currentSessionSubject.next({isOwn: false, host: data.host});
      this.router.navigate(['/example-form']);
    });
    this.socket.on('session-left', () => {
      this.router.navigate(['/']);
      this.currentSessionSubject.next(null);
      this.sessionMembersSubject.next([]);
    });
    this.socket.on('member-list-update', (data: any) => {
      const members: User[] = data.users;
      this.sessionMembersSubject.next(members);
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

  kickMember(member: User) {
    this.socket.emit('kick-member', {
      member
    });
  }

  leaveSession() {
    this.socket.emit('leave-session', {});
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
