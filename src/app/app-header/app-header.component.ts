import { Component, OnInit } from '@angular/core';
import { cacheService } from '../services/cache.service';
import { sharedService } from '../services/shared.service';
import { socketService } from '../services/socket.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnInit {
  agent = {
    state: 'blbla',
    name: 'Bryan Miller',
    extension: 1126,
  };
  isConnected = true;
  languageFlag = 'en.png';
  languageName = 'English';
  languages = [
    { code: 'en', name: 'English', flag: 'en.png' },
    { code: 'fr', name: 'French', flag: 'fr.png' }
  ];

  startTime: Date;
  stopTime: Date;
  active: boolean = false
  get display() { return (this.startTime && this.stopTime) ? +this.stopTime - +this.startTime : 0 }

  timer() {
    if (this.active) {
      this.stopTime = new Date()
      setTimeout(() => {
        this.timer()
      }, 1000)
    }
  }

  constructor(public _cacheService: cacheService, private _socketService: socketService, private _sharedService : sharedService) {

  }

  ngOnInit() {
    
    this._sharedService.serviceCurrentMessage.subscribe((e) => {

      if (e.msg == 'stateChanged') {
        this.reStartTimer();
      }
    })
  }

  reStartTimer() {
    this.startTime = new Date()
    this.stopTime = this.stopTime
    this.active = true
    this.timer()
  }

  changeState(state) {

    if (state == 0) {
      this._socketService.emit('changeAgentState', { "agent": this._cacheService.agentDetails.agent, "state": "NOT_READY" });
    }

    if (state == 1) {
      this._socketService.emit('changeAgentState', { "agent": this._cacheService.agentDetails.agent, "state": "READY" });
    }

  }

  lang(lang) {

    let selectedLanguage = this.languages.find(r => r.code == lang);
    if (selectedLanguage !== undefined) {
      this.languageName = selectedLanguage.name;
      this.languageFlag = selectedLanguage.flag;
    }
  }

}
