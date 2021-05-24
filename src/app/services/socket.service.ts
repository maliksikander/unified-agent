import { Injectable } from "@angular/core";
import { io } from "socket.io-client";
import { BehaviorSubject, Observable } from "rxjs";
import { appConfigService } from "./appConfig.service";
import { cacheService } from "./cache.service";
import { sharedService } from "./shared.service";
import { CimEvent } from "../models/Event/cimEvent";
import { snackbarService } from "./snackbar.service";

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
    private _sharedService: sharedService
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

    this.listen("topicClosed").subscribe((res: any) => {
      console.log("topicClosed", res);
      this.changeTopicStateToClose(res.topicId);
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
    } else if (cimEvent.name.toLowerCase() == "channel_session_ended") {
      this.removeChannelSession(cimEvent, topicId);
    }
  }

  // onOldCimEventsHandler_depricate(cimEvents, topicId) {
  //   let oldTopicMessages = [];
  //   let endedChannelSessions = [];

  //   // pushed CIM messages
  //   cimEvents.forEach((cimEvent) => {
  //     if (cimEvent.type.toLowerCase() == "message") {
  //       oldTopicMessages.push(cimEvent.data);
  //     }
  //     if (cimEvent.nane.toLowerCase() == "channel_session_ended") {
  //       endedChannelSessions.push(cimEvent.data);
  //     }
  //   });

  //   // get active channel sessions
  //   let activeChannelSessions = this.getActiveChannelSessions(oldTopicMessages);

  //   // remove ended channel sessions
  //   endedChannelSessions.forEach((endedChannelSession) => {
  //     let index = activeChannelSessions.findIndex((activeChannelSession) => { activeChannelSession.id === endedChannelSession.id });
  //     activeChannelSessions.splice(index, 1);
  //   })

  //   // push the conversation in conversation array
  //   this.conversations.push({ topicId: topicId, messages: oldTopicMessages, activeChannelSessions: activeChannelSessions, unReadCount: undefined, index: ++this.conversationIndex });
  //   this._conversationsListener.next(this.conversations);
  // }

  onOldCimEventsHandler(cimEvents, topicId) {
    let conversation = {
      topicId: topicId,
      messages: [],
      activeChannelSessions: [],
      unReadCount: undefined,
      index: ++this.conversationIndex,
      state: "ACTIVE"
    };
    cimEvents.forEach((cimEvent, i) => {
      if (cimEvent.type.toLowerCase() == "message") {
        // for the first message, feed the conversation with message and active channel session
        if (i == 0) {
          conversation.messages.push(cimEvent.data);
          conversation.activeChannelSessions.push(cimEvent.data.header.channelSession);
        }

        // for other messages rather than 1st, of type customer, process the active channel sessions
        if (cimEvent.data.header.sender.type.toLowerCase() == "customer") {
          this.processActiveChannelSessions(conversation, cimEvent.data.header.channelSession);
        }
        if (i != 0) {
          conversation.messages.push(cimEvent.data);
        }
      }

      // if there is an event of channel session ended, then process that event and remove that channel from
      // active channel sessions
      if (cimEvent.name.toLowerCase() == "channel_session_ended") {
        // find the index of channel session which needs to be removed
        let index = conversation.activeChannelSessions.findIndex((channelSession) => {
          return channelSession.id === cimEvent.data.id;
        });

        if (index != -1) {
          conversation.activeChannelSessions.splice(index, 1);
        }
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

    if (matched) {
      // if matched push that channel session to the last in array
      // thats why first removing it from the array for removing duplicate entry
      conversation.activeChannelSessions.splice(index, 1);
    }

    // pusing the incoming channel to the last in array
    conversation.activeChannelSessions.push(incomingChannelSession);
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

    conversation.activeChannelSessions.splice(index, 1);
  }

  changeTopicStateToClose(topicId) {
    // find the conversation
    let conversation = this.conversations.find((e) => {
      return e.topicId == topicId;
    });
    // change the conversation state to "CLOSED"
    conversation.state = "CLOSED";
  }
}
