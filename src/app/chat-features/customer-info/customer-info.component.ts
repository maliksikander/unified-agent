import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core";
import { MatDialog, MatSidenav } from "@angular/material";
// import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { socketService } from "src/app/services/socket.service";
import { sharedService } from "src/app/services/shared.service";
import { NavigationExtras, Router } from "@angular/router";
import { CustomerActionsComponent } from "src/app/customer-actions/customer-actions.component";
import { httpService } from "src/app/services/http.service";
import { finesseService } from "src/app/services/finesse.service";
@Component({
  selector: "app-customer-info",
  templateUrl: "./customer-info.component.html",
  styleUrls: ["./customer-info.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class CustomerInfoComponent implements OnInit {
  @ViewChild("sidenav", { static: true }) sidenav: MatSidenav;
  // tslint:disable-next-line:no-input-rename
  @Input() customer: any;
  @Input() customerSuggestions: any;
  @Input() activeChannelSessions: any;
  @Input() conversationId: any;
  @Input() activeConversationData: any;
  @Input() firstChannelSession: any;
  @Output() updatedlabels = new EventEmitter<boolean>();
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
  timer = "00:00";

  // drop(event: CdkDragDrop<string[]>) {
  //   moveItemInArray(this.customArray, event.previousIndex, event.currentIndex);
  // }
  constructor(
    private _router: Router,
    private _sharedService: sharedService,
    public _socketService: socketService,
    private dialog: MatDialog,
    private _httpService: httpService,
    private _finesseService: finesseService,
  ) {}

  ngOnInit() {
    this._finesseService.callTimer.subscribe((res) => {
      this.timer = res;
    });
  }

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

    // this._finesseService.conversationList.next(this.activeChannelSessions);


  }

  getMediaChannels() {
    this.mediaChannelData = [];
    let mediaChannelData = [];
    this._sharedService.schema.forEach((e) => {
      if (e.isChannelIdentifier == true && this.customer.hasOwnProperty(e.key)) {
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
  startOutBoundConversation()
  {
    console.log("outbound functuon called")
  }

  getProfileFormData(obj) {
    let channelIdentifiers = [];
    this._sharedService.schema.forEach((e) => {
      if (e.isChannelIdentifier == true) {
        channelIdentifiers.push(e.key);
      }
    });

    let processedObj = [];
    let keys = Object.keys(obj);
    let values = Object.values(obj);
    for (let i = 0; i < keys.length; i++) {
      if (
        keys[i] != "_id" &&
        keys[i] != "createdAt" &&
        keys[i] != "updatedAt" &&
        keys[i] != "updatedBy" &&
        keys[i] != "createdBy" &&
        keys[i] != "__v" &&
        keys[i] != "isAnonymous" &&
        keys[i] != "labels" &&
        values[i]
      ) {
        if (!channelIdentifiers.includes(keys[i])) {
          processedObj.push({ key: keys[i], value: values[i] });
        }
      }
    }

    return processedObj;
  }
  updateProfile() {
    const dialogRef = this.dialog.open(CustomerActionsComponent, {
      panelClass: "edit-customer-dialog",
      maxWidth: "80vw",
      maxHeight: "88vh",
      // width: "818px",
      // height: "88vh",
      data: { id: this.customer._id, tab: "edit" }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.event && result.event == "refresh") {
        this.updatedlabels.emit(result.data);
        this._httpService.getCustomerById(this.customer._id).subscribe(
          (customer) => {
            this._httpService.updateConversationCustomer(this.conversationId, customer).subscribe();
          },
          (error) => {}
        );
      }
    });
  }
  moveSession(event) {
    event.stopPropagation();
  }

  linkCustomer(selectedCustomer) {
    let completeSelectedCustomer = {};
    this._sharedService.schema.forEach((e) => {
      if (selectedCustomer.hasOwnProperty(e.key)) {
        completeSelectedCustomer[e.key] = selectedCustomer[e.key];
      } else {
        completeSelectedCustomer[e.key] = e.isChannelIdentifier ? [] : "";
      }
    });
    completeSelectedCustomer["_id"] = selectedCustomer._id;
    this._socketService.linkCustomerWithTopic(completeSelectedCustomer, this.conversationId);

    // this._socketService.changeTopicCustomer(
    //   {
    //     data: {
    //       phoneNumber: ["030078444212", "000", "002"],
    //       _id: "61a4ac9a93af2b53287369eb",
    //       firstName: "Mark",
    //       isAnonymous: false,
    //       __v: 0,
    //       alphanumeric: "",
    //       boolean: "",
    //       email: "",
    //       ip: "",
    //       name: "",
    //       number: "",
    //       password: "",
    //       viber: ["viber"],
    //       wewq: ["web"]
    //     }
    //   },
    //   "12345"
    // );
  }

  viewAllMatches() {
    let channelType;
    let channelIdentifier;
    let attr;
    this._socketService.conversations.find((e) => {
      if (e.conversationId == this.conversationId) {
        channelType = e.firstChannelSession.channel.channelType.name;
        channelIdentifier = e.firstChannelSession.channelData.channelCustomerIdentifier;
        return;
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
        q: "linking",
        filterKey: attr ? attr : null,
        filterValue: channelIdentifier ? channelIdentifier : null,
        conversationId: this.conversationId,
        topicCustomerId: this.customer._id
      }
    };

    this._router.navigate(["/customers/phonebook"], navigationExtras);
  }

  gotoEmbedView() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        q: "linking",
        conversationId: this.conversationId,
        topicCustomerId: this.customer._id
      }
    };

    this._router.navigate(["/customers/phonebook"], navigationExtras);
  }

  callStartTime(time) {
    return new Date(time * 1000).toISOString().substring(11, 16);
  }
}
