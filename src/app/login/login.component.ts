import { Component, OnInit } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { isLoggedInService } from "../services/isLoggedIn.service";
import { appConfigService } from "../services/appConfig.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hide = true;

  constructor(private _appConfigService: appConfigService, private fb: FormBuilder, private _isLoggedInservice: isLoggedInService) {
    this.loginForm = this.fb.group({
      password: ["", [Validators.required]],
      username: ["", [Validators.required]]
    });
  }

  ngOnInit() { }

  login() {
    this._isLoggedInservice.fetchCCuserAndMoveToLogin({ ...this.loginForm.value, isCiscoLogin: this._appConfigService.config.isCiscoEnabled }, this._appConfigService.config.isCiscoEnabled ? "3rdparty" : "");
  }
}
