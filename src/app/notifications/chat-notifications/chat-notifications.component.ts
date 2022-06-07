import { Component, OnInit, Inject, Input } from "@angular/core";
import { cacheService } from "src/app/services/cache.service";
import { socketService } from "src/app/services/socket.service";
import { Output, EventEmitter } from "@angular/core";
import { TopicParticipant } from "../../models/User/Interfaces";
import { Router } from "@angular/router";
import { sharedService } from "src/app/services/shared.service";
import { pullModeService } from "src/app/services/pullMode.service";
import { soundService } from "src/app/services/sounds.service";
import { finesseService } from "src/app/services/finesse.service";

@Component({
  selector: "app-chat-notifications",
  templateUrl: "./chat-notifications.component.html",
  styleUrls: ["./chat-notifications.component.scss"]
})
export class ChatNotificationsComponent implements OnInit {
  pushModeRequests = [];
  pullModeRequests = [];
  notificationArea: boolean = false;

  constructor(
    public _pullModeservice: pullModeService,
    private _sharedService: sharedService,
    private _socketService: socketService,
    private _cacheService: cacheService,
    private _router: Router,
    private _soundService: soundService,
    private _finesseService: finesseService
  ) {
    this._sharedService.serviceCurrentMessage.subscribe((e: any) => {
      console.log("e==>", e);
      if (e.msg == "openPushModeRequestHeader") {
        this.pushModeRequests.push(e.data);
        this._soundService.playRing();
        if (e.data.cisco_data) {
          this._soundService.openBrowserNotification(
            "Incoming Call Alert",
            "Incoming call alert request : " + e.data.channelSession.channel.channelType.name
          );
        } else {
          this._soundService.openBrowserNotification(
            "CHAT REQUESTED",
            "Incoming chat request on push mode on " + e.data.channelSession.channel.channelType.name
          );
        }
      } else if (e.msg == "closePushModeRequestHeader") {
        this.removePushModeRequestFromRequestArray(e.data.conversationId);
      } else if (e.msg == "openPullModeRequestHeader") {
        this.pullModeRequests.push(e.data);
        this._soundService.playRing();
        this._soundService.openBrowserNotification(
          "CHAT REQUESTED",
          "Incoming chat request on pull mode on " + this._pullModeservice.listNames[e.data.listId]
        );
      } else if (e.msg == "closePullModeRequestHeader") {
        this.removePullModeRequestFromRequestArray(e.data);
      } else {
        console.log("e2==>", e);
      }
    });
  }

  ngOnInit() {}

  acceptCall(ciscoData) {
    let data = {
      action: "answerCall",
      parameter: {
        dialogId: ciscoData.response.dialog.id
      }
    };
    console.log("answer data==>", data);
    this._finesseService.acceptCallOnFinesse(data);
  }

  getTopicSubscription(conversationId, taskId, ciscoData = null) {
    console.log("channelType$$==>", ciscoData);
    if (ciscoData) {
      this.acceptCall(ciscoData);
    } else {
      this._socketService.emit("topicSubscription", {
        topicParticipant: new TopicParticipant("AGENT", this._cacheService.agent, conversationId, "PRIMARY", "SUBSCRIBED"),
        agentId: this._cacheService.agent.id,
        conversationId: conversationId,
        taskId: taskId
      });
    }

    this.removePushModeRequestFromRequestArray(conversationId);
    this._router.navigate(["customers"]);
  }

  removePushModeRequestFromRequestArray(conversationId) {
    let index = this._sharedService.getIndexFromConversationId(conversationId, this.pushModeRequests);
    if (index != -1) {
      this._sharedService.spliceArray(index, this.pushModeRequests);
    }
    this._soundService.stopRing();
  }

  removePullModeRequestFromRequestArray(reqId) {
    this.pullModeRequests = this.pullModeRequests.filter((req) => {
      return req.id != reqId;
    });
    this._soundService.stopRing();
  }
}
