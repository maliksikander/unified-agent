import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatDialog } from "@angular/material";
import { TopicParticipant } from "src/app/models/User/Interfaces";
import { cacheService } from "src/app/services/cache.service";
import { pullModeService } from "src/app/services/pullMode.service";
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

  constructor(
    private dialog: MatDialog,
    public _pullModeservice: pullModeService,
    private _cacheService: cacheService,
    private _socketService: socketService
  ) {}

  ngOnInit() {}
  listPreviewToggle() {
    this.expandCustomerInfo.emit((this.listPreview = false));
  }

  closeChat() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: "490px",
      panelClass: "confirm-dialog",
      data: { header: "Close Chat", message: `Are you sure you want to close this Chat?` }
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  joinChat(request) {
    let obj = {
      topicParticipant: new TopicParticipant("AGENT", this._cacheService.agent, request.channelSession.topicId, "PRIMARY", "SUBSCRIBED"),
      agentId: this._cacheService.agent.id,
      channelSession: request.channelSession,
      requestId: request.id
    };
    this._socketService.emit("joinPullModeRequest", obj);
  }

  isAlreadySubscribed(requestId) {
    return this._pullModeservice.subscribedListJoinedRequests.includes(requestId);
  }
}
