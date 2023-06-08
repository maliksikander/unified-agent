import { AppHeaderComponent } from "./app-header.component";
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from "@angular/material";
import { cacheService } from "src/app/services/cache.service";
import { sharedService } from "src/app/services/shared.service";
import { socketService } from "../services/socket.service";
import { CountupTimerService, countUpTimerConfigModel, timerTexts } from "ngx-timer";
import { Router } from "@angular/router";
import { finesseService } from "../services/finesse.service";
import { fcmService } from "../services/fcm.service";
import { httpService } from "../services/http.service";
import { snackbarService } from "../services/snackbar.service";
describe("Appheader component", () => {
  let countupTimerService: CountupTimerService;
  let _router: Router;
  let _socketService: socketService;
  let _finesseService: finesseService;
  let _fcmService: fcmService;
  let _httpService: httpService;
  let fixture: AppHeaderComponent;
  let _cacheService: cacheService;
  let _sharedService: sharedService;
  let _translateService: any
  let _sipService: any;
  let _appConfigService:any;

  // private countupTimerService: CountupTimerService,
    // private _router: Router,
    // public _cacheService: cacheService,
    // private _socketService: socketService,
    // private _sharedService: sharedService,
    // public _finesseService: finesseService,
    // public _sipService: SipService,
    // public _appConfigService:appConfigService,
    // private _fcmService: fcmService,
    // private _httpService: httpService,i
    // private _translateService: TranslateService
  let _snackBarService: any;
  let _announcementService:any;

  describe("testing create label validators", () => {
    beforeEach(() => {
      fixture = new AppHeaderComponent(
        countupTimerService,
        _router,
        _cacheService,
        _socketService,
        _sharedService,
        _finesseService,
        _sipService,
        _appConfigService,
        _fcmService,
        _httpService,
        _snackBarService,
        _translateService,
        _announcementService
      );
    });
    it("selectedReasonCode should be undefined on component initiation", () => {
      expect(fixture.selectedReasonCode).toBeUndefined();
    });
    it("selectedReasonCode should be lunch_break", () => {
      fixture.onChange("lunch_break");
      expect(fixture.selectedReasonCode).toEqual("lunch_break");
    });
  });
});
