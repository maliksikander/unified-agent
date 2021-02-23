import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog, MatSidenav } from '@angular/material';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { socketService } from 'src/app/services/socket.service';
import { sharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-customer-info',
  templateUrl: './customer-info.component.html',
  styleUrls: ['./customer-info.component.scss']
})
export class CustomerInfoComponent implements OnInit, OnChanges {
  @ViewChild('sidenav', { static: true }) sidenav: MatSidenav;
  // tslint:disable-next-line:no-input-rename
  @Input() currentTabIndex: any;
  @Input('conversation') conversation: any;
  @Output() expandCustomerInfo = new EventEmitter<any>();

  message;
  customArray = [
    // 'media_channel',
    'customer_profile',
    'active_sessions',
    'link_profile'
  ];
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
  displayCustomerChannels = false;
  displayProfile = true;
  barOpened = false;
  outgoingCallingNumber = '+446698988';
  options: string[] = ['Glenn Helgass', ' Ev Gayforth', 'Adam Joe Stanler', 'Fayina Addinall',
    'Doy Ortelt', 'Donnie Makiver', 'Verne West-Frimley', ' Ev Gayforth', 'Adam Joe Stanler', 'Fayina Addinall', 'Doy Ortelt', 'Donnie Makiver', 'Verne West-Frimley', 'Glenn Helgass', ' Ev Gayforth'];
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.customArray, event.previousIndex, event.currentIndex);
  }
  constructor(public _socketService: socketService, private dialog: MatDialog) {

  }
  ngOnChanges(changes: SimpleChanges): void {
    // if (changes.currentTabIndex.currentValue !== undefined) {
    //   this.updateCustomerInfo();
    // }
    console.log("on changes ", this.message);
  }

  ngOnInit() {
    // console.log("child called conversation "+this.conversation);

  }

  close() {
    this.sidenav.close();
  }


  updateCustomerInfo() {
    let index = this.currentTabIndex == null ? 0 : this.currentTabIndex;
    let conversation = this._socketService.conversations[index];
    this.message = conversation.messages[conversation.messages.length - 1];
  }
  openDialog(templateRef, e): void {
    this.outgoingCallingNumber = e;

    this.dialog.open(templateRef, {
      panelClass: 'calling-dialog',
      width: '350px'
    });
  }
  customerInfoToggle() {
    this.barOpened = !this.barOpened;
    this.expandCustomerInfo.emit(this.barOpened);
  }
}
