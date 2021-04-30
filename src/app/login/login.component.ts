import { Component, OnInit } from "@angular/core";
import { Validators, FormControl, FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material";
import { httpService } from "../services/http.service";
import { sharedService } from "../services/shared.service";
import { cacheService } from "../services/cache.service";
import { socketService } from "../services/socket.service";
import { appConfigService } from "../services/appConfig.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private _socketService: socketService,
    private _cacheService: cacheService,
    private _router: Router,
    private fb: FormBuilder,
    private _appConfigService: appConfigService,
    private _httpService: httpService,
    private _sharedService: sharedService
  ) {
    this.loginForm = this.fb.group({
      password: ["", [Validators.required]],
      username: ["", [Validators.required]]
    });
  }

  ngOnInit() {}

  login() {
    if (this._appConfigService.config.ENV == "development") {
      this._cacheService.agent = {
        id: "8d42617c-0603-4fbe-9863-2507c0fff9fd",
        username: "nabeel",
        firstName: "nabeel",
        lastName: "ahmed",
        roles: []
      };
      this._socketService.connectToSocket();
      this._router.navigate(["customers"]);
    } else {
      this._httpService.login(this.loginForm.value).subscribe(
        (e) => {
          console.log("this is login resp ", e.data);
          this._cacheService.agent = e.data;
          this._socketService.connectToSocket();
          this._router.navigate(["customers"]);
        },
        (error) => {
          this._sharedService.Interceptor(error.error, "err");
        }
      );
    }
  }
}
