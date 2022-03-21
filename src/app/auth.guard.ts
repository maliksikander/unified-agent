import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from "@angular/router";
import { Observable } from "rxjs";
import { cacheService } from "./services/cache.service";

@Injectable({
  providedIn: "root"
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private _cacheService: cacheService) {}

  canActivate(
    // next: ActivatedRouteSnapshot,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let path: String = route.routeConfig.path;
    let ccUser: any = this._cacheService.agent;
    let resources: Array<any> = ccUser.permittedResources.Resources;
    console.log("Resources==>", resources);
    // console.log("path==>", path);
    // let local: String = localStorage.getItem("token");
    // let session: String = sessionStorage.getItem("token");
    // this.checkTokenExistenceInStorage(local, session);
    let accessRoute: boolean = this.checkRouteAccess(path, resources);
    // console.log("acccess==>", accessRoute);
    return accessRoute;
    // return true;
  }

  checkRouteAccess(path: String, resources: Array<any>) {
    try {
      // console.log("ty")
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
      // else if (path.includes("web")) {
      //   resPath = "web";
      // } else if (path.includes("channel")) {
      //   resPath = "channel";
      // } else if (path.includes("routing")) {
      //   resPath = "routing";
      // } else if (path.includes("calendar")) {
      //   resPath = "calendar";
      // }
      // console.log("respath==>", resPath);
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
