import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {cacheService} from 'src/app/services/cache.service';
import {sharedService} from 'src/app/services/shared.service';
import {socketService} from 'src/app/services/socket.service';
import {MatAccordion, MatDialog, MatSnackBar} from '@angular/material';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {snackbarService} from '../../services/snackbar.service';

declare var EmojiPicker: any;

export interface User {
  name: string;
}
interface Search {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-interactions',
  templateUrl: './interactions.component.html',
  styleUrls: ['./interactions.component.scss']
})
export class InteractionsComponent implements OnInit, AfterViewInit {
  // tslint:disable-next-line:no-input-rename
  @Input('conversation') conversation: any;
  unidentified = true;
  isConnected = true;
  popTitle = 'Notes';
  @Input('messages') messages: any;
  @Output() expandCustomerInfo = new EventEmitter<any>();
  isBarOPened = false;
  public config: PerfectScrollbarConfigInterface = {};
  @ViewChild('replyInput', {static: true}) elementView: ElementRef;
  expanedHeight = 0;

  myControl = new FormControl();
  channelUrl = 'assets/images/web.svg';
  wrapupList:any = [];
  categoriesList: any = [];

  wrapupLabels:any = [];
  categoriesLabels: any = [];

  isfrmChecked:any;
  userList = [
    {
      name: 'Technical Support',
      activeCount: '12'

    }, {
      name: 'Marketing Support',
      activeCount: '08'

    }, {
      name: 'Customer Support',
      activeCount: '12'

    }, {
      name: 'Ev Gayforth',
      role: 'supervisor',
      team: 'technical'

    }, {
      name: 'Doy Ortelt',
      role: 'supervisor',
      team: 'marketing'

    }, {
      name: 'stanler',
      role: 'supervisor',
      team: 'customer support'

    }, {
      name: 'Ev Gayforth',
      role: 'supervisor',
      team: 'technical'

    }, {
      name: 'Ortelt',
      role: 'supervisor',
      team: 'marketing'

    }, {
      name: 'Joe Stanler',
      role: 'supervisor',
      team: 'customer support'

    },
  ];

  search: Search[] = [
    {value: 'all', viewValue: 'All'},
    {value: 'web', viewValue: 'Web'},
    {value: 'Whatsapp', viewValue: 'Whatsapp'}
  ];
  selectedSearch = this.search[0].value;
  whisper = false;
  displayUserList = false;
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
  channelFlag = 'all';
  channelName = 'All';
  channelCode = 'all';
  isSelectedChannel = 'Web Chat';
  isSelectedChannelFlag = 'web.svg';
  isSelectedChannelCode = 'web';
  channels = [
    { code: 'all', name: 'All', flag: 'whatsapp.svg' },
    { code: 'whatsapp', name: 'Whatsapp', flag: 'whatsapp.svg' },
    { code: 'web', name: 'Web Chat', flag: 'web.svg' },
    { code: 'facebook', name: 'Facebook', flag: 'facebook.svg' },
    { code: 'viber', name: 'Viber', flag: 'viber.svg' }
  ];
  channelSwitch = [
    { code: 'whatsapp', name: 'Whatsapp', flag: 'whatsapp.svg' },
    { code: 'web', name: 'Web Chat', flag: 'web.svg' },
    { code: 'facebook', name: 'Facebook', flag: 'facebook.svg' },
    { code: 'viber', name: 'Viber', flag: 'viber.svg' }
  ];
  message = '';
  transferSearch = '';
  searchInteraction = '';
  inputCategoryName = '';
  inputWrapup = '';
  convers: any[];
  ringing = false;
  callControls = false;
  notes: any = [
    {
      'categoryName': 'payments',
      'wrapups': [
        'Payments', 'Late Payment', 'Payment Details', 'Payment Due Date', 'Last payment'
      ]
    },
    {
      'categoryName': 'services',
      'wrapups': [
        'services1', 'services2', 'services3', 'services4', 'services5', 'services5', 'services6'
      ]
    }
  ];
  cannedMessages = [
    {
      'category': 'marketing',
      'messages': [
        'Hi, how are you',
        'How may I help you?'
      ]
    },
    {
      'category': 'information',
      'messages': [
        'Info message 1',
        'Info message 2'
      ]
    }
  ];
  actions = [
    {
      'name': 'If a customer submits a support ticket, they deserve 1. confirmation that you received the ticket, and 2. affirmation that you are working on it.',
    },
    {
      'name': 'If possible, personalize this response relative to the issue. If a customer filled out a form with drop-down category, this is easy. Additionally, you can train your reps to know which response to use.',
    },
    {
      'name': 'To help ameliorate this tendency, make sure you proactively follow-up with them letting them know you\'re still working hard to reach a resolution, and that you will let them know when there are updates. This shows you care.',
    }
  ];
  isSuggestion = false;
  selectCategories;
  displaySuggestionsArea = false;
  cannedTabOpen = false;
  quickReplies = true;
  viewHeight = '130px';
  chatTransferTo;
  @Input() max: any;
  today = new Date();
  interactionSearch = false;
  fbId = '309172437354807';
  postId = '101064781498908';

