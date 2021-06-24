import { Injectable } from "@angular/core";
import { io } from "socket.io-client";
import { BehaviorSubject, Observable } from "rxjs";
import { Router } from "@angular/router";
import { appConfigService } from "./appConfig.service";
import { cacheService } from "./cache.service";
import { sharedService } from "./shared.service";
import { CimEvent } from "../models/Event/cimEvent";
import { snackbarService } from "./snackbar.service";
import { error } from "console";

@Injectable({
  providedIn: "root"
})
export class socketService {
  socket: any;
  uri: string;
  conversations: any = [];
  conversationIndex = -1;

  private _conversationsListener: BehaviorSubject<any> = new BehaviorSubject([]);

  public readonly conversationsListener: Observable<any> = this._conversationsListener.asObservable();

  constructor(
    private _snackbarService: snackbarService,
    private _appConfigService: appConfigService,
    private _cacheService: cacheService,
    private _sharedService: sharedService,
    private _router: Router
  ) {}

  connectToSocket() {
    this.uri = this._appConfigService.config.SOCKET_URL;

    console.log("username------ " + this._cacheService.agent.username);

    this.socket = io(this.uri, {
      auth: {
        //  token: this._cacheService.agent.details.access_token,
        agent: JSON.stringify(this._cacheService.agent)
        //agent: ""
      }
    });

    this.socket.on("connect_error", (err) => {
      console.error("socket connect_error " + err);
    });

    this.socket.on("connect", (e) => {
      console.log("socket connect " + e);
    });

    this.socket.on("disconnect", (e) => {
      console.error("socket disconnect " + e);
    });

    this.listen("agentPresence").subscribe((res: any) => {
      console.log(res);
      this._sharedService.serviceChangeMessage({ msg: "stateChanged", data: res });
    });

    this.listen("errors").subscribe((res: any) => {
      console.log("socket errors ", res);
    });

    this.listen("taskRequest").subscribe((res: any) => {
      console.log("taskRequest ", res);
      this.triggerNewChatRequest(res);
    });

    this.listen("revokeTask").subscribe((res: any) => {
      console.log("revokeTask ", res);
      this.revokeChatRequest(res);
    });

    this.listen("onCimEvent").subscribe((res: any) => {
      console.log("onCimEvent", res);
      this.onCimEventHandler(JSON.parse(res.cimEvent), res.topicId);
    });

    this.listen("onTopicData").subscribe((res: any) => {
      console.log("onTopicData", res);
      this.onTopicData(res.topicData, res.topicId);
    });

    this.listen("topicUnsubscription").subscribe((res: any) => {
      console.log("topicUnsubscription", res);
      this.removeConversation(res.topicId);
    });

    this.listen("topicClosed").subscribe((res: any) => {
      console.log("topicClosed", res);
      this.changeTopicStateToClose(res.topicId);
    });

    this.listen("socketSessionRemoved").subscribe((res: any) => {
      console.log("socketSessionRemoved", res);
      this.onSocketSessionRemoved();
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

  revokeChatRequest(data) {
    this._sharedService.serviceChangeMessage({ msg: "closeRequestHeader", data: data });
  }

  onCimEventHandler(cimEvent, topicId) {
    let sameTopicConversation = this.conversations.find((e) => {
      return e.topicId == topicId;
    });

    if (cimEvent.type.toLowerCase() == "message") {
      if (sameTopicConversation) {
        if (cimEvent.data.header.sender.type.toLowerCase() == "customer") {
          this.processActiveChannelSessions(sameTopicConversation, cimEvent.data.header.channelSession);
          ++sameTopicConversation.unReadCount;
        }
        sameTopicConversation.messages.push(cimEvent.data);
        sameTopicConversation.unReadCount ? undefined : (sameTopicConversation.unReadCount = 0);
      } else {
        this.conversations.push({
          topicId: topicId,
          messages: [cimEvent.data],
          activeChannelSessions: [cimEvent.data.header.channelSession],
          unReadCount: undefined,
          index: ++this.conversationIndex,
          state: "ACTIVE"
        });
      }
      this._conversationsListener.next(this.conversations);
    } else if (cimEvent.type.toLowerCase() == "suggestion") {
      this.mergeBotSuggestions(sameTopicConversation, cimEvent.data);
    } else if (cimEvent.name.toLowerCase() == "channel_session_started") {
      this.addChannelSession(cimEvent, topicId);
    } else if (cimEvent.name.toLowerCase() == "channel_session_ended") {
      this.removeChannelSession(cimEvent, topicId);
    } else if (cimEvent.name.toLowerCase() == "associated_customer_changed") {
      this.changeTopicCustomer(cimEvent, topicId);
    }
  }

  onSocketSessionRemoved() {
    this._snackbarService.open("you are logged In from another session", "err");
    localStorage.clear();
    this._router.navigate(["login"]).then(() => {
      window.location.reload();
    });
  }

  onTopicData(topicData, topicId) {
    let conversation = {
      topicId: topicId,
      messages: [],
      activeChannelSessions: [],
      unReadCount: undefined,
      index: ++this.conversationIndex,
      state: "ACTIVE",
      associatedCustomer: topicData.associatedCustomer,
      customerSuggestions: topicData.customerSuggestions,
      topicParticipant: topicData.topicParticipant
    };

    // feed the conversation with type "messages"
    topicData.cimEvents.forEach((cimEvent, i) => {
      if (cimEvent.type.toLowerCase() == "message") {
        conversation.messages.push(cimEvent.data);
      }
    });

    // feed the active channel sessions
    topicData.participants.forEach((e) => {
      if (e.type.toLowerCase() == "customer") {
        conversation.activeChannelSessions.push(e.participant);
      }
    });

    this.conversations.push(conversation);
    this._conversationsListener.next(this.conversations);
  }

  // getActiveChannelSessions(messages) {
  //   let lookup = {};
  //   let activeChannelSessions = [];

  //   for (let message, i = 0; (message = messages[i++]);) {
  //     if (message.header.sender.type.toLowerCase() == "customer") {
  //       let id = message.header.channelSession.id;

  //       if (!(id in lookup)) {
  //         lookup[id] = 1;
  //         activeChannelSessions.push(message.header.channelSession);
  //       }
  //     }
  //   }
  //   return activeChannelSessions;
  // }

  processActiveChannelSessions(conversation, incomingChannelSession) {
    let matched: boolean = false;
    let index = null;

    conversation.activeChannelSessions.forEach((activeChannelSession, i) => {
      if (activeChannelSession.id === incomingChannelSession.id) {
        matched = true;
        index = i;
        return;
      }
    });

    if (matched && conversation.activeChannelSessions.length - 1 != index) {
      // if matched and session is not at the last of the array then push that channel session to the last in array
      // thats why first removing it from the array for removing duplicate entry
      conversation.activeChannelSessions.splice(index, 1);

      // pusing the incoming channel to the last in array
      conversation.activeChannelSessions.push(incomingChannelSession);
    }
  }

  changeTopicCustomer(cimEvent, topicId) {
    let conversation = this.conversations.find((e) => {
      return e.topicId == topicId;
    });

    conversation.associatedCustomer = cimEvent.data;
  }

  removeConversation(topicId) {
    // fetching the whole conversation which needs to be removed
    const removedConversation = this.conversations.find((conversation) => {
      return conversation.topicId == topicId;
    });

    // remove the conversation from array
    this.conversations = this.conversations.filter((conversation) => {
      return conversation.topicId != topicId;
    });

    // alter the rest of the conversation's indexes whose indexes are greater than the index of removed conversation
    // in order to remap the conversation indexex along with the indexes of the map tabs
    this.conversations.map((conversation) => {
      if (conversation.index > removedConversation.index) {
        conversation.index = --conversation.index;
      }
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

  linkCustomerWithInteraction(customerId, topicId) {
    this.emit("publishCimEvent", {
      cimEvent: new CimEvent("ASSOCIATED_CUSTOMER_CHANGED", "NOTIFICATION", { Id: customerId }),
      agentId: this._cacheService.agent.id,
      topicId: topicId
    });
    this._snackbarService.open("CUSTOMER LINKED SUCCESSFULLY", "succ");
  }

  removeChannelSession(cimEvent, topicId) {
    let conversation = this.conversations.find((e) => {
      return e.topicId == topicId;
    });

    let index = conversation.activeChannelSessions.findIndex((channelSession) => {
      return channelSession.id === cimEvent.data.id;
    });

    if (index != -1) {
      conversation.activeChannelSessions.splice(index, 1);
      console.log("channel session removed");
    } else {
      console.log("channelSessionId not found");
    }
  }

  addChannelSession(cimEvent, topicId) {
    let conversation = this.conversations.find((e) => {
      return e.topicId == topicId;
    });

    conversation.activeChannelSessions.push(cimEvent.data);
  }

  changeTopicStateToClose(topicId) {
    // // find the conversation
    // let conversation = this.conversations.find((e) => {
    //   return e.topicId == topicId;
    // });
    // // change the conversation state to "CLOSED"
    // conversation.state = "CLOSED";
    this._snackbarService.open("A conversation is removed", "err");
    this.removeConversation(topicId);
  }
}
