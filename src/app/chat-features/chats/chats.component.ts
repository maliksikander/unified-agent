import { Component, OnInit } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material";
import { sharedService } from "src/app/services/shared.service";
import { socketService } from "src/app/services/socket.service";

@Component({
  selector: "app-chats",
  templateUrl: "./chats.component.html",
  styleUrls: ["./chats.component.scss"]
})
export class ChatsComponent implements OnInit {
  conversations = [];
  barExpand = false;

  constructor(public _socketService: socketService, public _sharedService: sharedService) {}
  ngOnInit() {}

  currentTabIndex;
  tabChanged(event: MatTabChangeEvent) {
    let index = event.index;
    this.currentTabIndex = index;
    this._sharedService.matCurrentTabIndex = index;
    console.log("tabChanged: index = ", index);
  }
}
