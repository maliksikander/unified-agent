import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawerToggleResult, MatSidenav } from '@angular/material';
import { FocusOrigin } from '@angular/cdk/a11y';
import { socketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent implements OnInit {

  conversations = [{
    conversation: [
      {
        title: 'farhan',
        message: 'Hello How are you today?'
      },
      {
        title: 'farhan',
        message: 'Share number where I can call in emergency situations.'
      },
      {
        title: 'farhan',
        message: 'Hi. Please share the email ID for support team.'
      }
    ]
  },
  {
    conversation: [
      {
        title: 'raza',
        message: 'Share number where I can call in emergency situations.'
      },
      {
        title: 'raza',
        message: 'Hi. Please share the email ID for support team.'
      }
    ]
  }

  ];

  activeChat: boolean = false;

  constructor(private _socketService: socketService) {
    this._socketService.connectToSocket();
  }

  ngOnInit() {
  }

 
}
