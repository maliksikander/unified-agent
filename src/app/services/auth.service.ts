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
      let ccUser: any = localStorage.getItem("ccUser");
      ccUser = JSON.parse(ccUser ? atob(ccUser) : null);
      let resources: Array<any> = ccUser.permittedResources.Resources;
      let item = resources[0];
      let conversationResource = resources.find((item) => item.rsname.includes("conversation"));
      // console.log("conver==>",conversationResource)

      if (conversationResource) {
        let scopes: Array<any> = item.scopes;
        scopes.forEach((scope: any) => {
          if (scope == "view") this.router.navigate(["/customers/chats"]);
        });
      } else {
        if (item.rsname.includes("schema")) {
          let scopes: Array<any> = item.scopes;
          scopes.forEach((scope: any) => {
            if (scope == "view") this.router.navigate(["/customer-schema"]);
          });
        } else if (item.rsname.includes("dashboard")) {
          let scopes: Array<any> = item.scopes;
          scopes.forEach((scope: any) => {
            if (scope == "view") this.router.navigate(["/supervisor/dashboards"]);
          });
        } else if (item.rsname.includes("subscribed")) {
          let scopes: Array<any> = item.scopes;
          scopes.forEach((scope: any) => {
            if (scope == "view") this.router.navigate(["/subscribed-list"]);
          });
        } else if (item.rsname.includes("phonebook")) {
          let scopes: Array<any> = item.scopes;
          scopes.forEach((scope: any) => {
            if (scope == "view") this.router.navigate(["/customers/phonebook"]);
          });
        } else {
          this.snackbar.open("Not Authorized to Access Resources", "err");
        }
      }
    } catch (e) {
      console.log("[Navigation Error in Login] :", e);
    }
  }

  //to verify scope in permitted resource
  checkScope(resource, scope) {
    try {
      let ccUser: any = localStorage.getItem("ccUser");
      ccUser = JSON.parse(ccUser ? atob(ccUser) : null);
      if (ccUser != null) {
        let permittedResources: Array<any> = ccUser.permittedResources.Resources;

        for (let i = 0; i < permittedResources.length; i++) {
          if (permittedResources[i].rsname.includes(resource)) {
            let resourceScopes: Array<any> = permittedResources[i].scopes;
            for (let j = 0; j <= resourceScopes.length; j++) {
              if (resourceScopes[j] === scope) return true;
            }
          }
        }
      }
      return false;
    } catch (e) {
      console.log("[Scope Check Error] :", e);
      return false;
    }
  }
}
