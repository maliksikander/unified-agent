import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { ChatsComponent } from './chat-features/chats/chats.component';

export const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'chats', component: ChatsComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
   
    imports: [
        RouterModule.forRoot(appRoutes),
    ],
     exports: [RouterModule]
})
export class AppRoutingModule {
}
