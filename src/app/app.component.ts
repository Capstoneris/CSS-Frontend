import {Component} from '@angular/core';
import {CustomerService} from './services/customer.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  customer: string = null;

  constructor(private customerService: CustomerService) {
  }

  getCustomerFromWebService() {
    this.customerService.getCustomer()
      .subscribe(response => {
        this.customer = response;
      }, err => {
        console.error(err);
      });
  }
}
