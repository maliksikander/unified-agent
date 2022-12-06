import { Injectable, Optional } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { TopicParticipant } from "../models/User/Interfaces";
import { appConfigService } from "./appConfig.service";
import { cacheService } from "./cache.service";
import { sharedService } from "./shared.service";
import { snackbarService } from "./snackbar.service";
import { socketService } from "./socket.service";

import { httpService } from "./http.service";
import * as uuid from "uuid";

declare var executeCommands;

@Injectable({
  providedIn: "root"
})
export class finesseService {
  isAlreadysubscribed: boolean = false;
  showErr: boolean = false;
  finesseAgent = { loginId: "", password: "", extension: "", isSSOUser: "" };
  finesseAgentState = { state: "", reasonId: "" };
  finesseNotReadyReasonCodes;
  finesseLogoutReasonCodes;
  ignoreAgentState: boolean = false; // in a particular scnerio when from finesse, agent state to going to ready but in cim agent was
  // not_ready, so 1st need to set the agent state ready and then voice mrd state ready so for this need to send two concurrent requests
  // 1st concurrent request dont need to be listen for which we are using this varibale to ignore that request

  // voiceConversationId;
  min: any = 0;
  sec: any = 0;
  timer;
  callTimer = new Subject<any>();
  // currentConversation = new Subject<any>();
  // voiceChannelSessionSubject = new Subject<any>();
  // removeNotification = new Subject<any>();
  // _ciscoDialogID = new Subject<any>();
  // activeConversation;
  // isLeaveButtonClicked: boolean = false;
  // dialogState: any = {};
  // customerIdentifier;
  timeoutId;
  // voiceChannelSession;

  // newIncomingVoiceRequest = new Subject<any>();
  customer;

  constructor(
    private _snackbarService: snackbarService,
    private _sharedService: sharedService,
    public _cacheService: cacheService,
    private _socketService: socketService,
    private _configService: appConfigService,
    private _httpService: httpService,
    private _router: Router
  ) {}

  initMe() {
    this._sharedService.serviceCurrentMessage.subscribe((e: any) => {
      console.log("state cahnge", e.msg);
      if (e.msg == "stateChanged" && this.finesseAgent.loginId != "") {
        this.handlePresence(e.data);
      }
    });

    // this.voiceChannelSessionSubject.subscribe((res) => {
    //   this.voiceConversationId = res.conversationId;
    //   this.voiceChannelSession = res.channelSession;
    // });

    // this.currentConversation.subscribe((res) => {
    //   this.activeConversation = res;
    // });
  }

  // incoming states from CIM
  handlePresence(agentPresence) {
    // check if the MRDs have a voice mrd in it or not
    let hasVoicMrd: boolean = this.isVoiceMrdExists(agentPresence.agentMrdStates);

    if (hasVoicMrd) {
      if (!this.isAlreadysubscribed) {
        this.subscribeToCiscoEvents();
        this.isAlreadysubscribed = true;
      } else {
        if (this.ignoreAgentState == false) {
          this.changeFinesseState(agentPresence);
        } else {
          this.ignoreAgentState = false;
        }
      }
    }
  }

  // by passing mrds list into it, it will return true if voide mrd exists in it other wise return false
  isVoiceMrdExists(mrds) {
    let found: boolean = false;
    found = mrds.some((e) => {
      if (e.mrd.name.toLowerCase() == "voice") {
        return true;
      }
    });
    return found;
  }

  // from the list of mrds, it will return voice mrd
  getVoiceMrd(mrds) {
    let voiceMrd = mrds.find((e) => {
      if (e.mrd.name.toLowerCase() == "voice") {
        return e;
      }
    });

    return voiceMrd;
  }

