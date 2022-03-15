import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

import { LoginComponent } from "./login/login.component";
import { NoRouteFoundComponent } from "./no-route-found/no-route-found.component";
import { preloadingService } from "./services/preloading.service";
import { PhonebookComponent } from "./phonebook/phonebook.component";
import { AnnouncementComponent } from "./announcement/announcement.component";
import { SchemaSettingsComponent } from "./customer-schema/schema-settings/schema-settings.component";
import { LabelsListComponent } from "./labels/labels-list/labels-list.component";
import { SubscribedListComponent } from "./pull-mode/subscribed-list/subscribed-list.component";
import { IsLoggedInGuard } from "./is-logged-in.guard";
import { GrafanaComponent } from "./supervisor/grafana/grafana.component";

export const appRoutes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "customers/phonebook", component: PhonebookComponent, canActivate: [IsLoggedInGuard] },
  { path: "label", component: LabelsListComponent, canActivate: [IsLoggedInGuard] },
  { path: "subscribed-list", component: SubscribedListComponent, canActivate: [IsLoggedInGuard] },
  { path: "supervisor/dashboards", component: GrafanaComponent, canActivate: [IsLoggedInGuard] },
  { path: "supervisor/announcement", component: AnnouncementComponent, canActivate: [IsLoggedInGuard] },
  { path: "customer-schema", component: SchemaSettingsComponent, canActivate: [IsLoggedInGuard] },
  { path: "", redirectTo: "/customers/chats", pathMatch: "full" },
  { path: "customers", data: { preload: true }, loadChildren: "./chat-features/chat.module#ChatModule", canActivate: [IsLoggedInGuard] },
  { path: "**", component: NoRouteFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { preloadingStrategy: preloadingService })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
