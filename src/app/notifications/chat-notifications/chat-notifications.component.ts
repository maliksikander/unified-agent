import { Component, OnInit, Inject, Input } from '@angular/core';

@Component({
  selector: 'app-chat-notifications',
  templateUrl: './chat-notifications.component.html',
  styleUrls: ['./chat-notifications.component.scss']
})
export class ChatNotificationsComponent implements OnInit {

  @Input() data: any;
  customerName: string = null;
  channel: string;
  identified: boolean = false;
  channelImageSrc: string;

  constructor() { }

  ngOnInit() {

    console.log("this is data ", this.data)
    if (this.data.channelSession.associatedCustomer.firstName) {
      this.customerName = this.data.channelSession.associatedCustomer.firstName;
      console.log("name "+this.data.channelSession.associatedCustomer.firstName)
      this.identified = true;
    }
    this.channel = this.data.channelSession.channel.type.name;
    console.log("channel "+this.data.channelSession.channel.type.name)
    this.channelImageSrc = 'assets/images/' + this.channel.toLowerCase() + '.svg';

  }

}
