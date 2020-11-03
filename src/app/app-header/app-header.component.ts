import {Component, OnInit} from '@angular/core';

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
    {code: 'en', name: 'English', flag: 'en.png'},
    {code: 'fr', name: 'French', flag: 'fr.png'}
  ];




  constructor() {
  }

  ngOnInit() {
  }

  lang(lang) {

    let selectedLanguage = this.languages.find(r => r.code == lang);
    if (selectedLanguage !== undefined) {
      this.languageName = selectedLanguage.name;
      this.languageFlag = selectedLanguage.flag;
    }
  }

}