  // this will used to subscribe to cisco events
  subscribeToCiscoEvents() {
    let command = {
      action: "login",
      parameter: {
        loginId: this.finesseAgent.loginId,
        password: this.finesseAgent.password,
        extension: this.finesseAgent.extension,
        isSSOUser: this.finesseAgent.isSSOUser,
        // authToken: this.finesseAgent.authToken,
        clientCallbackFunction: this.clientCallback
      }
    };

    console.log("login command==>", command);
    executeCommands(command);
    console.log("execute command success==>");
  }

  // send the commands to the finesse
  changeFinesseState(agentPresence) {
    const voiceMrdObj = this.getVoiceMrd(agentPresence.agentMrdStates);

    if (voiceMrdObj.state.toLowerCase() == "ready") {
      // if voice mrd state is ready and finesse state is not ready then change the finsess state to ready
      if (this.finesseAgentState.state.toLowerCase() != "ready") {
        executeCommands({ action: "makeReady" });
      }
    } else if (voiceMrdObj.state.toLowerCase() == "not_ready" || voiceMrdObj.state.toLowerCase() == "pending_not_ready") {
      // if voice mrd state is not_ready and finesse state is not not_ready then change the finsess state to not_ready
      if (this.finesseAgentState.state.toLowerCase() != "not_ready") {
        executeCommands({ action: "makeNotReadyWithReason", parameter: { reasonCode: this.finesseNotReadyReasonCodes[0].code } });
      }
    }
  }

  // accept call on finesse
  acceptCallOnFinesse(command) {
    executeCommands(command);
  }

  // end call on finesse
  endCallOnFinesse(command) {
    executeCommands(command);
  }

  // this will call when an event from the CTI library received
  // clearConversationFromList(conversationId) {
  //   let index = this.pushConversationList.findIndex((item) => {
  //     return item.id == conversationId;
  //   });
  //   this.pushConversationList.splice(index, 1);

  //   this.pushModeConversationList.next(this.pushConversationList);
  // }

  checkForVoiceSession(conversation) {
    let list: Array<any> = conversation.activeChannelSessions ? conversation.activeChannelSessions : [];
    let voiceIndex = list.findIndex((item) => {
      return item.channel.channelType.name == "VOICE";
    });
    if (voiceIndex != -1) return true;
    return false;
  }

  // checkForNonVoiceSession(conversation) {
  //   let list: Array<any> = conversation.activeChannelSessions ? conversation.activeChannelSessions : [];
  //   let nonVoiceIndex = list.findIndex((item) => {
  //     return item.channel.channelType.name != "VOICE";
  //   });
  //   if (nonVoiceIndex != -1) return true;
  //   return false;
  // }

  // onCallEnd(conversation) {
  //   let voiceSession: boolean = this.checkForVoiceSession(conversation);
  //   let nonVoiceSession: boolean = this.checkForNonVoiceSession(conversation);

  //   if (voiceSession && nonVoiceSession) {
  //     this.emitEndChannelSessionEvent();
  //   } else if (voiceSession && !nonVoiceSession) {
  //     this.emitEndChannelSessionEvent();
  //     this._socketService.topicUnsub(conversation);
  //   } else {
  //     console.log("Only NON VOICE EXITS ON CALL END==>");
  //   }
  // }

  // getParticipantFromExtension(ext, participants: Array<any>) {
  //   return participants.find((participant) => {
  //     return participant.mediaAddress == ext;
  //   });
  // }

