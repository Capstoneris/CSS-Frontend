import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {AuthenticationService} from './_services';
import {WebsocketService} from '@app/_services/websocket.service';
import {Survey} from '@app/_models';
import {MatDialog} from '@angular/material/dialog';
import {SurveyDialogComponent} from '@app/survey-dialog/survey-dialog.component';

@Component({selector: 'app-root', templateUrl: 'app.component.html'})
export class AppComponent implements OnInit {
  loading = true;

  constructor(private router: Router,
              private dialog: MatDialog,
              public authenticationService: AuthenticationService,
              public websocketService: WebsocketService) {
  }

  ngOnInit() {
    this.authenticationService.restoreLogin().subscribe(() => {
      this.loading = false;
    }, () => {
      this.loading = false;
    });

    this.websocketService.listenForSurvey().subscribe(survey => this.showSurvey(survey));
  }

  logout() {
    this.authenticationService.logout().add(() => {
      this.router.navigate(['/login']);
    });
  }

  showSurvey(survey: Survey) {
    const dialogRef = this.dialog.open(SurveyDialogComponent, {
      width: '400px',
      disableClose: true,
      data: survey
    });

    dialogRef.afterClosed().subscribe(result => {
      this.websocketService.sendRatingAnswers(result);
    });
  }
}
