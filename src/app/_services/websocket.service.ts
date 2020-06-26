import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {environment} from '@environments/environment';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ChatMessage, Group, InputfieldState, Invitation, Session, Survey, User} from '@app/_models';
import {BehaviorSubject, Observable, Subscriber} from 'rxjs';
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

  private sessionChatMessagesSubject: BehaviorSubject<ChatMessage[]> = new BehaviorSubject<ChatMessage[]>([]);
  public readonly sessionChatMessages: Observable<ChatMessage[]> = this.sessionChatMessagesSubject.asObservable();

  private surveySubscriber: Subscriber<Survey>;

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
      this.sessionChatMessagesSubject.next(data.chatHistory);
      this.router.navigate(['/example-form']);
    });
    this.socket.on('session-left', () => {
      this.router.navigate(['/']);
      this.currentSessionSubject.next(null);
      this.sessionMembersSubject.next([]);
      this.sessionChatMessagesSubject.next([]);
    });
    this.socket.on('member-list-update', (data: any) => {
      const members: User[] = data.users;
      this.sessionMembersSubject.next(members);
    });
    this.socket.on('chat-message', (data: any) => {
      this.sessionChatMessagesSubject.next(this.sessionChatMessagesSubject.getValue().concat([data.message]));
    });
    this.socket.on('rating-questions', data => this.surveySubscriber.next(data));
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

  sendChatMessage(sentBy: User, message: string) {
    this.socket.emit('send-chat-message', {
      message: {
        sentBy,
        message,
        timestamp: Date.now()
      }
    });
  }

  sendRatingAnswers(data: any) {
    this.socket.emit('rating-answers', {
      message: data
    });
  }

  listenForInputfieldChanges() {
    return new Observable<{ user: User, state: InputfieldState }>(subscriber => {
      this.socket.on('inputfield-changed', data => subscriber.next(data));
    });
  }

  listenForSurvey() {
    // Remember the survey subscriber because the socket might not have been established yet.
    return new Observable<Survey>(subscriber => this.surveySubscriber = subscriber);
  }
}
