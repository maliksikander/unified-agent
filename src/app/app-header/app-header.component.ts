import { Component, OnInit } from '@angular/core';
import { cacheService } from '../services/cache.service';
import { socketService } from '../services/socket.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnInit {
  agent = {
    state: 'READY',
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


  constructor(public _cacheService: cacheService, private _socketService: socketService) {

  }

  ngOnInit() {
  }

  changeState(state) {

    if (state == 0) {
      this._socketService.emit('changeAgentState', { "agentId": 'admin', "state": "NOT_READY" });
    }

    if (state == 1) {
      this._socketService.emit('changeAgentState', { "agentId": 'admin', "state": "READY" });
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
