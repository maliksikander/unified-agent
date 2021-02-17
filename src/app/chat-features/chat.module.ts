import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { ChatRoutingModule } from './chat-routing.module';

import { ChatsComponent } from './chats/chats.component';
import { InteractionsComponent } from './interactions/interactions.component';
import { CustomerInfoComponent } from './customer-info/customer-info.component';
import {PhonebookComponent} from '../phonebook/phonebook.component';
import {CreateCustomerComponent} from '../create-customer/create-customer.component';
import {SearchPipe} from '../search.pipe';
// import {DashboardComponent} from '../supervisor-dashboard/supervisor-dashboard.component';


@NgModule({
  declarations: [
    ChatsComponent,
    InteractionsComponent,
    CustomerInfoComponent,
    PhonebookComponent,
    CreateCustomerComponent,
    SearchPipe,
    // DashboardComponent
  ],
  imports: [
    SharedModule,
    ChatRoutingModule,
  ],
  entryComponents: [
    CreateCustomerComponent
  ]
})
export class ChatModule { }