  clientCallback = (event) => {
    try {
      console.log("CTI event==>", event);

      if (event.event.toLowerCase() == "dialogstate") {
        this.handleDialogStateEvent(event);

        // this.dialogState = event.response;

        // if (this.dialogState.dialog && this.dialogState.dialog.participants.Participant) {
        //   this._ciscoDialogID.next(event.response.dialog.id)
        //   let participants = this.dialogState.dialog.participants.Participant;
        //   if (Array.isArray(participants)) {
        //     participants.forEach((item) => {
        //       let currentParticipant = item.mediaAddress == this.finesseAgent.extension ? item : undefined;

        //       if (currentParticipant) {
        //         if (this.dialogState.dialog.state == "ACTIVE") {
        //           if (currentParticipant.state == "ACTIVE") {
        //             this.timeoutId = setInterval(() => {
        //               this.startTimer();
        //             }, 1000);
        //             if (this.voiceConversationId && this.voiceChannelSession) {
        //               this.createTaskAndTopicSubscriptionEvent(this.voiceConversationId, this.voiceChannelSession);
        //             } else {
        //               this._snackbarService.open("No Conversation ID Found", "err");
        //             }
        //           } else if (currentParticipant.state == "DROPPED") {
        //             if (this.timeoutId) {
        //               clearInterval(this.timeoutId);
        //               this.min = 0;
        //               this.sec = 0;
        //             }
        //             if (!this.isLeaveButtonClicked) {
        //               if (this.activeConversation) {
        //                 this.onCallEnd(this.activeConversation);
        //               } else {
        //                 console.log("[Call Dropped Event] No Conversation Found");
        //               }
        //             } else {
        //               this.isLeaveButtonClicked = false;
        //             }
        //           }
        //         }
        //       }
        //       if (this.dialogState.dialog.state == "ALERTING" && item.state == "DROPPED") {
        //         this.removeNotification.next({
        //           conversationId: this.voiceConversationId,
        //           identifier : this.customerIdentifier
        //         });
        //         this.emitEndChannelSessionEvent();
        //       } else if (this.dialogState.dialog.state == "FAILED") {
        //         let identifier = this.dialogState.dialog.fromAddress;
        //         this.removeNotification.next({
        //           conversationId: this.voiceConversationId,
        //           identifier
        //         });
        //         this.emitEndChannelSessionEvent();
        //       }
        //     });
        //   } else {
        //     if (participants.state == "DROPPED") {
        //       if (this.timeoutId) {
        //         clearInterval(this.timeoutId);
        //         this.min = 0;
        //         this.sec = 0;
        //       }
        //       if (!this.isLeaveButtonClicked) {
        //         if (this.activeConversation) {
        //           this.onCallEnd(this.activeConversation);
        //         } else {
        //           console.log("[Call Dropped Event] No Conversation Found");
        //         }
        //       } else {
        //         this.isLeaveButtonClicked = false;
        //       }
        //     } else if (this.dialogState.dialog.state == "FAILED") {
        //       let identifier = this.dialogState.dialog.fromAddress;
        //       this.removeNotification.next({
        //         conversationId: this.voiceConversationId,
        //         identifier
        //       });
        //       this.emitEndChannelSessionEvent();
        //     }
        //   }
        // }
      } else if (event.event.toLowerCase() == "agentstate") {
        this.handleAgentStateFromFinesse(event.response);
        this.showErr = false;
      } else if (event.event.toLowerCase() == "xmppevent") {
        if (event.response.description == "Connection Established, XMPP Status is Connected") {
          this._snackbarService.open("CISCO : Synsying state with cisco", "succ");
          this.showErr = false;
          executeCommands({ action: "getNotReadyLogoutReasons" });
        } else if (event.response.description == "XMPP Status is Disconnected!") {
          this.showErr = true;
          this._snackbarService.open("XMPP Status is Disconnected!", "err");
        }
      } else if (event.event.toLowerCase() == "error") {
        console.log("error " + event.response.description);
        this.showErr = true;
        this._snackbarService.open("CISCO :" + event.response.description, "err");
      } else if (event.event.toLowerCase() == "notreadylogoutreasoncode") {
        this.finesseLogoutReasonCodes = null;
        this.finesseNotReadyReasonCodes = null;

        this.finesseLogoutReasonCodes = event.response.logoutReasons;
        this.finesseNotReadyReasonCodes = event.response.notReadyReasons;
      } else if (event.event == "newInboundCall") {
        // let data = {
        //   cisco_data: event
        //   // agent: this._cacheService.agent
        // };
        // this.customerIdentifier = event.response.dialog.ani;
        // this._socketService.emit("newInboundCallRequest", data);

        this.identifyCustomer(event, event.response.dialog.ani);
      }
    } catch (e) {
      console.error("CTI ERROR==>", e);
    }
  };

