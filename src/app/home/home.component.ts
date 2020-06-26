import {Component, OnInit} from '@angular/core';
import {AuthenticationService, UserService} from '@app/_services';
import {WebsocketService} from '@app/_services/websocket.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Group, User} from '@app/_models';

@Component({templateUrl: 'home.component.html'})
export class HomeComponent implements OnInit {
  startSessionForm: FormGroup;
  users: User[] = [];
  groupChoices: Group[] = [];

  constructor(private userService: UserService,
              private websocketService: WebsocketService,
              private authenticationService: AuthenticationService,
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

    this.userService.getAllUsersInMyGroups().subscribe((data) => {
      this.users = data;
    });

    this.userService.getMyGroups().subscribe((data) => {
      this.groupChoices = data;
    });
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

    // Filtering users list by users who are in the selected group
    return this.users.filter(u => u.username !== this.authenticationService.currentUserValue.username && u.groups.includes(selectedGroupId.id.toString()));
  }
}
