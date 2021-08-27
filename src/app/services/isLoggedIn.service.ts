import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { appConfigService } from "./appConfig.service";
import { cacheService } from "./cache.service";
import { socketService } from "./socket.service";

@Injectable({
    providedIn: "root"
})
export class isLoggedInService {

    currentRoute;

    constructor(private _router: Router, private _appConfigService: appConfigService, private _socketService: socketService, private _cacheService: cacheService,) {

        if (this._appConfigService.config.ENV == "development") {
            this._cacheService.agent = {
                id: "8d42617c-0603-4fbe-9863-2507c0fff9fd",
                username: "nabeel",
                firstName: "nabeel",
                lastName: "ahmed",
                roles: []
            };
            this._socketService.connectToSocket();
        } else {

            if (this.currentRoute != "/login") {

                let ccUser: any = localStorage.getItem('ccUser');
                ccUser = JSON.parse(ccUser);

                if (ccUser && ccUser.id != null && ccUser.id != undefined && ccUser.id != "") {
                    this._cacheService.agent = ccUser;
                    this._socketService.connectToSocket();
                } else {
                    this._router.navigate(["login"]);
                }
            }

        }
    }






}