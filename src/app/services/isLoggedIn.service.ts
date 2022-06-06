import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { cacheService } from "./cache.service";
import { fcmService } from "./fcm.service";
import { finesseService } from "./finesse.service";
import { httpService } from "./http.service";
import { sharedService } from "./shared.service";
import { snackbarService } from "./snackbar.service";
import { socketService } from "./socket.service";

@Injectable({
  providedIn: "root"
})
export class isLoggedInService {
  routeSubscriber: any;

  constructor(
    private _router: Router,
    private _socketService: socketService,
    private _cacheService: cacheService,
    private _httpService: httpService,
    private _sharedService: sharedService,
    private _finesseService: finesseService,
    private _fcmService: fcmService,
    private ngxService: NgxUiLoaderService,
    private _snackbarService: snackbarService,
  ) {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this._cacheService.isMobileDevice = true;
    } else {
      this._cacheService.isMobileDevice = false;
    }

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
    // let roles = JSON.parse(decodeURIComponent(params.get("roles")));
    // let finesseUrl = decodeURIComponent(params.get("finesseUrl"));
    let authWithSSO = JSON.parse(decodeURIComponent(params.get("authWithSSO")));
    let obj = {
      username: username,
      // roles: roles,
      // finesseUrl: finesseUrl ? finesseUrl : "",
      password: authWithSSO == true ? "" : password,
      authToken: authWithSSO == true ? "" : authToken,
      authWithSSO: authWithSSO
    };

    this.fetchCCuserAndMoveToLogin(obj);
    this._finesseService.finesseAgent.extention = extension;
    this._finesseService.finesseAgent.loginId = username;
    this._finesseService.finesseAgent.password = password;
    console.log("finesse user login ", obj);
    this._finesseService.initMe();
  }

  fetchCCuserAndMoveToLogin(obj: { username: string; password: string; authWithSSO?: boolean }) {
    this._httpService.login(obj).subscribe(
      (e) => {
        console.log("this is login resp ", e.data);

        this._cacheService.agent = e.data.keycloak_User;
        try {
          localStorage.setItem("ccUser", btoa(JSON.stringify(e.data.keycloak_User)));
        } catch (e) {}
        this._socketService.disConnectSocket();
        this.validateFcmKeyAndConnectToSocket();
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
      ccUser = localStorage.getItem("ccUser");
    } catch (e) {}

    ccUser = JSON.parse(ccUser ? atob(ccUser) : null);

    if (ccUser && ccUser.id != null && ccUser.id != undefined && ccUser.id != "") {
      this._cacheService.agent = ccUser;
      this.validateFcmKeyAndConnectToSocket();
    } else {
      this._router.navigate(["login"]);
    }
  }

  async validateFcmKeyAndConnectToSocket() {
    this.ngxService.start();

    // if (this._cacheService.isMobileDevice) {

    //   // for a mobile device the fcm is coming from url
    //   this._socketService.connectToSocket();

    // } else {

    // for a pc device the fcm is created by the agent-gadget it-self
    try {
      await this._fcmService.requestPermission();
      this._socketService.connectToSocket();
    } catch (err) {
      this._snackbarService.open("you will not receive browser notifications", "err");
      this._socketService.connectToSocket();
    }

    // }
  }
}
