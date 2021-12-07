import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { MatDialog, MatSidenav } from "@angular/material";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { socketService } from "src/app/services/socket.service";

@Component({
  selector: "app-customer-info",
  templateUrl: "./customer-info.component.html",
  styleUrls: ["./customer-info.component.scss"]
})
export class CustomerInfoComponent implements OnInit {
  @ViewChild("sidenav", { static: true }) sidenav: MatSidenav;
  // tslint:disable-next-line:no-input-rename
  @Input() customer: any;
  @Input() customerSuggestions: any;
  @Input() activeChannelSessions: any;
  @Input() topicId: any;
  @Output() expandCustomerInfo = new EventEmitter<any>();
  customerProfileFormData: any;

  customArray = [
    // 'media_channel',
    "customer_profile",
    "active_sessions",
    "link_profile"
  ];
  mediaChannelData = [
    {
      fieldType: 'tel',
      value: '+4466985845',
      label: 'Landline Business'
    },
    {
      fieldType: 'tel',
      value: '+4466985845',
      label: 'Mobile Personal',
      channelList: [
        {
          label: 'Call & SMS',
          channelType: 'mobile',
          channelIdenty: '+4466985845'
        },
        {
          label: 'Whatsapp',
          channelType: 'whatsapp'
        }
      ]
    },
    {
      fieldType: 'email',
      value: 'a.stanler@skytechinc.com',
      label: 'Email Business',
      channelList: [
        {
          label: 'email',
          channelType: 'email',
          channelIdenty: 'a.stanler@skytechinc.com'
        },
        {
          label: 'facebook',
          channelType: 'facebook'
        },
        {
          label: 'Skype',
          channelType: 'skype',
          channelIdenty: 'SkytechInc'

        }
      ]
    },
    {
      fieldType: 'text',
      value: 'SkytechInc',
      label: 'Facebook Business',
      channelList: [
        {
          label: 'Facebook',
          channelType: 'facebook',
          channelIdenty: 'SkytechInc'
        }
      ]
    }

  ];


  displayCustomerChannels = false;
  displayProfile = true;
  barOpened = false;
  reRouteText = "";
  outgoingCallingNumber = "+446698988";
  customerActiveSessions = [];
  options: string[] = [
    "Glenn Helgass",
    " Ev Gayforth",
    "Adam Joe Stanler",
    "Fayina Addinall",
    "Doy Ortelt",
    "Donnie Makiver",
    "Verne West-Frimley",
    " Ev Gayforth",
    "Adam Joe Stanler",
    "Fayina Addinall",
    "Doy Ortelt",
    "Donnie Makiver",
    "Verne West-Frimley",
    "Glenn Helgass",
    " Ev Gayforth"
  ];
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.customArray, event.previousIndex, event.currentIndex);
  }
  constructor(public _socketService: socketService, private dialog: MatDialog) {}

  ngOnInit() {}

  close() {
    this.sidenav.close();
  }

  openDialog(templateRef, e): void {
    this.outgoingCallingNumber = e;

    this.dialog.open(templateRef, {
      panelClass: "calling-dialog",
      width: "350px"
    });
  }
  reRouteDialog(templateRef, e): void {
    this.reRouteText = e;

    this.dialog.open(templateRef, {
      panelClass: "re-route-dialog",
      minWidth: "450px"
    });
  }
  customerInfoToggle() {
    this.barOpened = !this.barOpened;
    this.expandCustomerInfo.emit(this.barOpened);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("changes ", changes);
    if (changes.customer && changes.customer.currentValue != undefined) {
      this.customer = null;
      this.customer = changes.customer.currentValue;
      this.customerProfileFormData = this.getProfileFormData(this.customer);
    } else if (changes.activeChannelSessions && changes.activeChannelSessions.currentValue != undefined) {
      this.activeChannelSessions = null;
      this.activeChannelSessions = changes.activeChannelSessions.currentValue;
    } else if (changes.customerSuggestions && changes.customerSuggestions.currentValue != undefined) {
      this.customerSuggestions = null;
      this.customerSuggestions = changes.activeChannelSessions.currentValue;
    }
  }

  getProfileFormData(obj) {
    let processedObj = [];
    let keys = Object.keys(obj);
    let values = Object.values(obj);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] != "id") {
        processedObj.push({ key: keys[i], value: values[i] });
      }
    }
    return processedObj;
  }

  moveSession(event) {
    event.stopPropagation();
  }

  linkCustomer(customerId) {
    this._socketService.linkCustomerWithInteraction(customerId, this.topicId);
  }
}
