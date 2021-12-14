import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { MatDialog, MatSidenav } from "@angular/material";
// import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { socketService } from "src/app/services/socket.service";
import { sharedService } from "src/app/services/shared.service";
import { NavigationExtras, Router } from "@angular/router";

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
  @Input() firstChannelSession: any;
  @Output() expandCustomerInfo = new EventEmitter<any>();
  customerProfileFormData: any;

  // customArray = [
  //   // 'media_channel',
  //   "customer_profile",
  //   "active_sessions",
  //   "link_profile"
  // ];
  mediaChannelData = [];


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
  // drop(event: CdkDragDrop<string[]>) {
  //   moveItemInArray(this.customArray, event.previousIndex, event.currentIndex);
  // }
  constructor(private _router: Router, private _sharedService: sharedService, public _socketService: socketService, private dialog: MatDialog) { }

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
    } else if (changes.firstChannelSession && changes.firstChannelSession.currentValue != undefined) {
      this.firstChannelSession = null;
      this.firstChannelSession = changes.activeChannelSessions.currentValue;
    }
  }

  getMediaChannels() {
    this.mediaChannelData = [];
    let mediaChannelData = [];
    this._sharedService.schema.forEach((e) => {
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
    this._sharedService.schema.forEach((e) => {
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

  linkCustomer(selectedCustomer) {

    this._socketService.linkCustomerWithTopic(JSON.parse(JSON.stringify(selectedCustomer)), this.topicId);

    this._socketService.changeTopicCustomer({
      data: {
        "phoneNumber": [
          "030078444212",
          "xxxxxx99999aaaaaa",
          "+92000111221142",
          "+852221100022114",
          "+988522222210444",
          "222222"
        ],
        "_id": "6107c5ee84ab07647ffa7796",
        "firstName": "Raza 123",

        "webChannelIdentifier": [
          "134",
          "1122"
        ],
        "isAnonymous": false,
        "address": "505 Meadowbrook StreetGlenside, PA 19038, 878 Wagon St.Salisbury, MD 21801, 770 Sulphur Springs DriveChattanooga, TN 37421",
        "gender": "",
        "age": null,
        "__v": 0
      }
    }, "12345");

  }

  viewAllMatches() {

    let channelType;
    let channelIdentifier;
    let attr;
    this._socketService.conversations.find((e) => {

      if (e.topicId == this.topicId) {
        channelType = e.firstChannelSession.channel.channelType.name;
        channelIdentifier = e.firstChannelSession.channelData.channelCustomerIdentifier;
        return
      }
    });

    if (channelType && channelIdentifier) {

      this._sharedService.schema.forEach((e: any) => {
        if (e.isChannelIdentifier == true) {
          if (e.channelTypes.includes(channelType)) {
            attr = e.key;
          }
        }
      });
    }

    let navigationExtras: NavigationExtras = {
      queryParams: {
        'q': 'linking', 'filterKey': attr ? attr : null,
        'filterValue': channelIdentifier ? channelIdentifier : null,
        'topicId': this.topicId,
        'topicCustomerId': this.customer._id
      }
    };

    this._router.navigate(['/customers/phonebook'], navigationExtras);

  }

  gotoEmbedView(){
    let navigationExtras: NavigationExtras = {
      queryParams: {
        'q': 'linking',
        'topicId': this.topicId,
        'topicCustomerId': this.customer._id
      }
    };

    this._router.navigate(['/customers/phonebook'], navigationExtras);
  }

}
