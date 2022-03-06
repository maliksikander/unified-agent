import { Injectable, OnInit } from "@angular/core";
import { io } from "socket.io-client";
import { BehaviorSubject, Observable } from "rxjs";
import { Router } from "@angular/router";
import { appConfigService } from "./appConfig.service";
import { cacheService } from "./cache.service";
import { sharedService } from "./shared.service";
import { CimEvent } from "../models/Event/cimEvent";
import { snackbarService } from "./snackbar.service";
import { pullModeService } from "./pullMode.service";
import { soundService } from "./sounds.service";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { httpService } from "./http.service";
import { v4 as uuidv4 } from "uuid";
//const mockTopicData: any = require("../mocks/topicData.json");

@Injectable({
  providedIn: "root"
})
export class socketService {
  socket: any;
  uri: string;
  isSocketConnected: boolean = false;
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
    private _soundService: soundService,
    private ngxService: NgxUiLoaderService,
    private _httpService: httpService
  ) {
    //  this.onTopicData(mockTopicData, "12345");
  }

  connectToSocket() {
    //load pullMode list
    this._cacheService.loadPullModeList();

    //cache customer schema
    this._cacheService.cacheCustomerSchema();

    this.uri = this._appConfigService.config.SOCKET_URL;
    let origin = new URL(this.uri).origin;
    let path = new URL(this.uri).pathname;
    console.log("username------ " + this._cacheService.agent.username);


    let fcmKeyObj = {
      desktopFcmKey: this._cacheService.isMobileDevice ? null : this._cacheService.agentFcmkey,
      mobileFcmKey: this._cacheService.isMobileDevice ? this._cacheService.agentFcmkey : null
    }

    this.socket = io(origin, {
      path: path == "/" ? "" : path + "/socket.io",
      auth: {
        //  token: this._cacheService.agent.details.access_token,
        agent: JSON.stringify(this._cacheService.agent),
        fcm: fcmKeyObj
      }
    });

    this.socket.on("connect_error", (err) => {
      this.isSocketConnected = false;
      this.ngxService.stop();
      try {
        console.error("socket connect_error ", err.data && err.data.content ? err.data.content : err);
        this._snackbarService.open(err.data && err.data.content ? err.data.content : "unable to connect to chat", "err");
      } catch (err) { }
      if (err.message == "login-failed") {
        try {
          sessionStorage.clear();
          localStorage.removeItem("ccUser");
        } catch (e) { }
        this._cacheService.resetCache();
        this.socket.disconnect();
        this.moveToLogin();
      }
    });

    this.socket.on("connect", (e) => {
      this.ngxService.stop();
      this.isSocketConnected = true;
      console.log("socket connect " + e);
      if (this._router.url == "/login") {
        this._router.navigate(["customers"]);
      }
    });

    this.subscribeToSocketEvents();
  }

  subscribeToSocketEvents() {
    this.socket.on("disconnect", (reason) => {
      console.error("socket disconnect " + reason);

      this.isSocketConnected = false;

      // this means that server forcefully disconnects the socket connection
      if (reason == "io server disconnect") {
        //  localStorage.clear();
        try {
          sessionStorage.clear();
          localStorage.removeItem("ccUser");
        } catch (e) { }
        this._cacheService.resetCache();
        this.socket.disconnect();
        this._router.navigate(["login"]).then(() => {
          window.location.reload();
        });
      }
    });

    this.socket.on("agentPresence", (res: any) => {
      console.log(res);
      this._sharedService.serviceChangeMessage({ msg: "stateChanged", data: res.agentPresence });
    });

    this.socket.on("errors", (res: any) => {
      console.log("socket errors ", res);
      this.onSocketErrors(res);
    });

    this.socket.on("taskRequest", (res: any) => {
      console.log("taskRequest ", res);
      this.triggerNewChatRequest(res);
    });

    this.socket.on("revokeTask", (res: any) => {
      console.log("revokeTask ", res);
      this.revokeChatRequest(res);
    });

    this.socket.on("onCimEvent", (res: any) => {
      try {
        this.onCimEventHandler(JSON.parse(res.cimEvent), res.topicId);
      } catch (err) {
        console.error("error on onCimEvent ", err);
        // If got any error while receiving cimEvent then simply unsubscribe to the topic
        this._snackbarService.open("Unable to process event, unsubscribing...", "err");
        this.emit("topicUnsubscription", {
          topicId: res.topicId,
          agentId: this._cacheService.agent.id
        });
      }
    });

    this.socket.on("onTopicData", (res: any, callback: any) => {
      try {
        console.log("onTopicData", res);
        this.onTopicData(res.topicData, res.topicId);
        if (callback) {
          callback({ status: "ok" });
        }
      } catch (err) {
        console.error("error on onTopicData ", err);
        this._snackbarService.open("Unable to process chat, unsubscribing...", "err");
        // If got any error while receiving topicData then simply unsubscribe to the topic
        this.emit("topicUnsubscription", {
          topicId: res.topicId,
          agentId: this._cacheService.agent.id
        });
      }
    });

    this.socket.on("topicUnsubscription", (res: any) => {
      console.log("topicUnsubscription", res);
      this.removeConversation(res.topicId);
    });

    this.socket.on("topicClosed", (res: any) => {
      console.log("topicClosed", res);
      this.changeTopicStateToClose(res.topicId);
    });

    this.socket.on("socketSessionRemoved", (res: any) => {
      console.log("socketSessionRemoved", res);
      this.onSocketSessionRemoved();
    });

    this.socket.on("onPullModeSubscribedList", (res: any) => {
      console.log("onPullModeSubscribedList", res);
      this._sharedService.mainPagetile = "NO CHAT AVAILABLE";
      this._pullModeService.updateSubscribedList(res);
    });

    this.socket.on("onPullModeSubscribedListRequest", (res: any) => {
      try {
        console.log("onPullModeSubscribedListRequest", res);
        this._pullModeService.updateSubscribedListRequests(JSON.parse(res.pullModeEvent), res.type);
      } catch (err) {
        console.error(err);
      }
    });

    this.socket.on("pullModeSubscribedListRequests", (res: any) => {
      console.log("pullModeSubscribedListRequests", res);
      this._pullModeService.initializedSubscribedListRequests(res);
    });

    this.socket.on("addPullModeSubscribedListRequests", (res: any) => {
      console.log("addPullModeSubscribedListRequests", res);
      this._pullModeService.addPullModeSubscribedListRequests(res);
    });

    this.socket.on("removePullModeSubscribedListRequests", (res: any) => {
      console.log("removePullModeSubscribedListRequests", res);
      this._pullModeService.removePullModeSubscribedListRequests(res);
    });

    this.socket.on("onChannelTypes", (res: any) => {
      console.log("onChannelTypes==>", res);
      // this._sharedService.channelTypeList = res;
      this._sharedService.setChannelIcons(res);
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

    if (sameTopicConversation) {

      if (
        cimEvent.name.toLowerCase() == "agent_message" ||
        cimEvent.name.toLowerCase() == "bot_message" ||
        cimEvent.name.toLowerCase() == "customer_message"
      ) {
        if (cimEvent.name.toLowerCase() != "agent_message") {
          this.playSoundAndBrowserNotification(sameTopicConversation, cimEvent);
        }


        if (cimEvent.data.header.sender.type.toLowerCase() == "customer") {
          this.processActiveChannelSessions(sameTopicConversation, cimEvent.data.header.channelSession);
          ++sameTopicConversation.unReadCount;
        }

        // for agent type message change the status of message
        if (cimEvent.name.toLowerCase() == "agent_message") {
          // find the message is already located in the conversation
          let cimMessage = sameTopicConversation.messages.find((message) => {
            return message.id == cimEvent.data.id;
          });
          // if yes, only update the staus
          if (cimMessage) {
            cimMessage.header["status"] = "sent";
          } else {
            // if no, marked staus as sent and push in the conversation
            cimEvent.data.header["status"] = "sent";
            sameTopicConversation.messages.push(cimEvent.data);
          }
        } else {
          sameTopicConversation.messages.push(cimEvent.data);
        }

        sameTopicConversation.unReadCount ? undefined : (sameTopicConversation.unReadCount = 0);

        this._conversationsListener.next(this.conversations);
      } else if (cimEvent.type.toLowerCase() == "suggestion") {
        this.mergeBotSuggestions(sameTopicConversation, cimEvent.data);
      } else if (cimEvent.name.toLowerCase() == "channel_session_started") {
        this.addChannelSession(cimEvent, topicId);
      } else if (cimEvent.name.toLowerCase() == "channel_session_ended") {
        this.removeChannelSession(cimEvent, topicId);
      } else if (cimEvent.name.toLowerCase() == "associated_customer_changed") {
        this.changeTopicCustomer(cimEvent, topicId);
      } else if (cimEvent.name.toLowerCase() == "agent_subscribed") {
        this.handleAgentSubscription(cimEvent, topicId);
      } else if (cimEvent.name.toLowerCase() == "agent_unsubscribed") {
        this.handleAgentSubscription(cimEvent, topicId);
      }
    } else {

      this._snackbarService.open("Unable to process event, unsubscribing...", "err");
      this.emit("topicUnsubscription", {
        topicId: topicId,
        agentId: this._cacheService.agent.id
      });
      // console.log("Topic data not available for this cimEvent, creating...");
      // this.conversations.push({
      //   topicId: topicId,
      //   messages: [cimEvent.data],
      //   activeChannelSessions: [cimEvent.data.header.channelSession],
      //   unReadCount: undefined,
      //   index: ++this.conversationIndex,
      //   state: "ACTIVE",
      //   customerSuggestions: cimEvent.data.header.channelSession.customerSuggestions,
      //   firstChannelSession: cimEvent.data.header.channelSession
      // });
    }
  }

  onSocketSessionRemoved() {
    try {
      sessionStorage.clear();
      localStorage.removeItem("ccUser");
    } catch (e) { }
    this._cacheService.resetCache();
    this._snackbarService.open("you are logged In from another session", "err");
    alert("you are logged in from another session");
  }

  onTopicData(topicData, topicId) {
    // this.removeConversation(topicId);

    let conversation = {
      topicId: topicId,
      messages: [],
      activeChannelSessions: [],
      unReadCount: undefined,
      index: ++this.conversationIndex,
      state: "ACTIVE",
      customer: topicData.customer,
      customerSuggestions: topicData.channelSession.customerSuggestions,
      topicParticipant: topicData.topicParticipant,
      firstChannelSession: topicData.channelSession
    };

    // feed the conversation with type "messages"
    topicData.topicEvents.forEach((event, i) => {
      if (
        event.name.toLowerCase() == "agent_message" ||
        event.name.toLowerCase() == "bot_message" ||
        event.name.toLowerCase() == "customer_message"
      ) {
        event.data.header["status"] = "sent";
        conversation.messages.push(event.data);
      } else if (["channel_session_started", "channel_session_ended", "agent_subscribed", "agent_unsubscribed"].includes(event.name.toLowerCase())) {
        let message = this.createSystemNotificationMessage(event);
        conversation.messages.push(message);
      }
    });

    // feed the active channel sessions
    topicData.participants.forEach((e) => {
      if (e.type.toLowerCase() == "customer") {
        let participant = e.participant;

        // seprate the webChanneldata in channel session if found in additionalAttributes
        let webChannelData = participant.channelData.additionalAttributes.find((e) => {
          return e.type.toLowerCase() == "webchanneldata";
        });
        if (webChannelData) {
          participant["webChannelData"] = webChannelData.value;
        }
        conversation.activeChannelSessions.push(participant);
      }
    });

    let oldConversation = this.conversations.find((e) => {
      return e.topicId == topicId;
    });

    if (oldConversation) {
      // if that conversation already exists update it
      oldConversation = conversation;
    } else {
      // else push that conversation
      this.conversations.push(conversation);
      this._soundService.playBeep();
    }

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

    if (conversation) {
      conversation.customer = cimEvent.data;
      this._snackbarService.open("Profile linked successfully", "succ");
    }
  }

  removeConversation(topicId) {
    // fetching the whole conversation which needs to be removed
    const removedConversation = this.conversations.find((conversation) => {
      return conversation.topicId == topicId;
    });

    // remove the conversation from array
    let index = this.conversations.findIndex((conversation) => {
      return conversation.topicId == topicId;
    });

    if (index != -1) {
      this._sharedService.spliceArray(index, this.conversations);
      --this.conversationIndex;

      // alter the rest of the conversation's indexes whose indexes are greater than the index of removed conversation
      // in order to remap the conversation indexex along with the indexes of the map tabs
      this.conversations.map((conversation) => {
        if (conversation.index > removedConversation.index) {
          conversation.index = --conversation.index;
        }
      });
    }

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
      let message = this.createSystemNotificationMessage(cimEvent);
      conversation.messages.push(message);

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
      let message = this.createSystemNotificationMessage(cimEvent);
      conversation.activeChannelSessions.push(cimEvent.data);
      conversation.messages.push(message);
    } else {
      console.error("channelSessionId not found to added");
    }
  }

  handleAgentSubscription(cimEvent, topicId) {
    let conversation = this.conversations.find((e) => {
      return e.topicId == topicId;
    });

    if (conversation) {
      let message = this.createSystemNotificationMessage(cimEvent);
      conversation.messages.push(message);
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
      if (this._router.url !== "/customers/chats") {
        this.showOnBrowserNoticication(conversation, cimEvent);
      }
    }
    this._soundService.playBeep();
  }

  showOnBrowserNoticication(conversation, cimEvent) {
    if (cimEvent.name.toLowerCase() == "customer_message") {
      if (cimEvent.data.body.type.toLowerCase() == "plain") {
        this._soundService.openBrowserNotification(conversation.customer.firstName, cimEvent.data.body.markdownText);
      } else {
        this._soundService.openBrowserNotification(conversation.customer.firstName, "sent a " + cimEvent.data.body.type + " message");
      }
    } else if (cimEvent.name.toLowerCase() == "bot_message") {
      if (cimEvent.data.body.type.toLowerCase() == "plain") {
        this._soundService.openBrowserNotification("BOT", cimEvent.data.body.markdownText);
      } else {
        this._soundService.openBrowserNotification("BOT", "sent a " + cimEvent.data.body.type + " message");
      }
    }
  }

  moveToLogin() {
    try {
      sessionStorage.clear();
      localStorage.removeItem("ccUser");
    } catch (e) { }
    this._cacheService.resetCache();
    this._router.navigate(["login"]);
  }

  async linkCustomerWithTopic(selectedCustomer, topicId) {
    try {
      const conversation = this.conversations.find((e) => {
        return e.topicId == topicId;
      });
      const topicCustomer = conversation.customer;
      const channelSession = conversation.firstChannelSession;

      if (topicCustomer && channelSession) {
        const channelType = channelSession.channel.channelType.name;
        const channelIdentifier = channelSession.channelData.channelCustomerIdentifier;
        console.log("channelType " + channelType + " channelIdentifier " + channelIdentifier);
        if (channelType && channelIdentifier) {
          let attr;

          this._sharedService.schema.forEach((e: any) => {
            if (e.isChannelIdentifier == true) {
              if (e.channelTypes.includes(channelType)) {
                attr = e.key;
              }
            }
          });
          console.log("attr " + attr);

          if (attr) {
            if (selectedCustomer[attr].includes(channelIdentifier)) {
              console.log("already merged");
              const resp: any = await this._sharedService.getProfileLinkingConfirmation(null, selectedCustomer.firstName, null, false);
              console.log("this is resp ", resp);
              if (resp.decisionIs) {
                this.updateTopiCustomer(selectedCustomer, false, topicCustomer.isAnonymous == true ? topicCustomer._id : null, topicId);
              }
            } else {
              console.log("not merged");
              // const resp = await this._sharedService.getConfirmation('Merge Attribute Value', `Are you sure you want to add ${channelIdentifier} to ${selectedCustomer.firstName}'s ${attr}`);
              const resp: any = await this._sharedService.getProfileLinkingConfirmation(channelIdentifier, selectedCustomer.firstName, attr, true);

              if (resp.decisionIs == true) {
                if (resp.isAttributeMerge == true) {
                  if (selectedCustomer[attr].length <= 9) {
                    selectedCustomer[attr].push(channelIdentifier);
                    this.updateTopiCustomer(selectedCustomer, true, topicCustomer.isAnonymous == true ? topicCustomer._id : null, topicId);
                    console.log("limit not exceed");
                  } else {
                    console.log("limit exceed");
                    this._snackbarService.open(
                      `The conversation is going to linking with ${selectedCustomer.firstName}, However the channel identifier ${channelIdentifier} can't be added in ${selectedCustomer.firstName}'s ${attr} because space is unavailable, you may delete a channel identifer to add a new one`,
                      "succ",
                      20000,
                      "Ok"
                    );
                    this.updateTopiCustomer(selectedCustomer, false, topicCustomer.isAnonymous == true ? topicCustomer._id : null, topicId);
                  }
                } else {
                  this.updateTopiCustomer(selectedCustomer, false, topicCustomer.isAnonymous == true ? topicCustomer._id : null, topicId);
                }
              }
            }
          } else {
            const resp: any = await this._sharedService.getProfileLinkingConfirmation(null, selectedCustomer.firstName, null, false);
            if (resp.decisionIs) {
              this.updateTopiCustomer(selectedCustomer, false, topicCustomer.isAnonymous == true ? topicCustomer._id : null, topicId);
            }
            // this._snackbarService.open("unable to link customer", "err");
          }
        } else {
          const resp: any = await this._sharedService.getProfileLinkingConfirmation(null, selectedCustomer.firstName, null, false);

          if (resp.decisionIs) {
            this.updateTopiCustomer(selectedCustomer, false, topicCustomer.isAnonymous == true ? topicCustomer._id : null, topicId);
          }
          //  this.snackErrorMessage("Unable to link profile");
        }
        //  this._socketService.linkCustomerWithInteraction(customerId, this.topicId);
        console.log(selectedCustomer);
      } else {
        this._snackbarService.open("unable to link customer", "err");
      }
    } catch (err) {
      console.log("err ", err);
      this._snackbarService.open("unable to link customer", "err");
    }
  }

  updateTopiCustomer(selectedCustomer, needToBeUpdate: boolean, toBeDeletedCustomerId, topicId) {
    console.log("topic updated");
    console.log("need to be updated " + needToBeUpdate);
    console.log("toBeDeletedCustomerId " + toBeDeletedCustomerId);

    let selectedCustomerId = selectedCustomer._id;

    if (needToBeUpdate) {
      // updating customer

      delete selectedCustomer["_id"];
      delete selectedCustomer["__v"];

      this._httpService.updateCustomerById(selectedCustomerId, selectedCustomer).subscribe(
        (e) => {
          selectedCustomer["_id"] = selectedCustomerId;

          // updating customer topic
          this._httpService.updateTopicCustomer(topicId, selectedCustomer).subscribe(
            (e) => {
              console.log("update topic success");
              this.deleteCustomerAndRouteToAgent(toBeDeletedCustomerId);
            },
            (error) => {
              this._snackbarService.open("unable to link customer", "err");
              console.error("error while updating topic customer ", error);
            }
          );
        },
        (error) => {
          this._snackbarService.open("unable to link customer", "err");
          console.error("error while updating customer ", error);
        }
      );
    } else {
      selectedCustomer["_id"] = selectedCustomerId;
      // updating customer topic
      console.log("update topic success");
      this._httpService.updateTopicCustomer(topicId, selectedCustomer).subscribe(
        (e) => {
          this.deleteCustomerAndRouteToAgent(toBeDeletedCustomerId);
        },
        (error) => {
          this._snackbarService.open("unable to link customer", "err");
          console.error("error while updating topic customer ", error);
        }
      );
    }
  }

  createSystemNotificationMessage(cimEvent) {
    let message: any = {
      id: "",
      header: { timestamp: "", sender: {}, channelSession: {}, channelData: {} },
      body: { markdownText: "", type: "" }
    };

    message.id = uuidv4();
    message.header.timestamp = cimEvent.timestamp;
    message.body.type = "systemNotification";
    message.header.sender.type = "system";

    if (cimEvent.name.toLowerCase() == "channel_session_started") {
      message.body["displayText"] = cimEvent.data.channel.channelType.name;
      message.body.markdownText = "session started";
    } else if (cimEvent.name.toLowerCase() == "channel_session_ended") {
      message.body["displayText"] = cimEvent.data.channel.channelType.name;
      message.body.markdownText = "session ended";
    }
    if (cimEvent.name.toLowerCase() == "agent_subscribed") {
      message.body["displayText"] = cimEvent.data.ccUser.keycloakUser.username;
      message.body.markdownText = "has joined the conversation";
    } else if (cimEvent.name.toLowerCase() == "agent_unsubscribed") {
      message.body["displayText"] = cimEvent.data.ccUser.keycloakUser.username;
      message.body.markdownText = "left the conversation";
    }

    return message;
  }

  deleteCustomerAndRouteToAgent(toBeDeletedCustomerId) {
    if (toBeDeletedCustomerId != null) {
      // deleting customer
      this._httpService.deleteCustomerById(toBeDeletedCustomerId).subscribe();
    }
    this._router.navigate(["customers"]);
  }
}