  handleDialogStateEvent(dialogEvent) {
    try {
      let dialogState = dialogEvent.response;
      if (this.customer && dialogState.dialog && dialogState.dialog.participants.Participant) {
        let participants = dialogState.dialog.participants.Participant;
        let cacheId = `${this._cacheService.agent.id}:${dialogState.dialog.id}`;
        console.log("cacheId on active==>", cacheId);
        if (Array.isArray(participants)) {
          this.handleDialogParticipantList(dialogEvent, participants, cacheId);
        } else {
          this.handleDialogParticipantObject(participants, dialogState, cacheId);
        }
      } else {
        // if (!this.customer) {
        //   let voiceTask = this.getVoiceTask();
        //   console.log("in dialog==>", voiceTask);
        //   if (voiceTask) {
        //     let cacheId = `${voiceTask.channelSession.customer._id}:${voiceTask.channelSession.id}`;
        //     console.log("in dialog cache==>", cacheId);
        //     let D1: any = this.getDialogFromCache(cacheId);
        //     console.log("D1==>", D1);
        //     if (D1 && dialogState.dialog == null) {
        //       console.log("yo D1==>");
        //       this.handleCallDroppedEvent(cacheId, D1, "onRefresh");
        //       // this.clearLocalDialogCache(cacheId);
        //     } else if (D1 && dialogState.dialog) {
        //       console.log("yo D2==>");
        //       if (D1.dialog.id != dialogState.dialog.id) {
        //         console.log("yo D3==>");
        //         this.handleCallDroppedEvent(cacheId, D1, "onRefresh");
        //       } else if (D1.dialog.id == dialogState.dialog.id) {
        //         console.log("yo D4==>");
        //         // if (D1.dialogState == "active") {
        //         // let isActive = this.checkParticipantActiveState(dialogState);
        //         // console.log("yo D5==>", isActive);
        //         // if (isActive) this._socketService.getTopicSubscription(voiceTask.channelSession.conversationId, voiceTask.id);
        //         // }
        //       }
        //     }
        //   }
        // }
      }
    } catch (e) {
      console.error("[Error] handleDialogStateEvent ==>", e);
    }
  }

  checkParticipantActiveState(dialogState) {
    try {
      // let dialogState = dialogEvent.response;
      let participants = dialogState.dialog.participants.Participant;
      console.log("Partcipant list on end call==>", participants);
      if (Array.isArray(participants)) {
        for (let i = 0; i <= participants.length; i++) {
          let currentParticipant = participants[i].mediaAddress == this.finesseAgent.extension ? participants[i] : undefined;
          if (currentParticipant) {
            if (dialogState.dialog.state == "ACTIVE") if (currentParticipant.state == "ACTIVE") return true;
          }
        }
      }
      return false;
    } catch (e) {
      console.error("[Error] checkParticipantActiveState ==>", e);
      return false;
    }
  }

  handleDialogParticipantList(dialogEvent, participants, cacheId) {
    let dialogState = dialogEvent.response;
    participants.forEach((item) => {
      let currentParticipant = item.mediaAddress == this.finesseAgent.extension ? item : undefined;
      if (currentParticipant) {
        if (dialogState.dialog.state == "ACTIVE") {
          this.removeNotification();
          if (currentParticipant.state == "ACTIVE") {
            let dialogCache: any = this.getDialogFromCache(cacheId);
            if (dialogCache && dialogCache.dialogState == "alerting") {
              this.handleCallActiveEvent(dialogEvent, dialogState);
            } else {
              this.setLocalDialogCache(dialogEvent, "active"); // to be confirmed
            }

            // console.log("dialogCache==>", dialogCache);
          } else if (currentParticipant.state == "DROPPED") {
            // this.clearLocalDialogCache(cacheId);
          }
        }
      }
      if (dialogState.dialog.state == "ALERTING" && item.state == "DROPPED") {
        //rona Case
        this.handleCiscoRona(cacheId);
      } else if (dialogState.dialog.state == "FAILED") {
        this.removeNotification();
      }
    });
  }

