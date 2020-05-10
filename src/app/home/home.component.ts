import {Component, OnInit} from '@angular/core';
import {UserService} from '@app/_services';
import {WebsocketService} from '@app/_services/websocket.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Group, User} from '@app/_models';

@Component({templateUrl: 'home.component.html'})
export class HomeComponent implements OnInit {
  startSessionForm: FormGroup;

  users: User[] = [
    {id: 1, username: 'Herbert'},
    {id: 2, username: 'Simon'},
    {id: 3, username: 'Hubertus'},
    {id: 4, username: 'Amir'}
  ];

  groupChoices: Group[] = [
    {id: 1, title: 'Admins'},
    {id: 2, title: 'Walmart'}
  ];

  constructor(private userService: UserService,
              private websocketService: WebsocketService,
              private route: ActivatedRoute,
              private router: Router,
              private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.startSessionForm = this.formBuilder.group({
      group: [null, Validators.required],
      message: ['', Validators.required],
      users: [null, Validators.required]
    });

    // this.loading = true;
    // this.userService.getAll().pipe(first()).subscribe(users => {
    //   this.loading = false;
    //   this.users = users;
    // });
  }

  startSession() {
    if (this.startSessionForm.invalid) {
      return;
    }

    const group = this.startSessionForm.controls.group.value;
    const message = this.startSessionForm.controls.message.value;
    const users = this.startSessionForm.controls.users.value;

    this.websocketService.startSession(group, message, users);
  }

  get userChoices(): User[] {
    const selectedGroupId = this.startSessionForm.controls.group.value;
    if (!selectedGroupId) {
      return [];
    }
    // TODO: Filter by group membership
    return this.users.filter(u => true);
  }
}
