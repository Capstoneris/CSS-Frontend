import {Component, OnInit} from '@angular/core';
import {UserService} from '@app/_services';
import {WebsocketService} from '@app/_services/websocket.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Group, User} from '@app/_models';

@Component({templateUrl: 'home.component.html'})
export class HomeComponent implements OnInit {
  startSessionForm: FormGroup;

  users: User[];

  groupChoices: Group[];

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

    // TODO: still not fully functioning in the backend
    this.userService.sendGetUsersRequest().subscribe((data: any[])=>{
      console.log(data);
      this.users = data;
    })

    // TODO: still not fully functioning in the backend
    this.userService.sendGetGroupsForUserRequest().subscribe((data: any[])=>{
      console.log(data);
      this.groupChoices = data;
    })
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
