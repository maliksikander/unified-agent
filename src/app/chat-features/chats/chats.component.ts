import { Component, OnInit } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material";
import { httpService } from "src/app/services/http.service";
import { sharedService } from "src/app/services/shared.service";
import { socketService } from "src/app/services/socket.service";
import { crmEventsService } from "src/app/services/crmEvents.service";

@Component({
  selector: "app-chats",
  templateUrl: "./chats.component.html",
  styleUrls: ["./chats.component.scss"]
})
export class ChatsComponent implements OnInit {
  // conversations = [];
  barExpand = false;
  previousTabIndex;
  currentTabIndex : number = 0;

    // labels :Array<any>=[];
  constructor(private _httpService: httpService, public _socketService: socketService, public _sharedService: sharedService,private _crmEventsService: crmEventsService) {}
  ngOnInit() {
    // this.loadLabels()
  }
  // loadLabels() {
  //   this._httpService.getLabels().subscribe((e) => {
  //     this.labels = e;
  //   });
  // }
  
  tabChanged(event: MatTabChangeEvent) {
    this.previousTabIndex = this.currentTabIndex;
    let index = event.index;
    this.currentTabIndex = index;
    this._sharedService.matCurrentTabIndex = index;
    const selectedConversation = this._socketService.conversations[this.currentTabIndex];
    this._crmEventsService.chatSwitching(this._socketService.conversations[this.currentTabIndex],this._socketService.conversations[this.previousTabIndex])
  

  }
}
