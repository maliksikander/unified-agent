import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Router } from "@angular/router";
import { TopicParticipant } from "src/app/models/User/Interfaces";
import { cacheService } from "src/app/services/cache.service";
import { httpService } from "src/app/services/http.service";
import { pullModeService } from "src/app/services/pullMode.service";
import { sharedService } from "src/app/services/shared.service";
import { socketService } from "src/app/services/socket.service";
import { ConfirmationDialogComponent } from "../../new-components/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: "app-subscribed-list-preview",
  templateUrl: "./subscribed-list-preview.component.html",
  styleUrls: ["./subscribed-list-preview.component.scss"]
})
export class SubscribedListPreviewComponent implements OnInit {
  @Output() expandCustomerInfo = new EventEmitter<any>();
  @Input() filterListId: any;

  listPreview = true;
  filterStatus = "all";
  labels: Array<any> = [];

  constructor(
    private _httpService: httpService,
    private _sharedService: sharedService,
    private dialog: MatDialog,
    public _pullModeservice: pullModeService,
    private _cacheService: cacheService,
    private _socketService: socketService,
    private _router: Router
  ) {}

  ngOnInit() {
    this.loadLabels();
  }
  loadLabels() {
    this._httpService.getLabels().subscribe((e) => {
      this.labels = e;
    });
  }
  listPreviewToggle() {
    this.expandCustomerInfo.emit((this.listPreview = false));
  }

  closeChat(request) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: "490px",
      panelClass: "confirm-dialog",
      data: { header: "Close Chat", message: `Are you sure you want to close this Chat?` }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.event == "confirm") {
        this._socketService.emit("deletePullModeRequest", request.id);
      }
    });
  }

  joinChat(request) {
    let obj = {
      topicParticipant: new TopicParticipant("AGENT", this._cacheService.agent, request.channelSession.conversationId, "PRIMARY", "SUBSCRIBED"),
      agentId: this._cacheService.agent.id,
      channelSession: request.channelSession,
      requestId: request.id
    };
    this._socketService.emit("joinPullModeRequest", obj);
    this._sharedService.serviceChangeMessage({ msg: "closePullModeRequestHeader", data: request.id });
    this._router.navigate(["customers"]);
  }

  ngOnDestroy() {}
}
