import { Component, OnInit, Inject, Input } from "@angular/core";
import { cacheService } from "src/app/services/cache.service";
import { socketService } from "src/app/services/socket.service";
import { TopicParticipant } from "../../models/User/Interfaces";
import { Router } from "@angular/router";
import { sharedService } from "src/app/services/shared.service";
import { pullModeService } from "src/app/services/pullMode.service";
import { soundService } from "src/app/services/sounds.service";
import { finesseService } from "src/app/services/finesse.service";
import { TranslateService } from "@ngx-translate/core";
import { appConfigService } from "src/app/services/appConfig.service";
import { SipService } from "src/app/services/sip.service";
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
    private _sipService: SipService,
    private _appConfigService: appConfigService,
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
          this.getVoiceChannelType(e.data.provider);
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
          // this.externalModeRequests = e.data;
          let dialog = e.data.dialog ? e.data.dialog : e.data;
          if (this.externalModeRequests.length > 0) {
            let index = this.externalModeRequests.findIndex((item) => {
              return item.dialogData.id == dialog.id;
            });
            console.log("Closing Index==>", index);
            if (index != -1) this.externalModeRequests.splice(index, 1);
          }
        } else if (e.msg == "closeAllPushModeRequests") {
          this.pushModeRequests = [];
        }
      } catch (error) {
        console.error("[serviceCurrentMessage Subscriber] Error :", error);
      }
    });
  }

  ngOnInit() {}

  onDismiss(announcement){
    this._announcementService.removeAnnoucementFromNotificationList(announcement);

  }

  getVoiceChannelType(provider) {
    let channelTypes: Array<any> = this._sharedService.channelTypeList;
    let ciscoChannelType;
    let cxVoiceChannelType;
    ciscoChannelType = channelTypes.find((item) => item.name == "CISCO_CC");
    cxVoiceChannelType = channelTypes.find((item) => item.name == "CX_VOICE");
    if (provider == "cisco") this.voiceChannelType = ciscoChannelType;
    else if (provider == "cx_voice") this.voiceChannelType = cxVoiceChannelType;
  }

  acceptCall(data) {
    let acceptCommand = {
      action: "answerCall",
      parameter: {
        dialogId: data.dialogData.id
      }
    };
    console.log("accept Data==>",acceptCommand)
    if (data.provider == "cx_voice") {
      this._sipService.acceptCallOnSip(acceptCommand);
    } else if (data.provider == "cisco") {
      this._finesseService.acceptCallOnFinesse(acceptCommand);
    }
  }

  onAcceptCallback(conversationId, taskId, taskDirection) {
    this.getTopicSubscription(conversationId, taskId, taskDirection);
  }

  onExternalRequestAccept(data) {
    this.acceptCall(data);
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
