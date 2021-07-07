import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

import { LoginComponent } from "./login/login.component";
import { NoRouteFoundComponent } from "./no-route-found/no-route-found.component";
import { preloadingService } from "./services/preloading.service";
import { DashboardComponent } from "./supervisor/dashboard/supervisor-dashboard.component";
import { PhonebookComponent } from "./phonebook/phonebook.component";
import { CreateLabelComponent } from "./new-components/create-label/create-label.component";
import { AnnouncementComponent } from "./announcement/announcement.component";
import { SchemaSettingsComponent } from "./customer-schema/schema-settings/schema-settings.component";

export const appRoutes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "customers/phonebook", component: PhonebookComponent },
  { path: "label", component: CreateLabelComponent },
  { path: "supervisor/dashboard", component: DashboardComponent },
  { path: "supervisor/announcement", component: AnnouncementComponent },
  { path: 'customer-schema', component: SchemaSettingsComponent },
  { path: "", redirectTo: "/login", pathMatch: "full" },
  { path: "customers", data: { preload: true }, loadChildren: "./chat-features/chat.module#ChatModule" },
  { path: "**", component: NoRouteFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { preloadingStrategy: preloadingService })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
