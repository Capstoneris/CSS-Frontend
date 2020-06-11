import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {environment} from '@environments/environment';
import {User} from '@app/_models';

@Injectable({providedIn: 'root'})
export class UserService {
  constructor(private http: HttpClient) {
  }

  getAll() {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  public sendGetUsersRequest(){
    return this.http.get(`${environment.apiUrl}/users`);
  }

  public sendGetGroupsForUserRequest(){
    return this.http.get(`${environment.apiUrl}/users/in-my-group`);
  }
}
