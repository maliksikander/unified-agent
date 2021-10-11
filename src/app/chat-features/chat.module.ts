import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { ChatRoutingModule } from './chat-routing.module';

import { ChatsComponent } from './chats/chats.component';
import { InteractionsComponent } from './interactions/interactions.component';
import { CustomerInfoComponent } from './customer-info/customer-info.component';
import {MatDialogModule} from '@angular/material';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {AgmCoreModule} from '@agm/core';
import {VgCoreModule} from 'videogular2/compiled/src/core/core';
import {VgControlsModule} from 'videogular2/compiled/src/controls/controls';


@NgModule({
  declarations: [
    ChatsComponent,
    InteractionsComponent,
    CustomerInfoComponent
  ],
  imports: [
    SharedModule,
    ChatRoutingModule,
    MatDialogModule,
    PerfectScrollbarModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyA_dm2C9FEp26nXSEjfN9G76juYi-CtiLE'
    }),
    VgCoreModule,
    VgControlsModule,
  ],
})
export class ChatModule { }
