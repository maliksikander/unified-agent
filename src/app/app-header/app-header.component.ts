import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { cacheService } from "../services/cache.service";
import { sharedService } from "../services/shared.service";
import { socketService } from "../services/socket.service";
import { CountupTimerService, countUpTimerConfigModel, timerTexts } from "ngx-timer";
import { Router } from "@angular/router";
import { finesseService } from "../services/finesse.service";
import { fcmService } from "../services/fcm.service";
import { httpService } from "../services/http.service";
import { snackbarService } from "src/app/services/snackbar.service";


@Component({
  selector: "app-header",
  templateUrl: "./app-header.component.html",
  styleUrls: ["./app-header.component.scss"]
})
export class AppHeaderComponent implements OnInit,AfterViewInit {
  @ViewChild("stateTrigger", { static: false }) stateTrigger: any;
  @Output() themeSwitcher = new EventEmitter<any>();
  @Output() languageSwitcher = new EventEmitter<any>();

  isdarkMode = false;

  agent = {
    state: "ready",
    name: "Bryan Miller",
    extension: 1126
  };
  selectedReasonCode;
  selected;
  stateChangedSubscription;
  isConnected = true;
  changeLanguageCode = "en";
  languageFlag = "en.png";
  languageName = "English";
  languages :
    { _id:string, code: string, name: string, flag: string }[]
  reasonCodes=[];
;
  changeLanguage = false;
  logoutReasonList = false;
  stateView = true;
  // startTime: Date;
  // stopTime: Date;
  // active: boolean = false;
  timerConfigs;
  // get display() {
  //   return this.startTime && this.stopTime ? +this.stopTime - +this.startTime : 0;
  // }

  // timer() {
  //   if (this.active) {
  //     this.stopTime = new Date();
  //     setTimeout(() => {
  //       this.timer();
  //     }, 1000);
  //   }
  // }

  constructor(
    private countupTimerService: CountupTimerService,
    private _router: Router,
    public _cacheService: cacheService,
    private _socketService: socketService,
    private _sharedService: sharedService,
    public _finesseService: finesseService,
    private _fcmService: fcmService,
    private _httpService: httpService,
    private _snackBarService: snackbarService
  ) {}

  ngOnInit() {
    this.timerConfigs = new countUpTimerConfigModel();
    this.timerConfigs.timerTexts = new timerTexts();
    this.timerConfigs.timerTexts.hourText = ":"; //default - hh
    this.timerConfigs.timerTexts.minuteText = ":"; //default - mm
    this.timerConfigs.timerTexts.secondsText = " "; //default - ss
    this.timerConfigs.timerClass = "state-timer";
    this.stateChangedSubscription = this._sharedService.serviceCurrentMessage.subscribe((e: any) => {
      if (e.msg == "stateChanged") {
        if (e.data.state.name.toLowerCase() == "logout") {
          this.moveToLogin();
        } else if (this._cacheService.agentPresence.state.name == null) {
          this.reStartTimer();
        } else if (this._cacheService.agentPresence.stateChangeTime != e.data.stateChangeTime) {
          this.reStartTimer();
        }
        this._cacheService.agentPresence = e.data;
      }
    });

  }
  ngAfterViewInit()
  {
    this.getSupportedLanguages();
    this.getReasonCodes();
  }
  getReasonCodes()
  {
    this._httpService.getReasonCodes().subscribe(
      (e) => {
        this.reasonCodes = e;
      },
      (err) => {
        this._snackBarService.open("Error Getting Reason Codes","err");
        console.error("error getting reason codes", err);
      }
    );
  }
  getSupportedLanguages()
  {
    this._httpService.getSupportedLanguages().subscribe(
      (e) => {
        this.languages = e[0].supportedLanguages;
        this.getAgentSettings();
      },
      (error) => {
        this._snackBarService.open("Error Getting Supported Languages","err");
        console.error("error getting supported languages", error);
      }
    );
  }
  getAgentSettings()
  {
    if (this._cacheService.agent.id) {
      this._httpService.getAgentSettings(this._cacheService.agent.id).subscribe(
        (e) => {
          if (e.theme == "dark") {
            this.themeSwitch(true);
          }
          this.setAgentPreferedlanguage(e.language);
        },
        (error) => {
          this._snackBarService.open("Error Getting Agent Settings","err");
          console.error("error getting agent settings", error);
        }
      );
    }
  }

