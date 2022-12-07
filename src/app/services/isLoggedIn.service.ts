import { Injectable } from "@angular/core";
import { Location } from "@angular/common";

import {  Router } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { cacheService } from "./cache.service";
import { fcmService } from "./fcm.service";
import { finesseService } from "./finesse.service";
import { httpService } from "./http.service";
import { sharedService } from "./shared.service";
import { snackbarService } from "./snackbar.service";
import { socketService } from "./socket.service";
import { TranslateService } from "@ngx-translate/core";
import { AuthService } from "./auth.service";

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
    private _location: Location,
    private _translateService:TranslateService,
    private _authService: AuthService,
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
    console.log("finesse auto==>")
    let username = decodeURIComponent(params.get("username"));
    let authToken = decodeURIComponent(params.get("authToken"));
    let password = decodeURIComponent(params.get("password"));
    let extension = decodeURIComponent(params.get("ext"));
    let authWithSSO = JSON.parse(decodeURIComponent(params.get("authWithSSO")));
    let roles = JSON.parse(decodeURIComponent(params.get("roles")));
    let finesseUrl = decodeURIComponent(params.get("finesseUrl"));

    let obj = {
      username: username,
      roles: roles,
      finesseUrl: finesseUrl ? finesseUrl : "",
      password: authWithSSO == true ? "" : password,
      authToken: authWithSSO == true ? authToken : "",
      authWithSSO: authWithSSO
    };
    // console.log("finesse user login==> ", obj);
    this.fetchCCuserAndMoveToLogin(obj,"3rdparty");
    this._finesseService.finesseAgent.extension = extension;
    this._finesseService.finesseAgent.loginId = username;
    // this._finesseService.finesseAgent.password = password;
    this._finesseService.finesseAgent.password = authWithSSO == true ? authToken : password;
    this._finesseService.finesseAgent.isSSOUser = authWithSSO;
    this._finesseService.initMe();
  }

  fetchCCuserAndMoveToLogin(obj,loginType) {
    this._httpService.login(obj).subscribe(
      (e) => {
        window['dataLayer'].push({
          'event': 'login',
          'data': {
            'agent_name': e.data.keycloak_User.username,
            'message': this._translateService.instant('Agent-Logged-In-Successfully')
          }});

        console.log("this is login resp ==>", e.data);

        this._cacheService.agent = e.data.keycloak_User;

        if(loginType == "3rdparty")
        {
          console.log("finesse auto 12==>")
        this._finesseService.checkActiveTasks(e.data.keycloak_User.id);
        }
        // this._finesseService.checkActiveTasks(e.data.keycloak_User.id);



        try {
          localStorage.setItem("ccUser", btoa(JSON.stringify(e.data.keycloak_User)));
        } catch (e) {}
        this._socketService.disConnectSocket();
        this.validateFcmKeyAndConnectToSocket(false);
      },
      (error) => {
        window['dataLayer'].push({
          'event': 'error',
          'data': {
            'message': this._translateService.instant('snackbar.error-on-login-request'),
            'error' : error.error
          }});

        this._sharedService.Interceptor(error.error, "err");
        this._router.navigate(["login"]);
      }
    );
  }

  autoLogin() {
    console.log("uto ogin")
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
      this.validateFcmKeyAndConnectToSocket(params);
    } else {
      this._router.navigate(["login"]);
    }
  }

  async validateFcmKeyAndConnectToSocket(params) {
    this.ngxService.start();
    this._authService.moveToAuthorizedResourceOnLogin();



    // if (this._cacheService.isMobileDevice) {

    //   // for a mobile device the fcm is coming from url
    //   this._socketService.connectToSocket();

    // } else {

    // for a pc device the fcm is created by the agent-gadget it-self
    try {
      const url = this._location.path();
      await this._fcmService.requestPermission();
      if (url.includes("/active-chats")) {
        this._router.navigate([`supervisor/active-chats`]);
      } else if (url.includes("/queue-chats")) {
        this._router.navigate([`supervisor/queue-chats`]); // pass queue id
      }
      this._socketService.connectToSocket();
    } catch (err) {
      this._snackbarService.open(this._translateService.instant('snackbar.you-will-not-receive-browser-notifications'), "err");
      this._socketService.connectToSocket();
    }

    // }
  }
}
