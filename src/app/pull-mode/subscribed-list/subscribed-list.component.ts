import { Component, OnInit } from "@angular/core";
import { MatCheckboxChange, MatDialog } from "@angular/material";
import { TopicParticipant } from "src/app/models/User/Interfaces";
import { cacheService } from "src/app/services/cache.service";
import { httpService } from "src/app/services/http.service";
import { pullModeService } from "src/app/services/pullMode.service";
import { sharedService } from "src/app/services/shared.service";
import { socketService } from "src/app/services/socket.service";

@Component({
  selector: "app-subscribed-list",
  templateUrl: "./subscribed-list.component.html",
  styleUrls: ["./subscribed-list.component.scss"]
})
export class SubscribedListComponent implements OnInit {
  pullModeList = [];
  listPreview = false;
  listId;

  constructor(
    private _socketService: socketService,
    private _cacheService: cacheService,
    private dialog: MatDialog,
    public _pullModeservice: pullModeService
  ) {}

  ngOnInit() {}

  updateSubscribeList(templateRef): void {
    const dialogRef = this.dialog.open(templateRef, {
      width: "500px"
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
    });
  }

  eventFromChild(data) {
    this.listPreview = data;
  }

  toggle(item, event: MatCheckboxChange) {
    const obj = {
      topicParticipant: new TopicParticipant("AGENT", this._cacheService.agent, item.id, "PRIMARY", "SUBSCRIBED"),
      agentId: this._cacheService.agent.id,
      listId: item.id,
      list: item
    };
    if (event.checked) {
      this._socketService.emit("subscribePullModeList", obj);
    } else {
      this._socketService.emit("unsubscribePullModeList", obj);
    }
  }

  isChecked(id) {
    let index = this._pullModeservice.subscribedList.findIndex((e) => {
      return e.id == id;
    });
    if (index != -1) {
      return true;
    } else {
      return false;
    }
  }
}
