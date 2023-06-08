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
import { TranslateService } from "@ngx-translate/core";
import { announcementService } from "src/app/services/announcement.service";

@Component({
  selector: "app-chat-notifications",
  templateUrl: "./chat-notifications.component.html",
  styleUrls: ["./chat-notifications.component.scss"]
})
export class ChatNotificationsComponent implements OnInit {
  pushModeRequests = [];
  pullModeRequests = [];
  externalModeRequests = [];
  notificationArea: boolean = false;
  voiceChannelType;
  //newAnnouncement =true;

  constructor(
    public _pullModeservice: pullModeService,
    private _sharedService: sharedService,
    private _socketService: socketService,
    private _cacheService: cacheService,
    private _router: Router,
    private _soundService: soundService,
    private _finesseService: finesseService,
    private _translateService: TranslateService,
    public _announcementService:announcementService
  ) {
    this._sharedService.serviceCurrentMessage.subscribe((e: any) => {
      try {
        if (e.msg == "openPushModeRequestHeader") {
          this.pushModeRequests.push(e.data);
          this._soundService.playRing();
          if (e.data.cisco_data) {
            this._soundService.openBrowserNotification(
              this._translateService.instant("snackbar.Incoming-Call-Alert"),
              this._translateService.instant("snackbar.Incoming-call-alert-request") + e.data.channelSession.channel.channelType.name
            );
            // this._finesseService.voiceChannelSessionSubject.next({
            //   conversationId: e.data.conversationId,
            //   channelSession: e.data.channelSession
            // });
          } else {
            this._soundService.openBrowserNotification(
              this._translateService.instant("snackbar.CHAT-REQUESTED"),
              this._translateService.instant("snackbar.Incoming-chat-request-on-push-mode-on") + e.data.channelSession.channel.channelType.name
            );
          }
        } else if (e.msg == "closePushModeRequestHeader") {
          this.removePushModeRequestFromRequestArray(e.data.conversationId);
        } else if (e.msg == "openPullModeRequestHeader") {
          this.pullModeRequests.push(e.data);
          this._soundService.playRing();
          this._soundService.openBrowserNotification(
            this._translateService.instant("snackbar.CHAT-REQUESTED"),
            this._translateService.instant("snackbar.Incoming-chat-request-on-pull-mode-on") + this._pullModeservice.listNames[e.data.listId]
          );
        } else if (e.msg == "closePullModeRequestHeader") {
          this.removePullModeRequestFromRequestArray(e.data);
        } else if (e.msg == "openExternalModeRequestHeader") {
          this.getVoiceChannelType();
          if (this.externalModeRequests.length > 0) {
            let request = this.externalModeRequests.find((item) => {
              return item.identifier == e.data.identifier;
            });
            if (!request) this.externalModeRequests.push(e.data);
          } else {
            this.externalModeRequests.push(e.data);
          }
          console.log("external requests==>", this.externalModeRequests);
        } else if (e.msg == "closeExternalModeRequestHeader") {
          this.externalModeRequests = e.data;
        } else if (e.msg == "closeAllPushModeRequests") {

          this.pushModeRequests = [];
        }
      } catch (error) {
        console.error("[serviceCurrentMessage Subscriber] Error :", error);
      }
    });

    // this._finesseService.newIncomingVoiceRequest.subscribe((res: any) => {
    //   console.log("e==>", res);
    //   this.getVoiceChannelType();
    //   this.externalModeRequests = res;
    // });
  }

  ngOnInit() {
    // this._finesseService.removeNotification.subscribe((res) => {
    //   if (res.identifier) {
    //     this.removeExternalModeRequestFromRequestArray(res.identifier, res.conversationId);
    //   } else {
    //     this.removePushModeRequestFromRequestArray(res.conversationId);
    //   }
    // });
  }

  onDismiss(announcement){
    this._announcementService.removeAnnoucementFromNotificationList(announcement);

  }

  getVoiceChannelType() {
    let channelTypes: Array<any> = this._sharedService.channelTypeList;

    this.voiceChannelType = channelTypes.find((item) => item.name == "VOICE");
    // console.log("channelType==>", this.voiceChannelType);
  }

  acceptCall(ciscoData) {
    let data = {
      action: "answerCall",
      parameter: {
        dialogId: ciscoData.dialogData.id
      }
    };
    this._finesseService.acceptCallOnFinesse(data);
  }

  onAcceptCallback(conversationId, taskId, taskDirection) {
    // if (ciscoData) {
    // this.acceptCall(conversationId, ciscoData);
    // } else {
    this.getTopicSubscription(conversationId, taskId, taskDirection);
    // }
  }

  onExternalRequestAccept(ciscoData) {
    this.acceptCall(ciscoData);
  }

  getTopicSubscription(conversationId, taskId, taskDirection) {
    this._socketService.emit("topicSubscription", {
      topicParticipant: new TopicParticipant(
        "AGENT",
        this._cacheService.agent,
        conversationId,
        taskDirection == "CONSULT" ? "ASSISTANT" : "PRIMARY",
        "SUBSCRIBED"
      ),
      agentId: this._cacheService.agent.id,
      conversationId: conversationId,
      taskId: taskId
    });

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

  removeExternalModeRequestFromRequestArray(identifier, conversationId) {
    this.pushModeRequests.forEach((item, index) => {
      if (item.conversationId == conversationId) {
        if (item.channelSession.channelData.channelCustomerIdentifier == identifier) {
          this.pushModeRequests.splice(index, 1);
        }
      }
    });
    this._soundService.stopRing();
  }

  removePullModeRequestFromRequestArray(reqId) {
    this.pullModeRequests = this.pullModeRequests.filter((req) => {
      return req.id != reqId;
    });
    this._soundService.stopRing();
  }
}
