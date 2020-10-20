import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { ChatRoutingModule } from './chat-features/chat-routing.module';
import { ChatModule } from './chat-features/chat.module';

import { LoginComponent } from './login/login.component';
import { AppComponent } from './app.component';
import { NoRouteFoundComponent } from './no-route-found/no-route-found.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NoRouteFoundComponent
  ],
  imports: [
    BrowserModule,
    ChatRoutingModule,
    AppRoutingModule,
    ChatModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
