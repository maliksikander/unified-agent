import { Component, OnInit, ViewChild } from "@angular/core";
import { cacheService } from "../services/cache.service";
import { sharedService } from "../services/shared.service";
import { socketService } from "../services/socket.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-header",
  templateUrl: "./app-header.component.html",
  styleUrls: ["./app-header.component.scss"]
})
export class AppHeaderComponent implements OnInit {
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
      name: "out of office",
      type: "LOGOUT"
    },
    {
      id: "ef172d24-7b35-4c6d-ada5-41827034d307",
      name: "enf of shift",
      type: "LOGOUT"
    },
    {
      id: "ef172d24-7b35-4c6d-ada5-41827034d308",
      name: "lunch break",
      type: "NOT_READY"
    },
    {
      id: "ef172d24-7b35-4c6d-ada5-41827034d309",
      name: "short break",
      type: "NOT_READY"
    },
    {
      id: "ef172d24-7b35-4c6d-ada5-41827034d301",
      name: "out of office",
      type: "NOT_READY"
    }
  ];

  changeLanguage = false;
  logoutReasonList = false;
  startTime: Date;
  stopTime: Date;
  active: boolean = false;
  get display() {
    return this.startTime && this.stopTime ? +this.stopTime - +this.startTime : 0;
  }

  timer() {
    if (this.active) {
      this.stopTime = new Date();
      setTimeout(() => {
        this.timer();
      }, 1000);
    }
  }

  constructor(
    private _router: Router,
    public _cacheService: cacheService,
    private _socketService: socketService,
    private _sharedService: sharedService
  ) {}

  ngOnInit() {
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

  reStartTimer() {
    this.startTime = new Date();
    this.stopTime = this.stopTime;
    this.active = true;
    this.timer();
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
  }
  logout() {
    sessionStorage.clear();
    localStorage.clear();
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
    localStorage.clear();
    sessionStorage.clear();
    this._cacheService.resetCache();
    this._socketService.socket.disconnect();
    this._router.navigate(["login"]).then(() => {
      window.location.reload();
    });
  }

  ngOnDestroy() {
    this.stateChangedSubscription.unsubscribe();
  }
  closeStateMenu(state) {
    setTimeout(() => {
      state.closeMenu();

    }, 100)
  }
}
