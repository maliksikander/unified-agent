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
import { pullModeService } from "./pullMode.service";
import { soundService } from "./sounds.service";

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
    private _pullModeService: pullModeService,
    private _router: Router,
    private _soundService: soundService
  ) {
  }

  connectToSocket() {
    this.uri = this._appConfigService.config.SOCKET_URL;
    let origin = new URL(this.uri).origin;
    let path = new URL(this.uri).pathname;
    console.log("username------ " + this._cacheService.agent.username);

    this.socket = io(origin, {
      path: path == "/" ? "" : path + "/socket.io",
      auth: {
        //  token: this._cacheService.agent.details.access_token,
        agent: JSON.stringify(this._cacheService.agent)
        //agent: ""
      }
    });

    this.socket.on("connect_error", (err) => {
      console.error("socket connect_error " + err.message);
      this._snackbarService.open("'Socket error': " + err.message, "err");
      if (err.message == "not valid agent") {
        this.moveToLogin();
      }
    });

    this.socket.on("connect", (e) => {
      console.log("socket connect " + e);
    });

    this.socket.on("disconnect", (reason) => {
      console.error("socket disconnect " + reason);

      // this means that server forcefully disconnects the socket connection
      if (reason == "io server disconnect") {
        localStorage.clear();
        sessionStorage.clear();
        this._cacheService.resetCache();
        this._router.navigate(["login"]).then(() => {
          window.location.reload();
        });
      }
    });

    this.listen("agentPresence").subscribe((res: any) => {
      console.log(res.data);
      this._sharedService.serviceChangeMessage({ msg: "stateChanged", data: res.data.agentPresence });
    });

    this.listen("errors").subscribe((res: any) => {
      console.log("socket errors ", res.data);
      this.onSocketErrors(res.data);
    });

    this.listen("taskRequest").subscribe((res: any) => {
      console.log("taskRequest ", res.data);
      this.triggerNewChatRequest(res.data);
    });

    this.listen("revokeTask").subscribe((res: any) => {
      console.log("revokeTask ", res.data);
      this.revokeChatRequest(res.data);
    });

    this.listen("onCimEvent").subscribe((res: any) => {
      try {
        this.onCimEventHandler(JSON.parse(res.data.cimEvent), res.data.topicId);
      } catch (err) {
        console.error("error on onCimEvent ", err);
      }
    });

    this.listen("onTopicData").subscribe((res: any) => {
      console.log("onTopicData", res.data);
      this.onTopicData(res.data.topicData, res.data.topicId);
      res.callback({
        status: "ok"
      });
    });

    this.listen("topicUnsubscription").subscribe((res: any) => {
      console.log("topicUnsubscription", res.data);
      this.removeConversation(res.data.topicId);
    });

    this.listen("topicClosed").subscribe((res: any) => {
      console.log("topicClosed", res.data);
      this.changeTopicStateToClose(res.data.topicId);
    });

    this.listen("socketSessionRemoved").subscribe((res: any) => {
      console.log("socketSessionRemoved", res.data);
      this.onSocketSessionRemoved();
    });

    this.listen("onPullModeSubscribedList").subscribe((res: any) => {
      console.log("onPullModeSubscribedList", res.data);
      this._pullModeService.updateSubscribedList(res.data);
    });

    this.listen("onPullModeSubscribedListRequest").subscribe((res: any) => {
      try {
        console.log("onPullModeSubscribedListRequest", res.data);
        this._pullModeService.updateSubscribedListRequests(JSON.parse(res.data.pullModeEvent), res.data.type);
      } catch (err) {
        console.error(err);
      }
    });

    this.listen("pullModeSubscribedListRequests").subscribe((res: any) => {
      console.log("pullModeSubscribedListRequests", res.data);
      this._pullModeService.initializedSubscribedListRequests(res.data);
    });

    this.listen("addPullModeSubscribedListRequests").subscribe((res: any) => {
      console.log("addPullModeSubscribedListRequests", res.data);
      this._pullModeService.addPullModeSubscribedListRequests(res.data);
    });

    this.listen("removePullModeSubscribedListRequests").subscribe((res: any) => {
      console.log("removePullModeSubscribedListRequests", res.data);
      this._pullModeService.removePullModeSubscribedListRequests(res.data);
    });

    this.listen("onChannelTypes").subscribe((res: any) => {
      console.log("onChannelTypes", res.data);
      this._sharedService.setChannelIcons(res.data);
    });
  }


  disConnectSocket() {
    try {
      this.socket.disconnect();
    } catch (err) { }
  }

  listen(eventName: string) {
    return new Observable((res) => {
      this.socket.on(eventName, function (data, callback) {
        res.next({ data: data, callback: callback });
      });
    });
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  triggerNewChatRequest(data) {
    this._sharedService.serviceChangeMessage({ msg: "openPushModeRequestHeader", data: data });
  }

  revokeChatRequest(data) {
    this._sharedService.serviceChangeMessage({ msg: "closePushModeRequestHeader", data: data });
  }

  onCimEventHandler(cimEvent, topicId) {
    console.log("cim event ", cimEvent);
    let sameTopicConversation = this.conversations.find((e) => {
      return e.topicId == topicId;
    });

    if (
      cimEvent.name.toLowerCase() == "agent_message" ||
      cimEvent.name.toLowerCase() == "bot_message" ||
      cimEvent.name.toLowerCase() == "customer_message"
    ) {

      if (cimEvent.name.toLowerCase() != "agent_message") {
        this.playSoundAndBrowserNotification(sameTopicConversation, cimEvent);
      }

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
    alert("you are logged in from another session");
  }

  onTopicData(topicData, topicId) {

    this._soundService.playBeep();

    let conversation = {
      topicId: topicId,
      messages: [],
      activeChannelSessions: [],
      unReadCount: undefined,
      index: ++this.conversationIndex,
      state: "ACTIVE",
      customer: topicData.customer,
      customerSuggestions: topicData.customerSuggestions,
      topicParticipant: topicData.topicParticipant
    };

    // feed the conversation with type "messages"
    topicData.topicEvents.forEach((event, i) => {
      if (
        event.name.toLowerCase() == "agent_message" ||
        event.name.toLowerCase() == "bot_message" ||
        event.name.toLowerCase() == "customer_message"
      ) {
        conversation.messages.push(event.data);
      }
    });

    // feed the active channel sessions
    topicData.participants.forEach((e) => {
      if (e.type.toLowerCase() == "customer") {
        let participant = e.participant;

        // seprate the webChanneldata in channel session if found in additionalAttributes
        let webChannelData = participant.channelData.additionalAttributes.find((e) => { return e.type.toLowerCase() == "webchanneldata" });
        if (webChannelData) {
          participant['webChannelData'] = webChannelData.value;
        }
        conversation.activeChannelSessions.push(participant);
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

    conversation.customer = cimEvent.data;
  }

  removeConversation(topicId) {
    // fetching the whole conversation which needs to be removed
    const removedConversation = this.conversations.find((conversation) => {
      return conversation.topicId == topicId;
    });

    // remove the conversation from array
    let index = this.conversations.findIndex((conversation) => { return conversation.topicId == topicId; });

    if (index != -1) {
      this._sharedService.spliceArray(index, this.conversations);
      --this.conversationIndex;
    }

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

    if (suggestionMessage && suggestionMessage.requestedMessage && suggestionMessage.requestedMessage.id) {

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

    if (conversation) {
      let index = conversation.activeChannelSessions.findIndex((channelSession) => {
        return channelSession.id === cimEvent.data.id;
      });

      if (index != -1) {
        conversation.activeChannelSessions.splice(index, 1);
        console.log("channel session removed");
      } else {
        console.error("channelSessionId not found to removed");
      }
    }
  }

  addChannelSession(cimEvent, topicId) {
    let conversation = this.conversations.find((e) => {
      return e.topicId == topicId;
    });

    if (conversation) {
      conversation.activeChannelSessions.push(cimEvent.data);
    } else {
      console.error("channelSessionId not found to added");
    }
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

    // // in case of pull mode request, the topicId is the id of that request
    // this._pullModeService.deleteRequestByRequestId(topicId);
  }

  onSocketErrors(res) {
    this._snackbarService.open("on " + res.task + " " + res.msg, "err");
  }

  playSoundAndBrowserNotification(conversation, cimEvent) {

    if (document.hidden) {

      this.showOnBrowserNoticication(conversation, cimEvent);

    } else {
      if (this._router.url !== '/customers/chats') {

        this.showOnBrowserNoticication(conversation, cimEvent);

      }
    }
    this._soundService.playBeep();

  }

  showOnBrowserNoticication(conversation, cimEvent) {

    if (cimEvent.name.toLowerCase() == "customer_message") {

      if (cimEvent.data.body.type.toLowerCase() == "plain") {

        this._soundService.openBrowserNotification(conversation.customer.firstName, cimEvent.data.body.markdownText);

      }
    } else if (cimEvent.name.toLowerCase() == "bot_message") {

      if (cimEvent.data.body.type.toLowerCase() == "plain") {

        this._soundService.openBrowserNotification('BOT', cimEvent.data.body.markdownText);

      }
    }
  }

  moveToLogin() {
    localStorage.clear();
    sessionStorage.clear();
    this._cacheService.resetCache();
    this._router.navigate(["login"]);
  }

}
