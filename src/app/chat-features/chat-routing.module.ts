import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatsComponent } from './chats/chats.component';
import {PhonebookComponent} from '../phonebook/phonebook.component';
import {DashboardComponent} from '../supervisor/dashboard/supervisor-dashboard.component';

const appRoutes: Routes = [

    { path: 'chats', component: ChatsComponent },
    { path: 'phonebook', component: PhonebookComponent },
    // { path: 'supervisor', component: DashboardComponent },
    { path: '', redirectTo: '/customers/chats', pathMatch: 'full' },
    { path: 'phonebook', redirectTo: '/customers/phonebook', pathMatch: 'full' },
    // { path: 'supervisor', redirectTo: '/supervisor', pathMatch: 'full' },
];

@NgModule({

    imports: [
        RouterModule.forChild(appRoutes),
    ],
    exports: [RouterModule]
})
export class ChatRoutingModule {
}
