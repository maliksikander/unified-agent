import { Component, OnInit, Inject, Input } from "@angular/core";
import { cacheService } from "src/app/services/cache.service";
import { socketService } from "src/app/services/socket.service";
import { Output, EventEmitter } from "@angular/core";
import { TopicParticipant } from "../../models/User/Interfaces";
import { Router } from "@angular/router";
import { sharedService } from "src/app/services/shared.service";

@Component({
  selector: "app-chat-notifications",
  templateUrl: "./chat-notifications.component.html",
  styleUrls: ["./chat-notifications.component.scss"]
})
export class ChatNotificationsComponent implements OnInit {

  pushModeRequests = [];
  pullModeRequests = [];

  constructor(private _sharedService: sharedService, private _socketService: socketService, private _cacheService: cacheService, private _router: Router) {
    this._sharedService.serviceCurrentMessage.subscribe((e: any) => {
      if (e.msg == "openRequestHeader") {
        // if request is push mode then push it in the pushmode list
        if (e.data.channelSession.channel.channelConfig.routingPolicy.routingMode == 'PUSH') {
          this.pushModeRequests.push(e.data);
        } else {
          // else push it in pull mode
          this.pullModeRequests.push(e.data);
        }

      }
      if (e.msg == "closeRequestHeader") {
        this.removeRequestFromRequestArray(e.data.topicId);
      }
    });
  }

  ngOnInit() {

  }

  getTopicSubscription(topicId, taskId) {
    this._socketService.emit("topicSubscription", {
      topicParticipant: new TopicParticipant("AGENT", this._cacheService.agent, topicId, "PRIMARY", "SUBSCRIBED"),
      agentId: this._cacheService.agent.id,
      topicId: topicId,
      taskId: taskId
    });
    this.removeRequestFromRequestArray(topicId);
    this._router.navigate(["customers"]);
  }

  removeRequestFromRequestArray(topicId) {
    // when request comes for revoke task first it checks in pushmode list 
    let index = -1;
    index = this._sharedService.getIndexFromTopicId(topicId, this.pushModeRequests);
    if (index != -1) {
      // if found then removes from pushmode list
      this._sharedService.spliceArray(index, this.pushModeRequests);
    } else {
      // if not then checks in pull mode list
      index = this._sharedService.getIndexFromTopicId(topicId, this.pullModeRequests);
      if (index != -1) {
        this._sharedService.spliceArray(index, this.pullModeRequests);
      }
    }

  }
}
