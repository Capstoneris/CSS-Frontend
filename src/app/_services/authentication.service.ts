import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

import {environment} from '@environments/environment';
import {User} from '@app/_models';
import {CookieService} from 'ngx-cookie-service';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.currentUserSubject = new BehaviorSubject<User>(null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public get authToken(): string {
    return this.cookieService.get('css-jwt');
  }

  restoreLogin() {
    return this.http.get(`${environment.apiUrl}/auth`)
      .pipe(catchError(err => {
        this.currentUserSubject.next(null);
        return throwError(err);
      }))
      .pipe(map((user: User) => {
        this.currentUserSubject.next(user);
        return user;
      }));
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
    return this.http.post(`${environment.apiUrl}/auth/logout`, null)
      .subscribe(() => {
        // logout successful
        this.currentUserSubject.next(null);
      });
  }
}
