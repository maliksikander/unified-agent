import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { appConfigService } from "./appConfig.service";
import { cacheService } from "./cache.service";
import { httpService } from "./http.service";
import { sharedService } from "./shared.service";
import { socketService } from "./socket.service";

@Injectable({
  providedIn: "root"
})
export class isLoggedInService {
  routeSubscriber: any;

  constructor(
    private _router: Router,
    private _appConfigService: appConfigService,
    private _socketService: socketService,
    private _cacheService: cacheService,
    private _httpService: httpService,
    private _sharedService: sharedService
  ) {
    this.cacheAgentFcmKey();

    this.routeSubscriber = this._router.events.subscribe((event: any) => {
      // we need to observe the route only on window load, thats why we unsubscibe it
      this.routeSubscriber.unsubscribe();

      // if the user opens login page then dont need to auto login
      if (event.url) {
        if (event.url != "/login") {
          this.autoLogin();
        }
      }
    });
  }

  cacheAgentFcmKey() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("fcm-key")) {
      this._cacheService.agentFcmkey = params.get("fcm-key");
    }
    console.log("FCM key in unifiedAgent " + params.get("fcm-key"));
  }

  autoFinesseLogin(params) {
    let username = decodeURIComponent(params.get("username"));
    let authToken = decodeURIComponent(params.get("authToken"));
    let password = decodeURIComponent(params.get("password"));
    let extension = decodeURIComponent(params.get("ext"));
    let authWithSSO = JSON.parse(decodeURIComponent(params.get("authWithSSO")));
    let obj = {
      username: username,
      password: authWithSSO == true ? authToken : password,
      authWithSSO: authWithSSO
    };
    this.fetchCCuserAndMoveToLogin(obj);
  }

  fetchCCuserAndMoveToLogin(obj: { username: string, password: string, authWithSSO?: boolean }) {
    this._httpService.login(obj).subscribe(
      (e) => {
        console.log("this is login resp ", e.data);

        this._cacheService.agent = e.data;
        try {
          sessionStorage.setItem("ccUser", JSON.stringify(e.data));
        } catch (e) { }
        this._socketService.disConnectSocket();
        this._socketService.connectToSocket();
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
        this._router.navigate(["login"]);
      }
    );
  }

  autoLogin() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("username") && params.has("authWithSSO") && params.has("ext") && (params.has("password") || params.has("authToken"))) {
      this.autoFinesseLogin(params);
      return;
    }
    let ccUser: any;
    try {
      ccUser = sessionStorage.getItem("ccUser");
    } catch (e) { }

    ccUser = JSON.parse(ccUser);

    if (ccUser && ccUser.id != null && ccUser.id != undefined && ccUser.id != "") {
      this._cacheService.agent = ccUser;
      this._socketService.connectToSocket();
    } else {
      this._router.navigate(["login"]);
    }
  }
}
