import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { NoRouteFoundComponent } from './no-route-found/no-route-found.component';
import { preloadingService } from './services/preloading.service';
import {AnnouncementComponent} from './announcement/announcement.component';
import {DashboardComponent} from './supervisor/dashboard/supervisor-dashboard.component';

export const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'supervisor/dashboard', component: DashboardComponent },
    { path: 'supervisor/announcement', component: AnnouncementComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'customers', data: { preload: true }, loadChildren: './chat-features/chat.module#ChatModule' },
    { path: '**', component: NoRouteFoundComponent }
];

@NgModule({

    imports: [
        RouterModule.forRoot(appRoutes, { preloadingStrategy: preloadingService }),
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
