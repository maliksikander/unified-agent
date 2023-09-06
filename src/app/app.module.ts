import { BrowserModule } from "@angular/platform-browser";
import { NgModule, APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule, HashLocationStrategy, LocationStrategy } from "@angular/common";
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
import { NgxUiLoaderModule, NgxUiLoaderHttpModule, NgxUiLoaderConfig, POSITION, SPINNER, PB_DIRECTION } from "ngx-ui-loader";
import { AgentAnnouncementsComponent } from "./announcement/agent-announcements/agent-announcements.component";
import { AnnouncementComponent } from "./announcement/announcement.component";
import { ConfirmationDialogComponent } from "./new-components/confirmation-dialog/confirmation-dialog.component";
import { SchemaSettingsComponent } from "./customer-schema/schema-settings/schema-settings.component";
import { CreateAttributeComponent } from "./customer-schema/create-attribute/create-attribute.component";
import { CustomerActionsComponent } from "./customer-actions/customer-actions.component";
import { EditAttributeComponent } from "./customer-schema/edit-attribute/edit-attribute.component";
import { columnPreferences } from "./column-preferences/column-preferences.component";
import { LabelsListComponent } from "./labels/labels-list/labels-list.component";
import { CreateLabelComponent } from "./labels/create-label/create-label.component";
import { SubscribedListComponent } from "./pull-mode/subscribed-list/subscribed-list.component";
import { SubscribedListPreviewComponent } from "./pull-mode/subscribed-list-preview/subscribed-list-preview.component";
import { FilePreviewComponent } from "./file-preview/file-preview.component";
import { LinkConversationDialogComponent } from "./dialogs/link-conversation-dialog/link-conversation-dialog.component";
import { environment } from "../environments/environment";
import { initializeApp } from "firebase/app";
import _configService from "../assets/config.json";
// import { ServiceWorkerModule } from '@angular/service-worker';
import { GrafanaComponent } from "./supervisor/grafana/grafana.component";
import { ActiveChatsComponent } from "./supervisor/active-chats/active-chats.component";
import { QueueChatsComponent } from "./supervisor/queue-chats/queue-chats.component";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { cacheService } from "./services/cache.service";
import { Observable,from } from "rxjs";
import { ActiveAgentDetailsComponent } from './supervisor/active-agent-details/active-agent-details.component';
import { CallControlsComponent } from './new-components/call-controls/call-controls.component';
import {SendSmsComponent, SendSmsSnackbarComponent} from './chat-features/send-sms/send-sms.component';
// import { ActiveChatsComponent } from "./supervisor/active-chats/active-chats.component";
// import { QueueChatsComponent } from "./supervisor/queue-chats/queue-chats.component";

// let pwaServiceWorkerDev = [
//   ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production, registrationStrategy: 'registerImmediately' })

// ];
console.log("V.1.0.1");

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  console.log("The device is mobile");
  // do not include ngsw-worker.js when device is mobile
  // pwaServiceWorkerDev = [];
} else {
  console.log("The device is pc");
  // initialize a server worker for FCM
  // initializeApp(environment.firebaseConfig);
}

initializeApp(environment.firebaseConfig);
export function appInitializerFactory(translate: TranslateService) {
  return () =>
    new Promise<any>((resolve: any) => {
      const langToSet = "en";
      translate.setDefaultLang("en");
      translate.use(langToSet).subscribe(
        () => {
          console.info(`Successfully initialized '${langToSet}' language.'`);
        },
        (err) => {
          console.error(`Problem with '${langToSet}' language initialization.'`);
        },
        () => {
          resolve(null);
        }
      );
    });
}

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  bgsType: SPINNER.chasingDots,
  bgsPosition: POSITION.centerCenter
};
// export class lazyTranslateLoader implements TranslateLoader {
//   getTranslation(lang: string): Observable<any> {
//     return from(import(`../assets/i18n/${lang}.json`));
//   }
// }

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}


@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AppComponent,
    LoginComponent,
    NoRouteFoundComponent,
    AppHeaderComponent,
    ChatNotificationsComponent,
    DashboardComponent,
    AnnouncementDialogComponent,
    PhonebookComponent,
    CreateCustomerComponent,
    AgentAnnouncementsComponent,
    ConfirmationDialogComponent,
    AnnouncementComponent,
    SchemaSettingsComponent,
    CreateAttributeComponent,
    CustomerActionsComponent,
    EditAttributeComponent,
    columnPreferences,
    LabelsListComponent,
    CreateLabelComponent,
    SubscribedListComponent,
    SubscribedListPreviewComponent,
    FilePreviewComponent,
    FilePreviewComponent,
    LinkConversationDialogComponent,
    GrafanaComponent,
    ActiveChatsComponent,
    QueueChatsComponent,
    ActiveAgentDetailsComponent,
    CallControlsComponent,
    SendSmsComponent,
    SendSmsSnackbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    BrowserAnimationsModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgxUiLoaderHttpModule.forRoot({
      exclude: [
        `${_configService.FILE_SERVER_URL}/api/downloadFileStream`,
        "/api/downloadFileStream",
        "/api/downloadFileStream?filename",
        `${_configService.CIM_REPORTING_URL}/queued-chats/detail`,
        `${_configService.CIM_REPORTING_URL}/queue-active-chats/detail`
      ]
    }),
    NgxUiLoaderHttpModule.forRoot({
      excludeRegexp: [
        `${_configService.FILE_SERVER_URL}/api/downloadFileStream`,
        "/api/downloadFileStream",
        `${_configService.CIM_REPORTING_URL}/queued-chats/detail`,
        `${_configService.CIM_REPORTING_URL}/queue-active-chats/detail`
      ]
    }),
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig)
    // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production, registrationStrategy: 'registerImmediately' })
  ],
  entryComponents: [
    EditAttributeComponent,
    CustomerActionsComponent,
    CreateAttributeComponent,
    CreateCustomerComponent,
    AnnouncementDialogComponent,
    ConfirmationDialogComponent,
    columnPreferences,
    CreateLabelComponent,
    FilePreviewComponent,
    LinkConversationDialogComponent,
    CallControlsComponent,
    SendSmsComponent,
    SendSmsSnackbarComponent
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    appConfigService,
    MessageService,
    TranslateService,
    ConfirmationService,
    {
      provide: APP_INITIALIZER,
      useFactory: (_appConfigService: appConfigService) => () => _appConfigService.loadConfig(),
      deps: [appConfigService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService],
      multi: true
    }
  ],
  exports: [BrowserModule, CommonModule, BrowserAnimationsModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
