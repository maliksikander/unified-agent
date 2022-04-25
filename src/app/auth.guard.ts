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
    // console.log("Resources==>", resources);
    let accessRoute: boolean = this.checkRouteAccess(path, resources);
    return accessRoute;
  }

  checkRouteAccess(path: String, resources: Array<any>) {
    try {
      let resPath;
      if (path.includes("schema")) {
        resPath = "schema";
      } else if (path.includes("dashboard")) {
        resPath = "dashboard";
      } else if (path.includes("subscribed")) {
        resPath = "subscribed";
      } else if (path.includes("phonebook")) {
        resPath = "customer-list";
      } else if (path.includes("customers")) {
        resPath = "conversation";
      }
      let value = this.checkResource(resPath, resources);

      return value;
    } catch (e) {
      console.log("[Route Access Error]:", e);
    }
  }

  checkResource(path, resources) {
    try {
      for (let i = 0; i < resources.length; i++) {
        if (resources[i].rsname.includes(path)) {
          let resourceScopes: Array<any> = resources[i].scopes;
          for (let j = 0; j <= resourceScopes.length; j++) {
            if (resourceScopes[j] === "view") return true;
          }
        }
      }
      return false;
    } catch (e) {
      console.log("[Guard Resource Check Error]:", e);
    }
  }
}