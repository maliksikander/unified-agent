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
  mediaChannelData = [];

  schema = [
    {
      "channelTypes": [],
      "_id": "61a62b05134fc2f8a65bc2a0",
      "key": "firstName",
      "defaultValue": "John Doe",
      "description": "",
      "isChannelIdentifier": false,
      "isDeletable": false,
      "isPii": false,
      "isRequired": true,
      "label": "First Name",
      "length": 50,
      "sortOrder": 1,
      "type": "String"
    },
    {
      "channelTypes": [
        "WhatsApp",
        "SMS"
      ],
      "_id": "61a7ab05134fc2f8a65c566f",
      "key": "phoneNumber",
      "defaultValue": "",
      "description": "",
      "isChannelIdentifier": true,
      "isDeletable": false,
      "isPii": false,
      "isRequired": false,
      "label": "Phone Number",
      "length": 18,
      "sortOrder": 2,
      "type": "PhoneNumber"
    },
    {
      "channelTypes": [],
      "_id": "61a7ab05134fc2f8a65c5670",
      "key": "isAnonymous",
      "defaultValue": false,
      "description": "",
      "isChannelIdentifier": false,
      "isDeletable": false,
      "isPii": false,
      "isRequired": true,
      "label": "Anonymous",
      "length": 4,
      "sortOrder": 3,
      "type": "Boolean"
    },
    {
      "channelTypes": [
        "Web"
      ],
      "_id": "61b0460ccaefbc32b489e82e",
      "key": "webChannelIdentifier",
      "label": "Web Channel Identifier",
      "description": "fsdf",
      "type": "String",
      "length": 50,
      "isRequired": false,
      "defaultValue": null,
      "isPii": false,
      "isChannelIdentifier": true,
      "isDeletable": true,
      "sortOrder": 4,
      "__v": 0
    },
    {
      "channelTypes": [
        "Viber"
      ],
      "_id": "61b04645caefbc32b489e86a",
      "key": "viber",
      "label": "Viber",
      "description": "",
      "type": "String",
      "length": 50,
      "isRequired": false,
      "defaultValue": "",
      "isPii": false,
      "isChannelIdentifier": true,
      "isDeletable": true,
      "sortOrder": 5,
      "__v": 0
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
  constructor(public _socketService: socketService, private dialog: MatDialog) { }

  ngOnInit() { }

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
      this.mediaChannelData = this.getMediaChannels();
    } else if (changes.activeChannelSessions && changes.activeChannelSessions.currentValue != undefined) {
      this.activeChannelSessions = null;
      this.activeChannelSessions = changes.activeChannelSessions.currentValue;
    } else if (changes.customerSuggestions && changes.customerSuggestions.currentValue != undefined) {
      this.customerSuggestions = null;
      this.customerSuggestions = changes.activeChannelSessions.currentValue;
    }
  }

  getMediaChannels() {
    this.mediaChannelData = [];
    let mediaChannelData = [];
    this.schema.forEach((e) => {
      if (
        e.isChannelIdentifier == true &&
        this.customer.hasOwnProperty(e.key)
      ) {

        this.customer[e.key].forEach((value) => {
          mediaChannelData.push({
            fieldType: e.type,
            value: value,
            label: e.label,
            channelList: e.channelTypes
          });
        });
      }
    });

    return mediaChannelData;
  }

  getProfileFormData(obj) {
    let channelIdentifiers = [];
    this.schema.forEach((e) => {
      if (e.isChannelIdentifier == true) {
        channelIdentifiers.push(e.key);
      }
    })

    let processedObj = [];
    let keys = Object.keys(obj);
    let values = Object.values(obj);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] != "_id" && keys[i] != "createdAt" && keys[i] != "updatedAt"
        && keys[i] != "updatedBy" && keys[i] != "createdBy" && keys[i] != "__v"
        && keys[i] != "isAnonymous" && values[i]) {
        if (!channelIdentifiers.includes(keys[i])) {
          processedObj.push({ key: keys[i], value: values[i] });
        }
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
