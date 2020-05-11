import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {AuthenticationService} from './_services';
import {WebsocketService} from '@app/_services/websocket.service';

@Component({selector: 'app-root', templateUrl: 'app.component.html'})
export class AppComponent implements OnInit {
  loading = true;

  constructor(private router: Router,
              public authenticationService: AuthenticationService,
              public websocketService: WebsocketService) {
  }

  ngOnInit() {
    this.authenticationService.restoreLogin().subscribe(() => {
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  logout() {
    this.authenticationService.logout().add(() => {
      this.router.navigate(['/login']);
    });
  }
}
