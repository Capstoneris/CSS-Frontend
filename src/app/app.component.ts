import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {AuthenticationService} from './_services';
import {User} from './_models';
import {WebsocketService} from '@app/_services/websocket.service';

@Component({selector: 'app-root', templateUrl: 'app.component.html'})
export class AppComponent implements OnInit {
  currentUser: User;
  loading = true;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private  websocketService : WebsocketService
  ) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit() {
    this.authenticationService.restoreLogin().subscribe(() => {
      this.loading = false;
    }, () => {
      this.loading = false;
    });

    // listen to event from socket.io server
    // this.websocketService.listen('Test Event').subscribe((data) =>{
    //   console.log(data);
    // })

    // containing the connected socket object.
    this.websocketService.setupSocketConnection();
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
