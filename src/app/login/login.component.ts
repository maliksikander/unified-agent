import { Component, OnInit } from "@angular/core";
import { Validators,FormBuilder, FormGroup } from "@angular/forms";
import { isLoggedInService } from "../services/isLoggedIn.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _isLoggedInservice: isLoggedInService
  ) {
    this.loginForm = this.fb.group({
      password: ["", [Validators.required]],
      username: ["", [Validators.required]]
    });
  }

  ngOnInit() {

  }

  login() {
    this._isLoggedInservice.fetchCCuserAndMoveToLogin(this.loginForm.value);
  }

}
