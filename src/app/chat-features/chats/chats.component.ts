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
        intents: [
          'Share number where I can call in emergency situations.',
          'Share number where I can call in emergency situations.',
          'Share number where I can call in emergency situations.',
      ],
        type: 'message',
      },
      {
        title: 'farhan',
        message: 'Share number where I can call in emergency situations.',
        showIntent: false,
        intents: [
          'Share number where I can call in emergency situations.',
          'Share number where I can call in emergency situations.',
          'Share number where I can call in emergency situations.'
        ],
        type: 'message',
      },
      {
        title: 'farhan',
        message: 'Hi. Please share the email ID for support team.',
        showIntent: false,
        intents: [
          'Share number where I can call in emergency situations.',
          'Share number where I can call in emergency situations.',
          'Share number where I can call in emergency situations.'
        ],
        type: 'message',
      },
      {
        title: 'bot',
        type: 'structuredMessage',
        actions: [
          'Complaint Registration', 'PTCL Service / Shop', 'New Service', 'Service Information', 'Billing Info'
        ],
        heading: '*Welcome to ExpertFlow Self-Service Channel*',
        message: 'Please select an option from the self service menu below. Our automated system will help you register your \n' +
          'complaint efficiently.',
      },

      {
        notificationType: 'assistNotification',
        notificationMessage: '‘John Miller’ joined as assistant'
      },
      {
        title: 'farhan',
        type: 'quotedMessage',
        heading: '',
        quoteMessage: 'Please select an option from the self service menu below. Our automated system will help you register your \n' +
          'complaint efficiently.',
        message: 'Complaint Registration',
      },
      {
        title: 'bot',
        type: 'structuredMessage',
        message: 'Please select your service from the menu below',
        actions: [
          'Landline', 'Broadband', 'Smart TV', 'Value Added Services', 'Billing', 'V-fone', 'Evo or charji', 'GPON'
        ],
      },
      {
        title: 'farhan',
        type: 'quotedMessage',
        heading: '',
        quoteMessage: 'Please select your service from the menu below',
        message: 'Broadband',
      },
      {
        notificationType: 'joinNotification',
        notificationMessage: '‘John Miller’ joined as agent in chat'
      },
      {
        title: 'farhan',
        type: 'file',
        fileType: 'xls',
        fileName: 'Expertflow-Corporate-Presentation',
        fileUrl: 'assets/images/type-xls.svg',
      },
      {
        title: 'bot',
        type: 'file',
        fileType: 'ppt',
        fileName: 'Expertflow-Corporate-Presentation',
        fileUrl: 'assets/images/type-ppt.svg',

      },
      {
        title: 'farhan',
        type: 'video',
        videoUrl: 'http://static.videogular.com/assets/videos/videogular.mp4',

      },
      {
        title: 'bot',
        type: 'contact',
        number: '41526321789',
        name: 'Stacy Staler'
      },
      {
        title: 'farhan',
        type: 'contact',
        number: '41526321789',
        name: 'Stacy Staler'

      },

      {
        title: 'farhan',
        type: 'audio',
        audioUrl: 'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3',
        formatType: 'audio/mp3',

      },
      {
        title: 'farhan',
        type: 'url',
        urlTitle: 'Expertflow New Hybrid Chat Solution',
        urlDescription: 'www.expertflow.com',
        urlLink: 'http://www.expertflow.com',
        urlImage: 'assets/images/url-image.jpg',

      },
      {
        title: 'farhan',
        type: 'location',
        lat: 31.4805,
        lng: 74.3239,
        zoom: 8
      },
      {
        title: 'bot',
        type: 'location',
        lat: 31.4805,
        lng: 74.3239,
        zoom: 8
      },
      {
        title: 'bot',
        type: 'file',
        fileType: 'ppt',
        fileName: 'Expertflow-Corporate-Presentation',
        fileUrl: 'assets/images/type-ppt.svg',
      },
      {
        title: 'raza',
        message: 'hello',
        type: 'message',
      },
      {
        title: 'raza',
        message: 'how are you',
        type: 'message',
      }
    ]
  },
  {
    messages: [
      {
        title: 'raza',
        message: 'Share number where I can call in emergency situations.',
        type: 'message',
      },
      {
        title: 'raza',
        message: 'Hi. Please share the email ID for support team.',
        type: 'message',
      },
      {
        title: 'raza',
        message: 'hello 12',
        type: 'message',
      },
      {
        title: 'raza',
        message: 'how are you 12',
        type: 'message',
      }
    ]
  }

  ];
  barExpand = false;

  constructor() {

  }

  ngOnInit() {
  }

  currentTabIndex;
  onTabChange(index) {
    console.log("parent called " + index);
    this.currentTabIndex = index;

  }

}
