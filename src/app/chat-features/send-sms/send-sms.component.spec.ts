import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendSmsComponent } from './send-sms.component';
import { httpService } from 'src/app/services/http.service';
import { cacheService } from 'src/app/services/cache.service';
import { sharedService } from 'src/app/services/shared.service';
import { MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder } from '@angular/forms';
import { snackbarService } from 'src/app/services/snackbar.service';

describe('SendSmsComponent', () => {
  //let component: SendSmsComponent;
  let fixture: SendSmsComponent;
  let _httpService: httpService;
  let _cacheService: cacheService;
  let _sharedService: sharedService;
  let _snackBar: MatSnackBar;
  let _translateService: TranslateService;
  let _FormBuilder:FormBuilder;
let _snackbarService: snackbarService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendSmsComponent ]
    })
    .compileComponents();
  }));

  // describe("testing create label validators", () => {
  //   beforeEach(() => {
  //     fixture = new SendSmsComponent(
  //       _snackBar,
  //       _httpService,
  //       _translateService,
  //       _snackbarService,
  //       _sharedService,
  //       _cacheService,
  //       _FormBuilder,
      

  //     );
  //   });

  // });

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(SendSmsComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  it('should create', () => {
    //expect(fixture).toBeTruthy();
  });
});
