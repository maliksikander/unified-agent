import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ChatsComponent } from "./chats/chats.component";
const appRoutes: Routes = [
  { path: "chats", component: ChatsComponent },
  { path: "", redirectTo: "/customers/chats", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule]
})
export class ChatRoutingModule {}
