import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material";
import { appConfigService } from "src/app/services/appConfig.service";
import { cacheService } from "src/app/services/cache.service";
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

  constructor(
    public _socketService: socketService,
    private _cacheService: cacheService,
    private _sharedService: sharedService,
    private _appConfigService: appConfigService
  ) {}
  ngOnInit() {
    if (this._appConfigService.config.ENV == "development") {
      if (this._cacheService.agent.username == null) {
        this._cacheService.agent = {
          id: "8d42617c-0603-4fbe-9863-2507c0fff9fd",
          username: "nabeel",
          firstName: "nabeel",
          lastName: "ahmed",
          roles: []
        };
        this._socketService.connectToSocket();
      }
    }
  }

  currentTabIndex;
  tabChanged(event: MatTabChangeEvent) {
    let index = event.index;
    this.currentTabIndex = index;
    this._sharedService.matCurrentTabIndex = index;
    console.log("tabChanged: index = ", index);
  }
}
