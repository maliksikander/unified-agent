import { Component, OnInit } from "@angular/core";
import { Validators, FormControl, FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { appConfigService } from "../services/appConfig.service";
import { isLoggedInService } from "../services/isLoggedIn.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private _router: Router,
    private fb: FormBuilder,
    private _appConfigService: appConfigService,
    private _isLoggedInservice: isLoggedInService,
  ) {
    this.loginForm = this.fb.group({
      password: ["", [Validators.required]],
      username: ["", [Validators.required]]
    });
  }

  ngOnInit() {
    if (this._appConfigService.config.ENV == "development") {
      this._router.navigate(["customers"]);
    }
  }

  login() {
    this._isLoggedInservice.fetchCCuserAndMoveToLogin(this.loginForm.value);
  }

}
