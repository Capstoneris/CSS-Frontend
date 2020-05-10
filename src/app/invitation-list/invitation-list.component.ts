import {Component, OnInit} from '@angular/core';
import {Invitation} from '@app/_models';
import {WebsocketService} from '@app/_services/websocket.service';

@Component({
  selector: 'app-invitation-list',
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.scss']
})
export class InvitationListComponent implements OnInit {
  constructor(private websocketService:WebsocketService) {
  }

  ngOnInit(): void {
  }
}
