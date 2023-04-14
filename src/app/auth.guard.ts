import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from "@angular/router";
import { Observable } from "rxjs";
import { cacheService } from "./services/cache.service";

@Injectable({
  providedIn: "root"
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private _cacheService: cacheService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let path: String = route.routeConfig.path;
    let ccUser: any = this._cacheService.agent;
    let resources: Array<any> = ccUser.permittedResources.Resources;
    let accessRoute: boolean = this.checkRouteAccess(path, resources);
    return accessRoute;
  }

  checkRouteAccess(path: String, resources: Array<any>) {
    try {
      let resource, scope;
      if (path.includes("schema")) {
        resource = "customer-schema";
        scope='view'
      }
      // else if (path.includes("dashboard")) {
      //   resource = "dashboard";
      // }
      else if (path.includes("supervisor")) {
        resource = "supervisor";
        scope='view_all';
      } else if (path.includes("subscribed")) {
        resource = "subscribed-list";
        scope='view'
      } else if (path.includes("phonebook")) {
        resource = "customer";
        scope='view'
      }
      else if (path.includes("label")) {
        resource = "customer-labels";
        scope="assign_label";
      }
  if(!scope)
  return true;
      let value = this.checkScope(resource, scope);
      

      return value;
    } catch (e) {
      console.log("[Route Access Error]:", e);
    }
  }

  // checkResource(path, resources) {
  //   try {
  //     for (let i = 0; i < resources.length; i++) {
  //       if (resources[i].rsname.includes(path)) {
  //         let resourceScopes: Array<any> = resources[i].scopes;
  //         for (let j = 0; j <= resourceScopes.length; j++) {
  //           if (resourceScopes[j] === "view") return true;
  //         }
  //       }
  //     }
  //     return false;
  //   } catch (e) {
  //     console.log("[Guard Resource Check Error]:", e);
  //   }
  // }

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
