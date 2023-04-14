import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { cacheService } from "./cache.service";
import { snackbarService } from "./snackbar.service";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  constructor(private router: Router, private _cacheService: cacheService, private snackbar: snackbarService) {}

  moveToAuthorizedResourceOnLogin() {
    try {
      // let ccUser: any = this._cacheService.agent;
      let routeCheck = false;
      let ccUser: any;
      ccUser = this._cacheService.agent;
      if (ccUser == undefined || ccUser == null || (ccUser && (ccUser.id == null || ccUser.id == undefined || ccUser.id == ""))) {
        ccUser = localStorage.getItem("ccUser");
        ccUser = JSON.parse(ccUser ? atob(ccUser) : null);
      }
      let resources: Array<any> = ccUser.permittedResources.Resources;
      // let conversationResourceIndex = resources.findIndex((item) => item.rsname.includes("conversation-view"));
      let conversationResourceIndex = 1;


      if (conversationResourceIndex != -1) {
        // let scopes: Array<any> = resources[conversationResourceIndex].scopes;
        // scopes.forEach((scope: any) => {
        //   if (scope == "view") {
            this.router.navigate(["/customers/chats"]);
        //     routeCheck = true;
        //   }
        // });
      } else {
        resources.forEach((item) => {
          if (item.rsname.includes("customer-schema")) {
            let scopes: Array<any> = item.scopes;
            scopes.forEach((scope: any) => {
              if (scope == "view") {
                this.router.navigate(["/customer-schema"]);
                routeCheck = true;
              }
            });
          } else if (item.rsname.includes("supervisor")) {
            let scopes: Array<any> = item.scopes;
            scopes.forEach((scope: any) => {
              if (scope == "view_all") {
                this.router.navigate(["/supervisor/dashboards"]);
                routeCheck = true;
              }
            });
          } else if (item.rsname.includes("subscribed")) {
            let scopes: Array<any> = item.scopes;
            scopes.forEach((scope: any) => {
              if (scope == "view") {
                this.router.navigate(["/subscribed-list"]);
                routeCheck = true;
              }
            });
          } else if (item.rsname == "customer-list") {
            let scopes: Array<any> = item.scopes;
            scopes.forEach((scope: any) => {
              if (scope == "view") {
                this.router.navigate(["/customers/phonebook"]);
                routeCheck = true;
              }
            });
          }
        });
        if (routeCheck == false) this.snackbar.open("Not Authorized to Access Resources", "err");
      }
    } catch (e) {
      console.log("[Navigation Error in Login] :", e);
    }
  }

  //to verify scope in permitted resource
  checkScope(resource, scope) {
    try {
      let ccUser: any;
      ccUser = this._cacheService.agent;
      if (ccUser == undefined || ccUser == null || (ccUser && (ccUser.id == null || ccUser.id == undefined || ccUser.id == ""))) {
        ccUser = localStorage.getItem("ccUser");
        ccUser = JSON.parse(ccUser ? atob(ccUser) : null);
      }
      if (ccUser != null) {
        let permittedResources: Array<any> = ccUser.permittedResources.Resources;

        for (let i = 0; i < permittedResources.length; i++) {
          if (permittedResources[i].rsname.trim()===resource.trim()) {
            let resourceScopes: Array<any> = permittedResources[i].scopes;
            for (let j = 0; j < resourceScopes.length; j++) {
              if (resourceScopes[j].trim() === scope.trim())
              { 
                return true;
              }
          }
          }
        }
      }
      return false;
    } catch (e) {
      console.error("[Scope Check Error] :", e);
      return false;
    }
  }
}
