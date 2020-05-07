import {Component, OnInit} from '@angular/core';

import {User} from '@app/_models';
import {UserService} from '@app/_services';
import {WebsocketService} from '@app/_services/websocket.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({templateUrl: 'home.component.html'})
export class HomeComponent implements OnInit {
  loading = false;
  users: User[];

  constructor(private userService: UserService,
              private websocketService: WebsocketService,
              private route: ActivatedRoute,
              private router: Router,) {
  }

  ngOnInit() {
    // this.loading = true;
    // this.userService.getAll().pipe(first()).subscribe(users => {
    //   this.loading = false;
    //   this.users = users;
    // });
  }

  startSession() {
    this.websocketService.startSession();
  }

  gotoFormSite(){
    this.router.navigate(['/example-form']);
    console.log("BUTTON CLICKED....")
  }
}
