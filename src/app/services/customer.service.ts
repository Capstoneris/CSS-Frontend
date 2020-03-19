import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  resourcePath: string = 'customer';

  constructor(private http: HttpClient) {
  }

  getCustomer() {
    return this.http.get(`${environment.baseRestURL}/${this.resourcePath}`, {responseType: 'text'});
  }
}
