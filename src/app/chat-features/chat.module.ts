import { NgModule } from "@angular/core";

import { SharedModule } from "../shared/shared.module";
import { ChatRoutingModule } from "./chat-routing.module";

import { ChatsComponent } from "./chats/chats.component";
import { InteractionsComponent } from "./interactions/interactions.component";
import { CustomerInfoComponent } from "./customer-info/customer-info.component";
import { AppModule } from "../app.module";

@NgModule({
  declarations: [ChatsComponent, InteractionsComponent, CustomerInfoComponent],
  imports: [SharedModule, ChatRoutingModule]
})
export class ChatModule {}
