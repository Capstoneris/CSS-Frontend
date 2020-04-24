import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

import {AppComponent} from './app.component';
import {appRoutingModule} from './app.routing';

import {ErrorInterceptor} from './_helpers';
import {HomeComponent} from './home';
import {LoginComponent} from './login';
import {WebsocketService} from '@app/_services/websocket.service';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    appRoutingModule
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    WebsocketService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
