import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {environment} from '@environments/environment';
import {User} from '@app/_models';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public get authToken(): string {
    // TODO
    return '';
  }

  login(username: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, {username, password})
      .pipe(map((user: User) => {
        // login successful
        this.currentUserSubject.next(user);
        return user;
      }));
  }

  logout() {
    return this.http.post<any>(`${environment.apiUrl}/auth/logout`, {})
      .subscribe(() => {
        // logout successful
        this.currentUserSubject.next(null);
      });
  }
}
