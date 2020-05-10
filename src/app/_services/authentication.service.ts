import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

import {environment} from '@environments/environment';
import {User} from '@app/_models';
import {WebsocketService} from '@app/_services/websocket.service';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
  private readonly LOCAL_STORAGE_JWT = 'jwt';

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  public authToken: string;

  constructor(private http: HttpClient, private websocketService: WebsocketService) {
    this.currentUserSubject = new BehaviorSubject<User>(null);
    this.currentUser = this.currentUserSubject.asObservable();

    this.authToken = localStorage.getItem(this.LOCAL_STORAGE_JWT);
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  restoreLogin() {
    return this.http.get<any>(`${environment.apiUrl}/auth`)
      .pipe(catchError(err => {
        this.currentUserSubject.next(null);
        return throwError(err);
      }))
      .pipe(map(result => {
        const user: User = result.user;
        this.currentUserSubject.next(user);

        this.websocketService.setupSocketConnection(this.authToken);

        return user;
      }));
  }

  login(username: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, {username, password})
      .pipe(map(result => {
        // login successful
        const user: User = result.user;
        const token: string = result.token;
        localStorage.setItem(this.LOCAL_STORAGE_JWT, token);

        this.authToken = token;
        this.currentUserSubject.next(user);

        this.websocketService.setupSocketConnection(this.authToken);

        return user;
      }));
  }

  logout() {
    return this.http.post(`${environment.apiUrl}/auth/logout`, null)
      .subscribe(() => {
        // logout successful
        this.websocketService.closeSocketConnection();
        this.currentUserSubject.next(null);
        localStorage.removeItem(this.LOCAL_STORAGE_JWT);
        this.authToken = null;
      });
  }
}
