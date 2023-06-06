import { Injectable, OnInit } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { cacheService } from "./cache.service";
import { snackbarService } from "./snackbar.service";
import { TranslateService } from "@ngx-translate/core";
import { appConfigService } from "./appConfig.service";
import { socketService } from "./socket.service";
import { httpService } from "./http.service";
import { sharedService } from "./shared.service";
import * as uuid from "uuid";

declare var postMessage;

@Injectable({
  providedIn: 'root'
})
export class SipService implements OnInit {

  private destroy$ = new Subject<void>();
  private timer$: Observable<number>;

  agentUsername: string;
  agentPassword: string;
  extension: number;
  customer: any;
  startTime: any;
  endTime: any;
  timeoutId: NodeJS.Timer;
  taskList: Array<any>;
  isCallActive: boolean = false;
  isCallHold: boolean = false;
  activeDialog: any;
  isSipLoggedIn: boolean = false;
  agentMrdStates: any;
  customerNumber:any = '448899';


  constructor(
    private _appConfigService: appConfigService,
    public _cacheService: cacheService,
    private _translateService: TranslateService,
    private _socketService: socketService,
    private _httpService: httpService,
    private _snackbarService: snackbarService,
    private _sharedService: sharedService
  ) {
    this.timer$ = timer(0, 1000).pipe(
      takeUntil(this.destroy$),
      map((value) => value + 1)
    );
  }
  ngOnInit(): void {
  }

  getTimer(): Observable<number> {
    return this.timer$;
  }

