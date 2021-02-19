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
    messages: [
      {
        title: 'farhan',
        message: 'Hello How are you today?',
        showIntent: false,
        intents: [
          'Share number where I can call in emergency situations.',
          'Share number where I can call in emergency situations.',
          'Share number where I can call in emergency situations.',
      ]
      },
      {
        title: 'farhan',
        message: 'Share number where I can call in emergency situations.',
        showIntent: false,
        intents: [
          'Share number where I can call in emergency situations.',
          'Share number where I can call in emergency situations.',
          'Share number where I can call in emergency situations.'
        ]
      },
      {
        title: 'farhan',
        message: 'Hi. Please share the email ID for support team.',
        showIntent: false,
        intents: [
          'Share number where I can call in emergency situations.',
          'Share number where I can call in emergency situations.',
          'Share number where I can call in emergency situations.'
        ]
      },
      {
        title: 'raza',
        message: 'hello'
      },
      {
        title: 'raza',
        message: 'how are you'
      }
    ]
  },
  {
    messages: [
      {
        title: 'raza',
        message: 'Share number where I can call in emergency situations.'
      },
      {
        title: 'raza',
        message: 'Hi. Please share the email ID for support team.'
      },
      {
        title: 'raza',
        message: 'hello 12'
      },
      {
        title: 'raza',
        message: 'how are you 12'
      }
    ]
  }

  ];

  isBarOPened = false;

  constructor() {

  }

  ngOnInit() {
  }

  currentTabIndex;
  onTabChange(index) {
    console.log("parent called " + index);
    this.currentTabIndex = index;

  }

  eventFromChild(data) {
    this.isBarOPened = data;
  }
}
