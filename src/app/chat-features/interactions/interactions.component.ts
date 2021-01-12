import { Component, Input, OnInit } from '@angular/core';
import { cacheService } from 'src/app/services/cache.service';
import { sharedService } from 'src/app/services/shared.service';
import { socketService } from 'src/app/services/socket.service';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-interactions',
  templateUrl: './interactions.component.html',
  styleUrls: ['./interactions.component.scss']
})
export class InteractionsComponent implements OnInit {
  // tslint:disable-next-line:no-input-rename
  @Input('conversation') conversation: any;
  unidentified = true;
  isConnected = true;
  popTitle = "Notes"
  @Input('messages') messages: any;

  channelUrl = 'assets/images/web.svg';
  options: string[] = ['Glenn Helgass', ' Ev Gayforth', 'Adam Joe Stanler', 'Fayina Addinall', 'Doy Ortelt', 'Donnie Makiver', 'Verne West-Frimley', ' Ev Gayforth', 'Adam Joe Stanler', 'Fayina Addinall', 'Doy Ortelt', 'Donnie Makiver', 'Verne West-Frimley', 'Glenn Helgass', ' Ev Gayforth'];
  categories: string[] = ['Fayina Addinall', 'Doy Ortelt', ' Ev Gayforth', 'Adam Joe Stanler'];

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
  convers: any[];


  constructor(private _sharedService: sharedService, private _cacheService: cacheService, private _socketService: socketService, private dialog: MatDialog) {
  }

  ngOnInit() {
  //  console.log("i am called hello")
    this.convers = this.conversation;


  }

  onSend(text) {
    // let message = JSON.parse(JSON.stringify(this.conversation.messages[this.conversation.messages.length - 1]));

    // message.header.sender.type = "agent";
    // message.header.sender.role = "agent";
    // message.header.sender.participant.id = this._cacheService.agent.details.username;
    // message.header.sender.participant.displayName = this._cacheService.agent.details.username;
    // message.body.markdownTest = text;

    // this._socketService.emit('sendMessage', message);

  }
  openDialog(templateRef, e): void {
    this.popTitle = e;

    this.dialog.open(templateRef, {
      panelClass: 'wrap-dialog',
    });
  }

  onTextAreaClick() {
 //   this.conversation.unReadCount = 0;
  }

}
