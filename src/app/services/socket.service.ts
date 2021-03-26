import { Injectable } from "@angular/core";
import * as io from "socket.io-client";
import { BehaviorSubject, Observable } from "rxjs";
import { appConfigService } from "./appConfig.service";
import { cacheService } from "./cache.service";
import { sharedService } from "./shared.service";
import { promise } from "protractor";

@Injectable({
  providedIn: "root"
})
export class socketService {
  socket: any;
  uri: string;
  conversations: any = [];

  private _conversationsListener: BehaviorSubject<any> = new BehaviorSubject([]);

  public readonly conversationsListener: Observable<any> = this._conversationsListener.asObservable();

  constructor(private _appConfigService: appConfigService, private _cacheService: cacheService, private _sharedService: sharedService) {}

  connectToSocket() {
    this.uri = this._appConfigService.config.SOCKET_URL;

    console.log("username------ " + this._cacheService.agent.username);

    this.socket = io
      .connect(this.uri, {
        query: {
          //  token: this._cacheService.agent.details.access_token,
          agent: JSON.stringify(this._cacheService.agent)
        }
      })
      .on("error", function (err) {
        console.error(err);
      });

    this.listen("agentPresence").subscribe((res: any) => {
      console.log(res);
      this._cacheService.agentPresence = res;
      this._sharedService.serviceChangeMessage({ msg: "stateChanged", data: null });
    });

    this.listen("errors").subscribe((res: any) => {
      console.log("socket errors ", res);
    });

    this.listen("taskRequest").subscribe((res: any) => {
      console.log("taskRequest ", res);
      this.triggerNewChatRequest(res);
    });

    this.listen("onCimEvent").subscribe((res: any) => {
      console.log("onCimEvent", res);
       this.onCimEventHandler(JSON.parse(res.cimEvent), res.topicId);
    //  this.onCimEventHandler(res.cimEvent, res.topicId);

    });

    this.listen("onOldCimEvents").subscribe((res: any) => {
      console.log("onOldCimEvents", res);
      this.onOldCimEventsHandler(res.cimEvents, res.topicId);
    });

    this.listen("topicUnsubscription").subscribe((res: any) => {
      console.log("topicUnsubscription", res);
      this.removeConversation(res.topicId);
    });
  }

  listen(eventName: string) {
    return new Observable((res) => {
      this.socket.on(eventName, (data) => {
        res.next(data);
      });
    });
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  triggerNewChatRequest(data) {
    this._sharedService.serviceChangeMessage({ msg: "openRequestHeader", data: data });
  }

  onCimEventHandler(cimEvent, topicId) {
    let sameTopicConversation = this.conversations.find((e) => {
      return e.topicId == topicId;
    });

    if (cimEvent.type.toLowerCase() == "message") {
      if (sameTopicConversation) {
        sameTopicConversation.messages.push(cimEvent.data);
        sameTopicConversation.unReadCount ? undefined : (sameTopicConversation.unReadCount = 0);
        if (cimEvent.data.header.sender.type.toLowerCase() == "customer") {
          sameTopicConversation["activeChannelSessions"] = this.getActiveChannelSessions(sameTopicConversation.messages);

          ++sameTopicConversation.unReadCount;
        }
      } else {
        this.conversations.push({
          topicId: topicId,
          messages: [cimEvent.data],
          activeChannelSessions: [cimEvent.data.header.channelSession],
          unReadCount: undefined
        });
      }
      this._conversationsListener.next(this.conversations);
    } else if (cimEvent.type.toLowerCase() == "suggestion") {
      this.mergeBotSuggestions(sameTopicConversation, cimEvent.data);
    }
  }

  onOldCimEventsHandler(cimEvents, topicId) {
    let oldTopicMessages = [];
    cimEvents.forEach((cimEvent) => {
      if (cimEvent.type.toLowerCase() == "message") {
        oldTopicMessages.push(cimEvent.data);
      }
    });
    let activeChannelSessions = this.getActiveChannelSessions(oldTopicMessages);
    this.conversations.push({ topicId: topicId, messages: oldTopicMessages, activeChannelSessions: activeChannelSessions, unReadCount: undefined });
    this._conversationsListener.next(this.conversations);
  }

  getActiveChannelSessions(messages) {
    let lookup = {};
    let activeChannelSessions = [];

    for (let message, i = 0; (message = messages[i++]); ) {
      if (message.header.sender.type.toLowerCase() == "customer") {
        let id = message.header.channelSession.id;

        if (!(id in lookup)) {
          lookup[id] = 1;
          activeChannelSessions.push(message.header.channelSession);
        }
      }
    }
    return activeChannelSessions;
  }

  removeConversation(topicId) {
    this.conversations = this.conversations.filter((e) => {
      return e.topicId != topicId;
    });
    this._conversationsListener.next(this.conversations);
  }

  mergeBotSuggestions(conversation, suggestionMessage) {
    let message = conversation.messages.find((e) => {
      if (e.header.sender.type.toLowerCase() == "customer") {
        return e.id == suggestionMessage.requestedMessage.id;
      }
    });

    if (message) {
      message["botSuggestions"] = suggestionMessage.suggestions;
      message["showBotSuggestions"] = false;
      console.log("bot suggestion founded ", message);
      this._conversationsListener.next(this.conversations);
    }
  }
}
