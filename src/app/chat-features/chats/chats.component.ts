import { Component, OnInit } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material";
import { httpService } from "src/app/services/http.service";
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
  labels :Array<any>=[];
  constructor(private _httpService:httpService,
    public _socketService: socketService, public _sharedService: sharedService) {}
  ngOnInit() {
    this.loadLabels()
  }
  loadLabels() {
    this._httpService.getLabels().subscribe((e) => {
      this.labels = e;
    });
  }
  currentTabIndex;
  tabChanged(event: MatTabChangeEvent) {
    let index = event.index;
    this.currentTabIndex = index;
    this._sharedService.matCurrentTabIndex = index;
  }
}