  reStartTimer() {
    // this.startTime = new Date();
    // this.stopTime = this.stopTime;
    // this.active = true;
    // this.timer();
    this.countupTimerService.stopTimer();
    this.countupTimerService.startTimer();
  }

  changeState(state) {
    if (state == 0) {
      this._socketService.emit("changeAgentState", {
        agentId: this._cacheService.agent.id,
        action: "agentState",
        state: { name: "NOT_READY", reasonCode: null }
      });
    } else if (state == 1) {
      this._socketService.emit("changeAgentState", {
        agentId: this._cacheService.agent.id,
        action: "agentState",
        state: { name: "READY", reasonCode: null }
      });
    } else {
      console.log("state",state)
      this._socketService.emit("changeAgentState", {
        agentId: this._cacheService.agent.id,
        action: "agentState",
        state: { name: "NOT_READY", reasonCode: state }
      });
    }
  }
  setAgentPreferedlanguage(languageCode) {
    let selectedLanguage = this.languages.find((r) => r.code == languageCode);
    if (selectedLanguage !== undefined) {
      this.languageName = selectedLanguage.name;
      this.languageFlag = selectedLanguage.flag;
      this.changeLanguageCode = languageCode;
      this.changeAgentDeskLanguage(languageCode);
    } else {
      selectedLanguage = this.languages.find((r) => r.code == "en");
      this.languageName = selectedLanguage.name;
      this.languageFlag = selectedLanguage.flag;
      this.changeLanguageCode = languageCode;
      try {
        this._httpService.updateAgentSettings({ language: "en" }, this._cacheService.agent.id).subscribe((e) => {});
      } catch (err) {
        this._snackBarService.open("Error Updating Agent Settings","err");
        console.error(`error updating language`, err);
      }
    }
  }

  lang(languageCode) {
    let selectedLanguage = this.languages.find((r) => r.code == languageCode);
    if (selectedLanguage !== undefined) {
      this.languageName = selectedLanguage.name;
      this.languageFlag = selectedLanguage.flag;
      this.changeLanguageCode = languageCode;
      this.changeAgentDeskLanguage(languageCode);
      try {
        this._httpService.updateAgentSettings({ language: languageCode }, this._cacheService.agent.id).subscribe((e) => {});
      } catch (err) {
        this._snackBarService.open("Error Updating Agent Settings","err");
        console.error(`error updating theme`, err);
      }
    }
  }

  updateLanguage() {
    this.changeLanguage = true;
    this.stateView = false;
  }
  async logout() {
    await this._fcmService.deleteFcmToken();
    try {
      window['dataLayer'].push({
        'event': 'logout',
        'data': {
          'message': 'Agent Logged Out Successfully'
        }});
      sessionStorage.clear();
      localStorage.removeItem("ccUser");
    } catch (e) {
      window['dataLayer'].push({
        'event': 'error',
        'data': {
          'message': 'error on logout request',
          'error' : e.error
        }});

    }

    this._socketService.emit("changeAgentState", {
      agentId: this._cacheService.agent.id,
      action: "agentState",
      state: { name: "LOGOUT", reasonCode: this.selectedReasonCode }
    });
  }

  changeMRD(event, agentMrdState) {
    this._socketService.emit("changeAgentState", {
      agentId: this._cacheService.agent.id,
      action: "agentMRDState",
      state: event.checked == true ? "READY" : "NOT_READY",
      mrdId: agentMrdState.mrd.id
    });
  }

  close() {}

  onChange(reason,e) {
    if(e.checked)
    {
      this.selectedReasonCode = reason;
    }
    else
    {
      this.selectedReasonCode=undefined;
    }
  }

  moveToLogin() {
    try {
      sessionStorage.clear();
      localStorage.removeItem("ccUser");
    } catch (e) {}

    this._cacheService.resetCache();
    this._socketService.socket.disconnect();
    this._router.navigate(["login"]).then(() => {
      window.location.reload();
    });
  }

  ngOnDestroy() {
    this.stateChangedSubscription.unsubscribe();
  }
  closeStateMenu(e) {
    setTimeout(() => {
      this.stateTrigger.closeMenu();
    }, 200);
  }
//if onlySwitch flag true it will only switch the theme otherwise it will switch and also and update the theme in agentSettings
  themeSwitch(onlySwitch) {
    this.isdarkMode = !this.isdarkMode;
    this.themeSwitcher.emit({ isdarkMode: this.isdarkMode, onlySwitch: onlySwitch });
  }
  changeAgentDeskLanguage(languageCode) {
    this.languageSwitcher.emit({ language: languageCode});
  }
}
