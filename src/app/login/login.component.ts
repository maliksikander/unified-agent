import { Component, OnInit } from '@angular/core';
import { Validators, FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { httpService } from '../services/http.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(private _httpService: httpService, private _router: Router, private fb: FormBuilder, public snackBar: MatSnackBar) {

    this.loginForm = this.fb.group({
      password: ['', [Validators.required]],
      username: ['', [Validators.required]],
    });

  }

  ngOnInit() {
  }

  login() {
    this._httpService.userAuthentication(this.loginForm.value).subscribe((e) => {
      this._router.navigate(['customers']);
    }, (error) => {
      console.log( JSON.stringify( error))
    })
  }
}
