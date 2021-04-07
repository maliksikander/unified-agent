import { BrowserModule } from "@angular/platform-browser";
import { NgModule, APP_INITIALIZER } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppRoutingModule } from "./app-routing.module";

import { LoginComponent } from "./login/login.component";
import { AppComponent } from "./app.component";
import { NoRouteFoundComponent } from "./no-route-found/no-route-found.component";
import { AppHeaderComponent } from "./app-header/app-header.component";
import { SharedModule } from "./shared/shared.module";
import { appConfigService } from "./services/appConfig.service";
import { ChatNotificationsComponent } from "./notifications/chat-notifications/chat-notifications.component";
import { ConfirmationService, MessageService } from "primeng/api";
import { DashboardComponent } from "./supervisor/dashboard/supervisor-dashboard.component";
import { AnnouncementDialogComponent } from "./supervisor/announcement-dialog/announcement-dialog.component";
import { PhonebookComponent } from "./phonebook/phonebook.component";
import { CreateCustomerComponent } from "./create-customer/create-customer.component";
import { NgxUiLoaderModule, NgxUiLoaderHttpModule, NgxUiLoaderConfig, POSITION, SPINNER, PB_DIRECTION } from 'ngx-ui-loader';

const ngxUiLoaderConfig: NgxUiLoaderConfig = {

  bgsType: SPINNER.chasingDots,
  bgsPosition: POSITION.centerCenter,

};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NoRouteFoundComponent,
    AppHeaderComponent,
    ChatNotificationsComponent,
    DashboardComponent,
    AnnouncementDialogComponent,
    PhonebookComponent,
    CreateCustomerComponent
  ],
  imports: [BrowserModule, AppRoutingModule, CommonModule, BrowserAnimationsModule, SharedModule, NgxUiLoaderHttpModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),],
  entryComponents: [AnnouncementDialogComponent, CreateCustomerComponent],
  providers: [
    appConfigService,
    MessageService,
    ConfirmationService,
    {
      provide: APP_INITIALIZER,
      useFactory: (_appConfigService: appConfigService) => () => _appConfigService.loadConfig(),
      deps: [appConfigService],
      multi: true
    }
  ],
  exports: [BrowserModule, CommonModule, BrowserAnimationsModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
