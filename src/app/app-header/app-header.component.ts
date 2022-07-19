import { Component, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { cacheService } from "../services/cache.service";
import { sharedService } from "../services/shared.service";
import { socketService } from "../services/socket.service";
import { CountupTimerService, countUpTimerConfigModel, timerTexts } from "ngx-timer";
import { Router } from "@angular/router";
import { finesseService } from "../services/finesse.service";
import { fcmService } from "../services/fcm.service";
import { httpService } from "../services/http.service";

@Component({
  selector: "app-header",
  templateUrl: "./app-header.component.html",
  styleUrls: ["./app-header.component.scss"]
})
export class AppHeaderComponent implements OnInit {
  @ViewChild("stateTrigger", { static: false }) stateTrigger: any;
  @Output() themeSwitcher = new EventEmitter<any>();

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
  languages = [
    { code: "en", name: "English", flag: "en.png" },
    { code: "fr", name: "French", flag: "fr.png" }
  ];
  reasonCodes = [
    {
      id: "ef172d24-7b35-4c6d-ada5-41827034d306",
      name: "Out of Office",
      type: "LOGOUT"
    },
    {
      id: "ef172d24-7b35-4c6d-ada5-41827034d307",
      name: "End of Shift",
      type: "LOGOUT"
    },
    {
      id: "ef172d24-7b35-4c6d-ada5-41827034d308",
      name: "Lunch Break",
      type: "NOT_READY"
    },
    {
      id: "ef172d24-7b35-4c6d-ada5-41827034d309",
      name: "Short Break",
      type: "NOT_READY"
    },
    {
      id: "ef172d24-7b35-4c6d-ada5-41827034d301",
      name: "Out of Office",
      type: "NOT_READY"
    }
  ];
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
    private _httpService: httpService
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
    if (this._cacheService.agent.id) {
      this._httpService.getUserTheme(this._cacheService.agent.id).subscribe(
        (e) => {
          if (e.theme == "dark") {
            this.themeSwitch();
          }
        },
        (error) => {
          console.log("error getting user theme", error);
        }
      );
    }
    // if (localStorage.getItem('darkTheme')) {
    //   this.isdarkMode = true;
    // }
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
      this._socketService.emit("changeAgentState", {
        agentId: this._cacheService.agent.id,
        action: "agentState",
        state: { name: "NOT_READY", reasonCode: state }
      });
    }
  }

  lang(lang) {
    let selectedLanguage = this.languages.find((r) => r.code == lang);
    if (selectedLanguage !== undefined) {
      this.languageName = selectedLanguage.name;
      this.languageFlag = selectedLanguage.flag;
      this.changeLanguageCode = lang;
    }
  }

  updateLanguage() {
    this.changeLanguage = true;
    this.stateView = false;
  }
  async logout() {
    await this._fcmService.deleteFcmToken();
    try {
      sessionStorage.clear();
      localStorage.removeItem("ccUser");
    } catch (e) {}
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

  onChange(reason) {
    this.selectedReasonCode = reason;
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

  themeSwitch() {
    this.isdarkMode = !this.isdarkMode;
    this.themeSwitcher.emit(this.isdarkMode);
  }
}
