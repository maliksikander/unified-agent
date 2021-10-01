import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {cacheService} from 'src/app/services/cache.service';
import {socketService} from 'src/app/services/socket.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {FormControl} from '@angular/forms';
import {WrapUpFormComponent} from '../../new-components/wrap-up-form/wrap-up-form.component';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

declare var EmojiPicker: any;
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
  @Input('messages') messages: any;
  @Output() expandCustomerInfo = new EventEmitter<any>();
  @Output() customerCalling = new EventEmitter<any>();
  isBarOPened = false;
  public config: PerfectScrollbarConfigInterface = {};
  @ViewChild('replyInput', {static: true}) elementView: ElementRef;
  expanedHeight = 0;
  urlMap = new Map();
  fileUrl: SafeUrl;
  myControl = new FormControl();
  channelUrl = 'assets/images/web.svg';
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
  wrapCount = 5;
  convers: any[];
  ringing = false;
  callControls = false;

  selectedWrap = {
    code: ['Late Payment', 'Payment Details', 'Payment Due Date', 'Last payment','Late Payment', 'Payment Details', 'Payment Due Date', 'Last payment','Late Payment', 'Payment Details', 'Payment Due Date', 'Last payment'],
    note: 'The customer requested for online as well on door service to resolve issues. The request was communicated to the under ticket number 29365'
  };
  selectedWrap1 = {
    code: [],
    note: 'The customer requested for online as well on door service to resolve issues. The request was communicated to the under ticket number 29365, The customer requested for online as well on door service to resolve issues. The request was communicated to the under ticket number 29365 '
  };
  selectedWrap3 = {
    code: ['Late Payment', 'Payment Details', 'Payment Due Date', 'Last payment', 'Late Payment', 'Payment Details', 'Payment Due Date', 'Last payment', 'Late Payment', 'Payment Details', 'Payment Due Date', 'Last payment'],
    note: ''
  };
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
      type: 'message',
      message: 'If a customer submits a support ticket, they deserve 1. confirmation that you received the ticket, and 2. affirmation that you are working on it.',
    },

    {
      type: 'location',
      lat: 31.4805,
      lng: 74.3239,
      zoom: 8
    },
    {
      type: 'file',
      fileType: 'pdf',
      fileName: 'Expertflow-Corporate-Presentation',
      fileUrl: 'assets/images/type-ppt.svg',
    },
    {
      type: 'message',
      message: 'To help ameliorate this tendency, make sure you proactively follow-up with them letting them know you\'re still working hard to reach a resolution, and that you will let them know when there are updates. This shows you care.',
    },
  ];
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
  constructor(private snackBar: MatSnackBar, private _cacheService: cacheService, private _socketService: socketService, private dialog: MatDialog, private santizer:DomSanitizer) {
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

  openWrapUpDialog(e): void {
    this.dialog.open(WrapUpFormComponent, {
      panelClass: 'wrap-dialog',
      data: { header: e }
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

  transferRequest(message: string, action: string) {
    setTimeout(() => {
      this.snackBar.open('Chat transferred successfully to ' + message, action, {
        duration: 5000,
        panelClass: 'chat-success-snackbar',
        horizontalPosition: 'right',
        verticalPosition: 'bottom'
      });
    }, 2000);

    setTimeout(() => {
      this.dialog.open(WrapUpFormComponent, {
        panelClass: 'wrap-dialog',
        data: { header: 'Chat Transfer Notes' }
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
    // console.log(this.expanedHeight);
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

  cancelCall() {
    this.ringing = false;
    this.callControls = false;
  }

  displayCallControll(data) {
    if (data === true) {
      this.ringing = true;
        setTimeout(() => {
          if (this.ringing) {
            this.ringing = false;
            this.callControls = true;
          }
        }, 5000);
    }
    console.log('intrection component', data);


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

  uploadFile(e) {
    const file = e.target.files[0];
    const files = e.target.files;


    for (let i = 0; i < files.length; i++) {

      console.log(files.item(i), file.name, i);
      this.urlMap.set(files[i].name, files.item(i));

      // alert(file.name);
    }
    const url = URL.createObjectURL(file);

    this.fileUrl = this.santizer.bypassSecurityTrustUrl(url);
    console.log(this.urlMap.size);
  }

  fullLocation(lat, lng){
    const locationUrl = `http://maps.google.com/maps?q=${lat}, ${lng}`;
    window.open(locationUrl, '_blank');
    // http://maps.google.com/maps?q=210+Louise+Ave,+Nashville,+TN+37203
  }
}
