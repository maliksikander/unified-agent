import { Component, OnInit, Inject, Input } from "@angular/core";
import { cacheService } from "src/app/services/cache.service";
import { socketService } from "src/app/services/socket.service";
import { Output, EventEmitter } from "@angular/core";
import { TopicParticipant } from "../../models/User/Interfaces";
import { Router } from "@angular/router";
import { sharedService } from "src/app/services/shared.service";
import { pullModeService } from "src/app/services/pullMode.service";

@Component({
  selector: "app-chat-notifications",
  templateUrl: "./chat-notifications.component.html",
  styleUrls: ["./chat-notifications.component.scss"]
})
export class ChatNotificationsComponent implements OnInit {
  pushModeRequests = [];
  pullModeRequests = [];

  constructor(
    public _pullModeservice: pullModeService,
    private _sharedService: sharedService,
    private _socketService: socketService,
    private _cacheService: cacheService,
    private _router: Router
  ) {
    this._sharedService.serviceCurrentMessage.subscribe((e: any) => {
      if (e.msg == "openPushModeRequestHeader") {
        this.pushModeRequests.push(e.data);
      } else if (e.msg == "closePushModeRequestHeader") {
        this.removePushModeRequestFromRequestArray(e.data.topicId);
      } else if (e.msg == "openPullModeRequestHeader") {
        this.pullModeRequests.push(e.data);
      } else if (e.msg == "closePullModeRequestHeader") {
        this.removePullModeRequestFromRequestArray(e.data);
      }
    });
  }

  ngOnInit() {}

  getTopicSubscription(topicId, taskId) {
    this._socketService.emit("topicSubscription", {
      topicParticipant: new TopicParticipant("AGENT", this._cacheService.agent, topicId, "PRIMARY", "SUBSCRIBED"),
      agentId: this._cacheService.agent.id,
      topicId: topicId,
      taskId: taskId
    });
    this.removePushModeRequestFromRequestArray(topicId);
    this._router.navigate(["customers"]);
  }

  removePushModeRequestFromRequestArray(topicId) {
    let index = this._sharedService.getIndexFromTopicId(topicId, this.pushModeRequests);
    if (index != -1) {
      this._sharedService.spliceArray(index, this.pushModeRequests);
    }
  }

  removePullModeRequestFromRequestArray(reqId) {
    this.pullModeRequests = this.pullModeRequests.filter((req) => {
      return req.id != reqId;
    });
  }
}
