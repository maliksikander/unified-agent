import { Component, OnInit, ViewChild } from "@angular/core";
import { cacheService } from "../services/cache.service";
import { sharedService } from "../services/shared.service";
import { socketService } from "../services/socket.service";
import { MatSidenav } from "@angular/material";

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
  isConnected = true;
  changeLanguageCode = 'en';
  languageFlag = "en.png";
  languageName = "English";
  languages = [
    { code: "en", name: "English", flag: "en.png" },
    { code: "fr", name: "French", flag: "fr.png" }
  ];
  logoutReasons = [
    'Done for the day',
    'Vacation',
    'Work Travel',
    'Attend a Meeting',
    'System Issue',
    'Training',
    'Not Feeling Well',
    'Shift Ended',
    'Done for the day',
    'Vacation'
  ];


  llp = {
    "agent": {
      "participantType": "CCUser",
      "id": "8d42617c-0603-4fbe-9863-2507c0fff9fd",
      "keycloakUser": {
        "id": "8d42617c-0603-4fbe-9863-2507c0fff9fd",
        "firstName": "Nabeel",
        "lastName": "Ahmad",
        "username": "nabeel",
        "permittedResources": {
          "Resources": [
            {
              "rsid": "e6c56b53-e53e-41b1-8d85-1101172f3029",
              "rsname": "Default Resource"
            }
          ]
        },
        "roles": [
          "agent",
          "customer-manager",
          "offline_access",
          "uma_authorization"
        ],
        "realm": "university"
      },
      "associatedRoutingAttributes": [

      ]
    },
    "state": {
      "name": "READY",
      "reasonCode": "NONE"
    },
    "stateChangeTime": 1623892004029,
    "agentMrdStates": [
      {
        "mrd": {
          "id": "124564313",
          "name": "CHAT"
        },
        "state": {
          "name": "LOGOUT",
          "reasonCode": "NONE"
        },
        "stateChangeTime": 1623892003737
      }
    ]
  }


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

  constructor(public _cacheService: cacheService, private _socketService: socketService, private _sharedService: sharedService) { }

  ngOnInit() {
    this._sharedService.serviceCurrentMessage.subscribe((e) => {
      if (e.msg == "stateChanged") {
        this.reStartTimer();
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
      this._socketService.emit("changeAgentState", { agentId: this._cacheService.agent.id, action: "agentState", state: { name: "NOT_READY", reasonCode: "" } });
    }

    if (state == 1) {
      this._socketService.emit("changeAgentState", { agentId: this._cacheService.agent.id, action: "agentState", state: { name: "READY", reasonCode: "" } });
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
    this.logoutReasonList = true;

  }

  changeMRD(event, agentMrdState) {

    this._socketService.emit("changeAgentState", { agentId: this._cacheService.agent.id, action: "agentMRDState", state: event.checked == true ? 'READY' : 'NOT_READY', mrdId: agentMrdState.mrd.id });

  }

  close() { }
}
