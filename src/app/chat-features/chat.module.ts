import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { ChatRoutingModule } from './chat-routing.module';

import { ChatsComponent } from './chats/chats.component';
import { InteractionsComponent } from './interactions/interactions.component';
import { CustomerInfoComponent } from './customer-info/customer-info.component';
import {NgCircleProgressModule} from 'ng-circle-progress';
import {MatProgressSpinnerModule} from '@angular/material';


@NgModule({
  declarations: [
    ChatsComponent,
    InteractionsComponent,
    CustomerInfoComponent
  ],
  imports: [
    SharedModule,
    ChatRoutingModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: '#78C000',
      innerStrokeColor: '#3f51b5',//"#C7E596",
      animationDuration: 0,
    }),
  ],
})
export class ChatModule { }