  stopTimer(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initMe() {
    try {
      this._sharedService.serviceCurrentMessage.subscribe((e: any) => {
        if (e.msg == "stateChanged") {
          this.agentMrdStates = e.data;
          if (this._appConfigService.config.isCxVoiceEnabled && !this.isSipLoggedIn) {
            console.log("CX Voice is enabled sip==>", this._appConfigService.config.isCxVoiceEnabled);
            this.loginSip();
          } else {
            console.log("CX Voice is not enabled sip==>", this._appConfigService.config.isCxVoiceEnabled);
          }
        }
      });
    } catch (error) {
      console.log("CX Voice enabled sip==>", error);
    }

  }

  // this will used to subscribe to SIP library events
  loginSip() {
    try {
      let sipPassword = localStorage.getItem("sipPass");
      sipPassword = JSON.parse(sipPassword ? atob(sipPassword) : null);
      this.agentUsername = this._cacheService.agent.username;
      this.agentPassword = sipPassword;

      let command = {
        action: "login",
        parameter: {
          loginId: this.agentUsername,
          password: this.agentPassword,
          extension: this.extension != undefined ? this.extension : localStorage.getItem('ext'),
          clientCallbackFunction: this.clientCallback
        }
      };
      console.log("login SIP command sip==>", command);
      postMessage(command);
    } catch (error) {
      this.notReadyAgentState();
      console.log("login SIP command sip==>", error);
    }
  }

  clientCallback = (event) => {
    try {
      console.log("SIP event sip==>", event);
      if (event.event.toLowerCase() == "agentinfo") {
        if (event.response.state.toLowerCase() == "login") {
          this.isSipLoggedIn = true;
          this._snackbarService.open(this._translateService.instant("snackbar.CX-Voice-Login-Success"), "succ");
          this.readyAgentState();
          console.log("Connection Established, CTI Status is Connected!!!");
        }
        if (event.response.state.toLowerCase() == "logout") {
          this.isSipLoggedIn = false;
          this.notReadyAgentState();
          this._snackbarService.open(this._translateService.instant("SIP Logout Successfully"), "err");
          console.log("Connection Expired, CTI Status logout!!!");
        }
      } else if (event.event.toLowerCase() == "dialogstate") {
        if (event.response.dialog == null) {
        } else if (event.response.dialog.state.toLowerCase() == "active") {
          // this.customerNumber = event.response.dialog.customerNumber;
          this.isCallHold = false;
        }
        else if (event.response.dialog.state.toLowerCase() == "held") {
          this.isCallHold = true;
        }
        this.handleDialogStateEvent(event);
      } else if (event.event.toLowerCase() == "newinboundcall") {
        // console.log('New Inbound Call sip==>', event);
        this.customerNumber = event.response.dialog.customerNumber;
        let cacheId = `${this._cacheService.agent.id}:${event.response.dialog.id}`;
        let cacheDialog: any = this.getDialogFromCache(cacheId);
        if (!cacheDialog) {
          // console.log("1==>")
          // this.setDialogCache(event, "ALERTING");
          this.identifyCustomer(event, event.response.dialog.customerNumber, "INBOUND");
        }
        // this.identifyCustomer(event, event.response.dialog.ani, 'INBOUND');
      } else if (event.event == "Error") {
        if (event.response.type.toLowerCase() == "invalidstate") {
          this._snackbarService.open(this._translateService.instant("snackbar.CX-Voice-incorrect-request"), "err");
          this.notReadyAgentState();
          console.log(event.response.description);
        } else if (event.response.type.toLowerCase() == "subscriptionfailed") {
          this.notReadyAgentState();
          this._snackbarService.open(this._translateService.instant("snackbar.CX-Voice-invalid-credentials"), "err");
          console.log(event.response.description);
        } else if (event.response.type.toLowerCase() == "generalerror") {
          if (event.response.description.toLowerCase() == "canceled") {
            this._snackbarService.open(this._translateService.instant("snackbar.CX-Voice-call-canceled"), "err");
          } else {
            let cacheId = `${this._cacheService.agent.id}:${event.response.dialog.id}`;
            let dialogCache: any = this.getDialogFromCache(cacheId);
            console.log('dialogCache clientCallback==>', dialogCache);
            if (dialogCache && dialogCache.dialogState == "active") {
              this.handleCallDroppedEvent(cacheId, event.dialog, "", undefined, "DIALOG_ENDED");
            }
            this.removeNotification(event.response.dialog);
            this._snackbarService.open(this._translateService.instant("snackbar.CX-Voice-connection-failed"), "err");
            this.notReadyAgentState();
          }
          console.log(event.response.description);
        }
      }
    } catch (e) {
      console.error("SIP ERROR sip==>", e);
      throw new Error(`SIP Error ${e}`);
    }
  };

  handleDialogStateEvent(dialogEvent) {
    try {
      let dialogState = dialogEvent.response;
      this.activeDialog = dialogState.dialog;
      if (this.customer && dialogState.dialog && dialogState.dialog != null && dialogState.dialog.participants) {
        let participants = dialogState.dialog.participants;
        let cacheId = `${this._cacheService.agent.id}:${dialogState.dialog.id}`;

        if (Array.isArray(participants)) {
          this.handleDialogParticipantList(dialogEvent, participants, cacheId);
        } else { }
      } else {
        if (!this.customer) {
          console.log('Customer Not found sip==>');

          this.handleRefreshCase(dialogEvent, dialogState);
        }
      }
    } catch (e) {
      console.error("[Error] handleDialogStateEvent ==>", e);
    }
  }

  handleDialogParticipantList(dialogEvent, participants, cacheId) {
    try {
      let dialogState = dialogEvent.response;
      participants.forEach((item) => {
        console.log('Handle Dial ITEMS ==>', item);
        let currentParticipant = item.mediaAddress == this._cacheService.agent.attributes.agentExtension[0] ? item : undefined;
        if (currentParticipant) {
          if (dialogState.dialog.state == "ACTIVE") {
            this.removeNotification(dialogState.dialog);
            this.isCallActive = true;
            this.setDialogCache(dialogEvent, "ACTIVE");
            if (currentParticipant.state == "ACTIVE") {
              if (dialogState.dialog.isCallAlreadyActive == false) {
                this.handleCallActiveEvent(dialogEvent, dialogState);
                this.setDialogCache(dialogEvent, "ACTIVE");
              }
            }
          }
        }
      });
      if (dialogEvent.response.dialog.state == "DROPPED") {
        this.setDialogCache(dialogEvent, "DROPPED");
        if (dialogEvent.response.dialog.callEndReason == "Canceled") {
          this.removeNotification(dialogState.dialog);
        }
        this.handleCallDroppedEvent(cacheId, dialogState, "", undefined, "DIALOG_ENDED");
      }
    } catch (e) {
      console.error("[Error] handleDialogParticipant ==>", e);
    }
  }

  removeNotification(dialog) {
    try {
      this._sharedService.serviceChangeMessage({ msg: "closeExternalModeRequestHeader", data: dialog });
      // this._sharedService.serviceChangeMessage({ msg: "closeExternalModeRequestHeader", data: [] });
    } catch (e) {
      console.error("[Error] removeNotification ==>", e);
    }
  }

  getCurrentParticipantFromDialog(dialog: { participants: any[]; }) {
    try {
      let participantsList: Array<any> = dialog.participants;
      let currentParticipant = participantsList.find((item) => {
        return item.mediaAddress == this._cacheService.agent.attributes.agentExtension[0];
      });
      return currentParticipant;
    } catch (e) {
      console.error("[Error] getCurrentParticipantFromDialog ==>", e);
    }
  }

  getStartOREndTimeStamp(dialog, status) {
    try {
      let currentParticipant = this.getCurrentParticipantFromDialog(dialog);
      let time;
      if (status == "startCall") {
        time = currentParticipant.startTime;
      } else if (status == "endCall") {
        time = currentParticipant.stateChangeTime;
      }
      let unixTimeStamp = Math.floor(new Date(time).getTime() / 1000); // in seconds
      unixTimeStamp = unixTimeStamp * 1000;
      return unixTimeStamp;
    } catch (e) {
      console.error("[Error] getStartOREndTimeStamp ==>", e);
    }
  }

  handleCallActiveEvent(dialogEvent: { event?: string; response: any; }, dialogState: { dialog: { ani: any; fromAddress: any; id: any; dnis?: any; callType?: string; dialedNumber?: any; callVariables?: any; }; }) {
    try {
      let channelCustomerIdentifier = dialogState.dialog.ani ? dialogState.dialog.ani : dialogState.dialog.fromAddress;
      let serviceIdentifier = dialogEvent.response.dialog.dnis;
      let leg = `${this._cacheService.agent.attributes.agentExtension[0]}:${this._cacheService.agent.id}:${dialogState.dialog.id}`;
      let callType;
      let timeStamp = this.getStartOREndTimeStamp(dialogState.dialog, "startCall");
      callType = "INBOUND";
      console.log("dialogState sip==>", dialogState);
      this.setDialogCache(dialogEvent, "active");
      let cimMessage = this.createCIMMessage(
        "VOICE",
        channelCustomerIdentifier,
        serviceIdentifier,
        "CALL_LEG_STARTED",
        this.customer,
        leg,
        dialogState.dialog,
        callType,
        timeStamp
      );
      console.log("[handleCallActiveEvent] CIM Message sip==>", cimMessage);
      this.ccmChannelSessionApi(cimMessage, "", "", undefined);
      this.isCallActive = true;
    } catch (e) {
      console.error("[Error] handleCallActiveEvent ==>", e);
    }
  }

  notReadyAgentState() {
    try {
      const voiceMrdObj = this.getVoiceMrd(this.agentMrdStates.agentMrdStates);
      if (this.agentMrdStates.state.name.toLowerCase() == "ready") {
        // If state in Sip is loggedIn ready and aur agent state in not ready then make the agent ready first
        // and then make voice mrd ready
        this._socketService.emit("changeAgentState", {
          agentId: this.agentMrdStates.agent.id,
          action: "agentState",
          state: { name: "NOT_READY", reasonCode: null }
        });

        setTimeout(() => {
          this._socketService.emit("changeAgentState", {
            agentId: this.agentMrdStates.agent.id,
            action: "agentMRDState",
            state: "NOT_READY",
            mrdId: voiceMrdObj.mrd.id
          });
        }, 500);
      }
    } catch (error) {
      console.error('Not Ready State for Sip==>', error);
    }
  }

  readyAgentState() {
    console.log('Change Agent State ==>');
    try {
      const voiceMrdObj = this.getVoiceMrd(this.agentMrdStates.agentMrdStates);
      if (this.agentMrdStates.state.name.toLowerCase() != "ready") {
        // If state in Sip is loggedIn ready and aur agent state in not ready then make the agent ready first
        // and then make voice mrd ready
        this._socketService.emit("changeAgentState", {
          agentId: this.agentMrdStates.agent.id,
          action: "agentState",
          state: { name: "READY", reasonCode: null }
        });

        setTimeout(() => {
          this._socketService.emit("changeAgentState", {
            agentId: this.agentMrdStates.agent.id,
            action: "agentMRDState",
            state: "READY",
            mrdId: voiceMrdObj.mrd.id
          });
        }, 500);
      }
    } catch (error) {
      console.error('Ready State for Sip==>', error);
    }
  }

  // from the list of mrds, it will return voice mrd
  getVoiceMrd(mrds) {
    try {
      let voiceMrd = mrds.find((e) => {
        if (e.mrd.id == this._appConfigService.config.CX_VOICE_MRD) {
          return e;
        }
      });

      return voiceMrd;
    } catch (e) {
      console.error("[Error] getVoiceMrd ==>", e);
    }
  }

  identifyCustomer(sipEvent: { event?: string; response: any; }, ani: any, callType: string) {
    try {
      let customerIdentifier = ani;
      if (customerIdentifier) {
        this.getCustomerByVoiceIdentifier(customerIdentifier, sipEvent, callType);
      } else {
        this._snackbarService.open("No Customer Identifier Found", "err");
      }
    } catch (e) {
      console.error("[Error on Identify Customer] ==>", e);
    }
  }

  getCustomerByVoiceIdentifier(identifier: any, sipEvent: { response: any; }, callType: string) {
    try {
      this._httpService.getCustomerByChannelTypeAndIdentifier("VOICE", identifier).subscribe(
        (res) => {
          this.customer = res.customer;
          let data = {
            customer: res.customer,
            identifier,
            dialogData: sipEvent.response.dialog,
            provider: "cx_voice"
          };
          if (callType == "INBOUND") {
            this._sharedService.serviceChangeMessage({ msg: "openExternalModeRequestHeader", data: data });
            this.setDialogCache(sipEvent, "ALERTING");
            // console.log('Alerting inbound sip==>', sipEvent);

          } else { }
        },
        (error) => {
          this._sharedService.Interceptor(error.error, "err");
        }
      );
    } catch (e) {
      console.error("[Error] getCustomerByVoiceIdentifier ==>", e);
    }
  }

  setDialogCache(sipEvent, dialogState) {
    try {
      let cacheId = `${this._cacheService.agent.id}:${sipEvent.response.dialog.id}`;
      let dialogCacheObj = {
        dialogState,
        dialog: sipEvent.response.dialog
      };
      localStorage.setItem(`${cacheId}`, JSON.stringify(dialogCacheObj));
    } catch (e) {
      console.error("[Error on Set Dialog Cache] ==>", e);
    }
  }

  createCIMMessage(messageType: string, channelCustomerIdentifier: any, serviceIdentifier: any, intent: string, customer: any, leg: string, dialog: { ani?: any; fromAddress?: any; dnis?: any; id: any; callType?: string; dialedNumber?: any; callVariables?: any; }, reasonCode: string, timestamp: number) {
    try {
      let cimMessage = {
        id: uuid.v4().toString(),
        header: {
          channelData: {
            channelCustomerIdentifier: channelCustomerIdentifier,
            serviceIdentifier: serviceIdentifier,
            additionalAttributes: this.getCallVariablesList(dialog.callVariables.CallVariable)
          },
          customer,
          language: {},
          timestamp,
          securityInfo: {},
          stamps: [],
          intent,
          entities: {},
          sender: {
            id: this._cacheService.agent.id,
            senderName: this._cacheService.agent.username,
            type: "AGENT",
            additionalDetail: {}
          }
        },
        body: {
          type: messageType,
          markdownText: null,
          reasonCode,
          leg,
          callId: dialog.id,
          dialog
        }
      };
      if (intent == "CALL_LEG_ENDED") {
        let conversationId = this.getCurrentConversationIdORConversation("id");
        let obj = {
          key: "conversationId",
          type: "String2000",
          value: conversationId
        };
        cimMessage.header.channelData.additionalAttributes.push(obj);
      }
      return cimMessage;
    } catch (e) {
      console.error("[Error] createCIMMessage ==>", e);
    }
  }

  ccmChannelSessionApi(data, methodCalledOn, cacheId, event) {
    try {
      this._httpService.ccmVOICEChannelSession(data).subscribe(
        (res) => {
          console.log("CCM API Success==>");
          if (methodCalledOn == "onRefresh") {
            if (event) this.handleCallActiveEvent(event, event.response);
          }
        },
        (error) => {
          console.error("[Error on CCM Channel Session API] ==>", error);
          this._sharedService.Interceptor(error.error, "err");
        }
      );
    } catch (e) {
      console.error("[Error] ccmChannelSessionApi ==>", e);
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
      return temp;
    } catch (err) {
      console.error("[Error on Get Call Variables List] ==>", err);
    }
  }

  getCurrentConversationIdORConversation(type) {
    try {
      let conversationList: Array<any> = this._socketService.conversations;
      for (let i = 0; i <= conversationList.length; i++) {
        if (conversationList[i] && conversationList[i].activeChannelSessions) {
          let voiceSession = conversationList[i].activeChannelSessions.find((item) => {
            return item.channel.channelType.name.toLowerCase() == "voice";
          });
          if (voiceSession && type == "id") {
            return voiceSession.conversationId;
          } else if (voiceSession && type == "conversation") {
            return conversationList[i];
          }
        }
      }
    } catch (e) {
      console.error("[Error] getConversationIdOrConversation ==>", e);
    }
  }

  getDialogFromCache(cacheId: string) {
    try {
      let item = localStorage.getItem(`${cacheId}`);
      if (item) item = JSON.parse(item);
      return item;
    } catch (e) {
      console.error("[Error on Get Dialog Cache] ==>", e);
    }
  }

  handleCallDroppedEvent(cacheId, dialogState, methodCalledOn, event, callType) {
    try {
      if (methodCalledOn != "onRefresh") this.clearLocalDialogCache(cacheId);
      let channelCustomerIdentifier = dialogState.dialog.ani ? dialogState.dialog.ani : dialogState.dialog.fromAddress;
      let serviceIdentifier = dialogState.dialog.dnis;
      let leg = `${this._cacheService.agent.attributes.agentExtension[0]}:${this._cacheService.agent.id}:${dialogState.dialog.id}`;
      let customer;
      let timeStamp = this.getStartOREndTimeStamp(dialogState.dialog, "endCall");
      if (this.customer) customer = JSON.parse(JSON.stringify(this.customer));
      if (dialogState.dialog.callType == "AGENT_INSIDE" || dialogState.dialog.callType == "OUT") {
        callType = "DIALOG_ENDED";
        // serviceIdentifier = dialogState.dialog.dnis;
        let intent = "CALL_LEG_ENDED";
        channelCustomerIdentifier = dialogState.dialog.dialedNumber;
      } else {
        let cimMessage = this.createCIMMessage(
          "VOICE",
          channelCustomerIdentifier,
          serviceIdentifier,
          "CALL_LEG_ENDED",
          customer,
          leg,
          dialogState.dialog,
          callType,
          timeStamp
        );
        console.log("[ handleCallDroppedEvent] CIM Message sip==>", cimMessage);
        this.ccmChannelSessionApi(cimMessage, methodCalledOn, cacheId, event);
      }
      this.customer = undefined;
    } catch (e) {
      console.error("[Error] handleCallDropEvent ==>", e);
    }
    this.isCallActive = false;
  }

  clearLocalDialogCache(cacheId: any) {
    try {
      console.log('clearCache Sip ==>');
      localStorage.removeItem(`${cacheId}`);
    } catch (e) {
      console.error("[Error on clear Dialog Cache] ==>", e);
    }
  }

  acceptCallOnSip(command: { action: string; parameter: { dialogId: any; }; }) {
    postMessage(command);
  }
  endCallOnSip() {
    try {
      let command = {
        action: "releaseCall",
        parameter: {
          dialogId: this.activeDialog.id
        }
      };
      console.log('EndCallOnSip sip==>', command);
      postMessage(command);
    } catch (error) {
      console.log(error, 'on end call command sip==>');
    }
  }

  holdCallOnSip() {
    try {
      let command = {
        action: "holdCall",
        parameter: {
          dialogId: this.activeDialog.id,
          clientCallbackFunction: this.clientCallback
        }
      };
      console.log('holdCallOnSip sip==>', command);
      postMessage(command);
    } catch (error) {
      console.log(error, 'on hold call command sip==>');
    }
  }

  resumeCallOnSip() {
    try {
      let command = {
        action: "retrieveCall",
        parameter: {
          dialogId: this.activeDialog.id,
          clientCallbackFunction: this.clientCallback
        }
      };
      console.log('resumeCallOnSip sip==>', command);
      postMessage(command);
    } catch (error) {
      console.log(error, 'on resume call command sip==>');
    }
  }

  getCurrentAgentFromParticipantList(list: Array<any>) {
    try {
      return list[0];
    } catch (e) {
      console.error("[Error] getCurrentAgentFromParticipantList ==>", e);
    }
  }

  handleRefreshCase(dialogEvent, dialogState) {
    try {
      console.log('HandleRefreshCase 1 sip==>');
      let voiceTask = this.getVoiceTask();
      if (voiceTask) {
        console.log('HandleRefreshCase voice task 2 sip==>');

        let cacheId = `${this._cacheService.agent.id}:${voiceTask.channelSession.id}`;
        let D1: any = this.getDialogFromCache(cacheId);
        console.log('HandleRefreshCase cacheId sip==>', cacheId);

        console.log('HandleRefreshCase D1 3 sip==>', D1);
        if (D1 && dialogState.dialog == null) {
          console.log('HandleRefreshCase D1 4 sip==>');
          this.handleCallDroppedEvent(cacheId, D1, "onRefresh", undefined, "DIALOG_ENDED");
        } else if (D1 && dialogState.dialog) {
          if (D1.dialog.id != dialogState.dialog.id) {
            this.handleCallDroppedEvent(cacheId, D1, "onRefresh", dialogEvent, "DIALOG_ENDED");
          } else if (D1.dialog.id == dialogState.dialog.id) {
            if (D1.dialogState == "active") {
              let conversation = this.getCurrentConversationIdORConversation("conversation");
              if (conversation) {
                this.customer = conversation.customer;
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("[Error] handleRefreshCase ==>", e);
    }
  }

  checkActiveTasks(agentId) {
    try {
      this._httpService.getRETasksList(agentId).subscribe(
        (res) => {
          this.taskList = res;
          console.log('Tasklist ==> ', this.taskList);

          if (this.taskList.length > 0) {
            this.getVoiceTask();
          }
        },
        (error) => {
          this._sharedService.Interceptor(error.error, "err");
        }
      );
    } catch (e) {
      console.error("[Error] checkActiveTasks ==>", e);
    }
  }

  getVoiceTask() {
    try {
      console.log('getVoiceTask ==>',);

      if (this.taskList && this.taskList.length > 0) {
        for (let i = 0; i <= this.taskList.length; i++) {
          // if (this.taskList[i].state && this.taskList[i].state.name.toLowerCase() == "active") {
            if (this.taskList[i].channelSession && this.taskList[i].channelSession.channel.channelType.name == "CX_VOICE") return this.taskList[i];
          // }
        }
      }
      return null;
    } catch (e) {
      console.error("[Error] getVoiceTask ==>", e);
    }
  }

  logout() {
    try {
      let command = {
        action: "logout",
        parameter:{
            reasonCode: "Logged Out",
            userId: this._cacheService.agent.attributes.agentExtension[0],
            clientCallbackFunction: this.clientCallback
        }
      };
      postMessage(command);
    } catch (error) {
      console.log('[Error] Handle Logout for Sip==>', error);
    }
  }
}