  handleDialogParticipantObject(participants, dialogState, cacheId) {
    if (participants.state == "DROPPED") {
      this.removeNotification();
      if (dialogState.dialog.state == "DROPPED" || dialogState.dialog.state == "ACTIVE") {
        let item: any = this.getDialogFromCache(cacheId);
        if (item && item.dialogState == "active") {
          if (this.timeoutId) clearInterval(this.timeoutId);

          this.handleCallDroppedEvent(cacheId, dialogState, "");
        }
      }
    } else if (dialogState.dialog.state == "FAILED") {
      this.removeNotification();
    }
  }

  identifyCustomer(ciscoEvent, ani) {
    try {
      let customerIdentifier = ani;
      if (customerIdentifier) {
        // console.log("identify customer==>");
        this.getCustomerByVoiceIdentifier(customerIdentifier, ciscoEvent);
      } else {
        this._snackbarService.open("No Customer Identifier Found", "err");
      }
    } catch (e) {
      console.error("[Error on Identify Customer] ==>", e);
    }
  }

  getCustomerByVoiceIdentifier(identifier, ciscoEvent) {
    this._httpService.getCustomerByChannelTypeAndIdentifier("VOICE", identifier).subscribe(
      (res) => {
        console.log("res==>", res);
        this.customer = res.customer;
        let data = {
          customer: res.customer,
          identifier,
          dialogData: ciscoEvent.response.dialog
        };
        this._sharedService.serviceChangeMessage({ msg: "openExternalModeRequestHeader", data: data });
        this.setLocalDialogCache(ciscoEvent, "alerting");
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  handleCiscoRona(cacheId) {
    this.removeNotification();
    let item: any = this.getDialogFromCache(cacheId);
    if (item && item.dialogState == "alerting") this.clearLocalDialogCache(cacheId);
    console.log("cache item==>");
  }

  handleCallDroppedEvent(cacheId, dialogState, methodCalledOn) {
    try {
      console.log("call end called ==>");
      if (methodCalledOn != "onRefresh") this.clearLocalDialogCache(cacheId);
      let channelCustomerIdentifier = dialogState.dialog.ani ? dialogState.dialog.ani : dialogState.dialog.fromAddress;
      let serviceIdentifier = dialogState.dialog.dialedNumber;
      let leg = `${dialogState.dialog.id}:${this._cacheService.agent.id}`;

      let cimMessage = this.createCIMMessage(
        "VOICE",
        channelCustomerIdentifier,
        serviceIdentifier,
        "CALL_LEG_ENDED",
        this.customer,
        leg,
        dialogState.dialog,
        "DIALOG_ENDED"
      );
      console.log("CIM Message ==>", cimMessage);
      this.ccmChannelSessionApi(cimMessage, methodCalledOn, cacheId);
    } catch (e) {
      console.error("[Error] handleCallDropEvent ==>", e);
    }
  }

  handleCallActiveEvent(dialogEvent, dialogState) {
    this.setLocalDialogCache(dialogEvent, "active");
    let channelCustomerIdentifier = dialogState.dialog.ani ? dialogState.dialog.ani : dialogState.dialog.fromAddress;
    let serviceIdentifier = dialogState.dialog.dialedNumber;
    let leg = `${dialogState.dialog.id}:${this._cacheService.agent.id}`;
    // console.log("check==>", this._cacheService.agent);
    // console.log("cdialog==>", dialogState);
    let cimMessage = this.createCIMMessage(
      "VOICE",
      channelCustomerIdentifier,
      serviceIdentifier,
      "CALL_LEG_STARTED",
      this.customer,
      leg,
      dialogState.dialog,
      ""
    );
    this.ccmChannelSessionApi(cimMessage, "", "");
  }

  removeNotification() {
    this._sharedService.serviceChangeMessage({ msg: "closeExternalModeRequestHeader", data: [] });
  }

  // set agentid instead of customer id in dialog cache
  // call ccm api even if D1 does not exit in cache

  setLocalDialogCache(ciscoEvent, dialogState) {
    try {
      let cacheId = `${this._cacheService.agent.id}:${ciscoEvent.response.dialog.id}`;
      let dialogCacheObj = {
        dialogState,
        dialog: ciscoEvent.response.dialog
      };
      // console.log("test==>", dialogCacheObj);
      console.log("cache Id==>", cacheId);
      localStorage.setItem(`${cacheId}`, JSON.stringify(dialogCacheObj));
    } catch (e) {
      console.error("[Error on Set Dialog Cache] ==>", e);
    }
  }

  getDialogFromCache(cacheId) {
    try {
      console.log("getCache==>", cacheId);
      let item = localStorage.getItem(`${cacheId}`);
      if (item) item = JSON.parse(item);
      return item;
    } catch (e) {
      console.error("[Error on Get Dialog Cache] ==>", e);
    }
  }

  clearLocalDialogCache(cacheId) {
    try {
      console.log("Cache id remove ==>", cacheId);
      localStorage.removeItem(`${cacheId}`);
    } catch (e) {
      console.error("[Error on clear Dialog Cache] ==>", e);
    }
  }

  ccmChannelSessionApi(data, methodCalledOn, cacheId) {
    console.log("ccm api called==>", data);
    this._httpService.ccmVOICEChannelSession(data).subscribe(
      (res) => {
        console.log("res==>", res);
        if (methodCalledOn == "onRefresh") this.clearLocalDialogCache(cacheId);
      },
      (error) => {
        console.error("[Error on CCM Channel Session API] ==>", error);
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  createCIMMessage(messageType, channelCustomerIdentifier, serviceIdentifier, intent, customer, leg, dialog, reasonCode) {
    let cimMessage = {
      id: uuid.v4().toString(),
      header: {
        channelData: {
          channelCustomerIdentifier: channelCustomerIdentifier,
          serviceIdentifier: serviceIdentifier,
          additionalAttributes: this.getCallVariablesList(dialog.callVariables.CallVariable)
        },
        language: {},
        timestamp: new Date().getTime(),
        securityInfo: {},
        stamps: [],
        intent,
        entities: {}
      },
      body: {
        type: messageType,
        markdownText: null,
        reasonCode,
        customer,
        agent: this._cacheService.agent,
        leg,
        dialog
      }
    };
    // console.log("CIM==>", cimMessage);
    if (intent == "CALL_LEG_ENDED") {
      let conversationId = this.getCurrentConversationId();
      let obj = {
        key: "conversationId",
        type: "String2000",
        value: conversationId
      };
      // let conversationId= this._socketService.conversations
      cimMessage.header.channelData.additionalAttributes.push(obj);
    }
    return cimMessage;
  }

  getCurrentConversationId() {
    let conversationList: Array<any> = this._socketService.conversations;
    for (let i = 0; i <= conversationList.length; i++) {
      if (conversationList[i] && conversationList[i].activeChannelSessions) {
        let voiceSession = conversationList[i].activeChannelSessions.find((item) => {
          return item.channel.channelType.name.toLowerCase() == "voice";
        });
        if (voiceSession) return voiceSession.conversationId;
      }
    }
  }

  getCallVariablesList(list: Array<any>) {
    try {
      const temp = [];

      list.forEach((item) => {
        const obj = {
          key: "",
          type: "String2000",
          value: ""
        };

        obj.key = item.name;
        obj.value = item.value;
        temp.push(obj);
      });
      // const callTimeObj = {
      //   key: "callStartTime",
      //   type: "String2000",
      //   value: agentCallTime
      // };
      // temp.push(callTimeObj);
      return temp;
    } catch (err) {
      console.error("[Error on Get Call Variables List] ==>", err);
    }
  }

  getCurrentAgentFromParticipantList(list: Array<any>) {
    let currentParticpant;
    console.log("yo ==>", list);
    for (let i = 0; i <= list.length; i++) {
      // console.log("test==>", list[i].state.toLowerCase());
      if (list[i].mediaAddress == this.finesseAgent.extension) {
        currentParticpant = list[i];
        console.log("yo 1 ==>", list);
        return currentParticpant;
      }
    }
    return null;
  }

  // checkForExisitingConversation(idenitifer) {
  //   let list: Array<any> = this._socketService.conversations ? this._socketService.conversations : [];
  //   let conversation = list.find((item) => {
  //     if (item.firstChannelSession.customer) {
  //       return item.firstChannelSession.customer.voice == idenitifer;
  //     }
  //   });
  //   if (conversation) {
  //     return conversation.firstChannelSession;
  //   }
  //   return null;
  // }

  // if the receiving event from the CISCO is agentState then this will be called
  handleAgentStateFromFinesse(resp) {
    // saving the current finesse states in memory
    this.finesseAgentState.state = resp.state;
    this.finesseAgentState.reasonId = resp.reasonCode != undefined ? resp.reasonCode.id : null;
    let ronaStateOnCisco = this._configService.config.Rona_State_On_Cisco ? this._configService.config.Rona_State_On_Cisco : "";

    if (resp.state.toLowerCase() == "logout") {
      this._socketService.emit("changeAgentState", {
        agentId: this._cacheService.agent.id,
        action: "agentState",
        state: { name: "LOGOUT", reasonCode: "" }
      });
    } else if (resp.state.toLowerCase() == "not_ready" || resp.state.toLowerCase() == "ready" || resp.state.toLowerCase() == "talking") {
      const voiceMrdObj = this.getVoiceMrd(this._cacheService.agentPresence.agentMrdStates);

      if (resp.state != voiceMrdObj.state) {
        if (resp.state.toLowerCase() == "ready") {
          if (this._cacheService.agentPresence.state.name.toLowerCase() != "ready") {
            // If state in finesse is ready and aur agent state in not readtthen make the agent ready first
            // and then make voice mrd ready
            this._socketService.emit("changeAgentState", {
              agentId: this._cacheService.agent.id,
              action: "agentState",
              state: { name: "READY", reasonCode: null }
            });

            // for this particular request we dont need to listen its response so making it ignorable when receiving
            this.ignoreAgentState = true;

            setTimeout(() => {
              this._socketService.emit("changeAgentState", {
                agentId: this._cacheService.agent.id,
                action: "agentMRDState",
                state: "READY",
                mrdId: voiceMrdObj.mrd.id
              });
            }, 500);
          } else {
            this._socketService.emit("changeAgentState", {
              agentId: this._cacheService.agent.id,
              action: "agentMRDState",
              state: "READY",
              mrdId: voiceMrdObj.mrd.id
            });
          }
        } else if (resp.state.toLowerCase() == "not_ready") {
          // If state in finesse is not_ready then make the agent voice mrd not_ready
          this._socketService.emit("changeAgentState", {
            agentId: this._cacheService.agent.id,
            action: "agentMRDState",
            state: "NOT_READY",
            mrdId: voiceMrdObj.mrd.id
          });

          // rona
          // if (resp.reasonCode && resp.reasonCode.label) {
          //   if (resp.reasonCode.label == ronaStateOnCisco) {
          //     if (this.voiceConversationId) {
          //       this.removeNotification.next({
          //         conversationId: this.voiceConversationId,
          //         identifier: this.customerIdentifier
          //       });
          //       this.emitEndChannelSessionEvent();
          //     } else {
          //       this._snackbarService.open("No Conversation Found", "err");
          //     }
          //   }
          // }

          //  rona
          // if (resp.reasonCode && resp.reasonCode.label) {
          //   if (resp.reasonCode.label == ronaStateOnCisco) {
          //     this.handleCiscoRona();
          //   }
          // }

          // this._socketService.emit("changeAgentState", {
          //   agentId: this._cacheService.agent.id,
          //   action: "agentMRDState",
          //   state: "NOT_READY",
          //   mrdId: voiceMrdObj.mrd.id
          // });
        } else if (resp.state.toLowerCase() == "talking") {
          this._socketService.emit("changeAgentState", {
            agentId: this._cacheService.agent.id,
            action: "agentMRDState",
            state: "BUSY",
            mrdId: voiceMrdObj.mrd.id
          });

          // const voiceMrdObj = this.getVoiceMrd(this._cacheService.agentPresence.agentMrdStates);
          // if (voiceMrdObj.state.toLowerCase() == "pending_not_ready" || voiceMrdObj.state.toLowerCase() == "not_ready") {
          //   this._socketService.emit("changeAgentState", {
          //     agentId: this._cacheService.agent.id,
          //     action: "agentMRDState",
          //     state: "READY",
          //     mrdId: voiceMrdObj.mrd.id
          //   });
          // } else if (voiceMrdObj.state.toLowerCase() == "ready") {
          //   this._socketService.emit("changeAgentState", {
          //     agentId: this._cacheService.agent.id,
          //     action: "agentMRDState",
          //     state: "BUSY",
          //     mrdId: voiceMrdObj.mrd.id
          //   });
          // }
        }
      }
    }
  }

  // emitEndChannelSessionEvent() {
  //   let data = {
  //     cisco_data: this.dialogState
  //   };

  //   this._socketService.emit("endChannelSession", data);
  // }

  // createTaskAndTopicSubscriptionEvent(conversationId, channelSession) {
  //   this._socketService.emit("onCallAcceptTopicSubscription", {
  //     topicParticipant: new TopicParticipant("AGENT", this._cacheService.agent, conversationId, "PRIMARY", "SUBSCRIBED"),
  //     agentId: this._cacheService.agent.id,
  //     conversationId,
  //     channelSession
  //   });

  //   this.removeNotification.next({
  //     conversationId,
  //     identifier: this.customerIdentifier
  //   });
  //   // this.currentTaskId.next(taskId);
  //   this._router.navigate(["customers"]);
  // }

  startTimer() {
    this.sec = this.sec + 1;

    if (this.sec == 60) {
      this.min = this.min + 1;
      this.sec = 0;
    }

    if (this.sec < 10 || this.sec == 0) {
      this.sec = this.sec;
    }
    if (this.min < 10 || this.min == 0) {
      this.min = +this.min;
    }
    if (this.min >= 10 && this.sec < 10) {
      this.timer = `${this.min}:0${this.sec}`;
    } else if (this.min < 10 && this.sec >= 10) {
      this.timer = `0${this.min}:${this.sec}`;
    } else if (this.min > 0 && this.min < 10 && this.sec < 10) {
      this.timer = `0${this.min}:0${this.sec}`;
    } else if (this.min == 0 && this.min < 10 && this.sec < 10) {
      this.timer = `0${this.min}:0${this.sec}`;
    } else {
      this.timer = `${this.min}:${this.sec}`;
    }

    this.callTimer.next(this.timer);
  }

  taskList: Array<any>;
  checkActiveTasks(agentId) {
    this._httpService.getRETasksList(agentId).subscribe(
      (res) => {
        console.log("task list==>", res);
        this.taskList = res;
        if (this.taskList.length > 0) {
          this.getVoiceTask();
        }
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  getVoiceTask() {
    for (let i = 0; i <= this.taskList.length; i++) {
      if (this.taskList[i].state && this.taskList[i].state.name.toLowerCase() == "active") {
        if (this.taskList[i].channelSession && this.taskList[i].channelSession.channel.channelType.name == "VOICE") return this.taskList[i];
      }
      return null;
    }
  }
}