  postUrl = '';
  constructor(private snackBar: MatSnackBar, private _cacheService: cacheService, private _socketService: socketService, private dialog: MatDialog) {

  }

  ngOnInit() {
    //  console.log("i am called hello")
    this.convers = this.messages;
    console.log('hello', this.messages);
    setTimeout(() => {
      new EmojiPicker();
    }, 500);
this.postUrl = "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fweb.facebook.com%2Fpermalink.php%3Fstory_fbid%3D"+this.fbId+"%26id%3D"+this.postId+"&show_text=true&width=500"

  }


  ngAfterViewInit() {

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

  chatTransfer(templateRef, e): void {
    this.chatTransferTo = e;

    const dialogRef = this.dialog.open(templateRef, {
      panelClass: 'wrap-dialog',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  transferRequest(message: string, action: string, templateRef, e) {
    setTimeout(() => {
      this.snackBar.open('Chat transferred successfully to ' + message, action, {
        duration: 5000,
        panelClass: 'chat-success-snackbar',
        horizontalPosition: 'right',
        verticalPosition: 'bottom'
      });
    }, 2000);

    setTimeout(() => {
      this.popTitle = e;
      this.dialog.open(templateRef, {
        panelClass: 'wrap-dialog',
      });

    }, 3000);


  }

  onTextAreaClick() {
    //   this.conversation.unReadCount = 0;
  }

  textChanged(event) {
    const el: any = document.getElementById('messageTextarea');
    this.message = el.value;
  }

  onKey(event) {
    this.expanedHeight = this.elementView.nativeElement.offsetHeight;
    console.log(this.expanedHeight);
    this.message = event.target.value;
    // if (this.message === "" && event.keyCode === 40) {
    //   // alert('up key Click Event!');
    //   this.isSuggestion = true;
    // } else if (this.message === "" && event.keyCode === 38) {
    //   this.isSuggestion = false;
    //
    // }
    console.log('onKey: ', this.message);
    if (this.message[0] === '/' || this.message[0] === ' ') {
      this.displaySuggestionsArea = false;
      this.quickReplies = false;

      // setTimeout(() => {
      //   this.mainHeight = this.elementView.nativeElement.offsetHeight;
      //   this.viewHeight = this.mainHeight + 180 + 'px';
      //   this.scrollToBottom();
      // }, 500);

      console.log('value is 0');
      this.cannedTabOpen = true;
    } else {
      this.cannedTabOpen = false;
      this.quickReplies = true;
      // this.viewHeight = '180px';
    }
    // if (this.message[0] === '.') {
    //     console.log('value is 0')
    //     this.isTemplateOpen = false;
    // }

    if (this.message[0] === '@') {

      this.displayUserList = true;

    } else {
      this.displayUserList = false;
    }
  }


  eventFromChild(data) {
    this.isBarOPened = data;
  }

  searchChannel(channel) {

    const selectedChannel = this.channels.find(r => r.code === channel);
    if (selectedChannel !== undefined) {
      this.channelName = selectedChannel.name;
      this.channelFlag = selectedChannel.flag;
      this.channelCode = selectedChannel.code;
    }
  }
  selectChannel(channel) {

    const selectedChannel = this.channelSwitch.find(r => r.code === channel);
    if (selectedChannel !== undefined) {
      this.isSelectedChannel = selectedChannel.name;
      this.isSelectedChannelFlag = selectedChannel.flag;
      this.isSelectedChannelCode = selectedChannel.code;
    }
  }


  selectWrapupCategories(e: any, isChecked: boolean) {
    if (isChecked) {
      this.categoriesList.push(e);
      this.wrapupList.push(e);
    } else {
      const index = this.categoriesList.indexOf(e);
      this.categoriesList.splice(index, 1);
    }
    console.log(this.categoriesList, 'categoriesList')
  }
  removeWrapupCategories(e: any, isChecked: boolean) {
    const index = this.categoriesList.indexOf(e);
    this.categoriesList.splice(index, 1);
    this.wrapupList.splice(index, 1);
    this.wrapupLabels.splice(index);

  }

  selectWrapup(e: any, isChecked: boolean) {
    if (isChecked) {
      this.wrapupLabels.push(e);
    } else {
      const index = this.wrapupList.indexOf(e);
      this.wrapupList.splice(index, 1);
    }
    console.log(this.wrapupList, 'wraplist')
  }

  removeWrapupLabels(e: any, isChecked: boolean) {

      const index = this.wrapupLabels.indexOf(e);
      this.wrapupLabels.splice(index, 1);
  }

}
