import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-interactions',
  templateUrl: './interactions.component.html',
  styleUrls: ['./interactions.component.scss']
})
export class InteractionsComponent implements OnInit {
  // tslint:disable-next-line:no-input-rename
  @Input('conversation') conversation: any;
  conversations = [];
  unidentified = true;
  isConnected = true;
  channelUrl = 'assets/images/web.svg';
  options: string[] = ['Glenn Helgass', ' Ev Gayforth', 'Adam Joe Stanler', 'Fayina Addinall', 'Doy Ortelt', 'Donnie Makiver', 'Verne West-Frimley', ' Ev Gayforth', 'Adam Joe Stanler', 'Fayina Addinall', 'Doy Ortelt', 'Donnie Makiver', 'Verne West-Frimley', 'Glenn Helgass', ' Ev Gayforth'];
  customer: any = {
    type: 'Customer',
    info: {
      channel: 'web',
      email: 'farhan.maqbool@expertflow.com',
      firstName: 'farhan',
      id: '',
      language: 'en',
      lastName: 'maqbool',
      name: 'farhan ',
      phone: '5555',
      refId: '5555',
      url: 'http://localhost:4200/',
    }
  };


  constructor() {
  }

  ngOnInit() {
  }

}
