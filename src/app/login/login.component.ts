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
  // isCiscoLogin:boolean=false

  constructor(private fb: FormBuilder, private _isLoggedInservice: isLoggedInService, private _appConfigService: appConfigService) {
    this.loginForm = this.fb.group({
      password: ["", [Validators.required]],
      username: ["", [Validators.required]]
    });
  }

  ngOnInit() {}

  // setAll(checked:boolean)
  // {
  // this.isCiscoLogin=checked
  // }
  
  login() {
    this._isLoggedInservice.fetchCCuserAndMoveToLogin({...this.loginForm.value,isCiscoLogin:this._appConfigService.config.isCiscoEnabled}, this._appConfigService.config.isCiscoEnabled?"3rdparty":"");
  }
}
