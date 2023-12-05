import { Injectable, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { cacheService } from "./cache.service";
import { snackbarService } from "./snackbar.service";
import { TranslateService } from "@ngx-translate/core";
import { appConfigService } from "./appConfig.service";
import { socketService } from "./socket.service";
import { httpService } from "./http.service";
import { sharedService } from "./shared.service";
import * as uuid from "uuid";
import { MatDialogRef } from "@angular/material";

declare var postMessage;

@Injectable({
  providedIn: "root"
})
export class SipService implements OnInit {
  public _isActiveSub = new Subject();
  public _activateToolbarSub = new Subject();
  extension: number;
  customer: any;
  startTime: any;
  endTime: any;
  timeoutId;
  timeoutIdInCustomerInfo;
  taskList: Array<any>;
  isCallActive: boolean = false;
  isCallHold: boolean = false;
  activeDialog: any;
  isSipLoggedIn: boolean = false;
  isSipConnected: boolean = false;
  agentMrdStates: any;
  customerNumber: any = "";
  isSubscriptionFailed = false;
  isMuted: boolean = false;
  isToolbarActive: boolean = false;
  isOBActive: boolean = false;
  dialogRef: MatDialogRef<any>;
  isOBCallRequested: boolean = false;
  isCallAlerting: boolean = false;
  isToolbarDocked: boolean = false;

  constructor(
    private _appConfigService: appConfigService,
    public _cacheService: cacheService,
    private _translateService: TranslateService,
    private _socketService: socketService,
    private _httpService: httpService,
    private _snackbarService: snackbarService,
    private _sharedService: sharedService
  ) {}
  ngOnInit(): void {}

  initMe() {
    try {
      if (this._appConfigService.config.isCxVoiceEnabled) {
        this._sharedService.serviceCurrentMessage.subscribe((e: any) => {
          if (e.msg == "stateChanged") {
            this.agentMrdStates = e.data;
            if (!this.isSubscriptionFailed && !this.isSipLoggedIn && this.checkAgentExtensionAttribute(this._cacheService.agent.attributes))
              this.loginSip();
          }
        });
      }
    } catch (error) {
      console.error("[Error on initMe] Sip ==>", error);
    }
  }

  // this will used to subscribe to SIP library events
  loginSip() {
    try {
      let sipPassword = localStorage.getItem("sipPass");
      sipPassword = JSON.parse(sipPassword ? atob(sipPassword) : null);
      let loginId = this._cacheService.agent.username;
      let password = sipPassword;
      if (this.checkAgentExtensionAttribute(this._cacheService.agent.attributes)) {
        let extension = this.extension != undefined ? this.extension : this._cacheService.agent.attributes.agentExtension[0];

        let command = {
          action: "login",
          parameter: {
            loginId,
            password,
            extension,
            clientCallbackFunction: this.clientCallback
          }
        };
        console.log("login SIP command sip==>", command);
        postMessage(command);
      } else {
        console.log("No Extension configured for agent==>");
        this._snackbarService.open(this._translateService.instant("snackbar.No-Extension-Found"), "err");
      }
    } catch (error) {
      this.notReadyAgentState();
      console.error("login SIP command sip==>", error);
    }
  }

  checkAgentExtensionAttribute(attributes) {
    if (Object.keys(attributes).length !== 0) {
      if (
        attributes.agentExtension !== "" &&
        attributes.agentExtension !== null &&
        attributes.agentExtension !== undefined &&
        attributes.agentExtension[0] !== ""
      ) {
        return true;
      } else {
        this._snackbarService.open(this._translateService.instant("snackbar.No-Extension-Found"), "err");
        return false;
      }
    } else {
      // this._snackbarService.open(this._translateService.instant("snackbar.No-Extension-Found"), "err");
    }
  }

  clientCallback = (event) => {
    try {
      console.log("SIP event sip==>", event);
      if (event.event.toLowerCase() == "agentinfo") {
        if (event.response.state.toLowerCase() == "login") {
          this.isSipLoggedIn = true;
          this.readyAgentState();
          this._snackbarService.open(this._translateService.instant("snackbar.CX-Voice-Login-Success"), "succ");
        }

        if (event.response.state.toLowerCase() == "logout") {
          this.isSipLoggedIn = false;
          this.notReadyAgentState();
          this._snackbarService.open(this._translateService.instant("snackbar.SIP-Logout-Successful"), "succ");
          console.log("Connection Expired, CTI Status logout==>");
        }
      } else if (event.event.toLowerCase() == "xmppevent") {
        if (event.response && event.response.type == "IN_SERVICE") {
          this.isSipConnected = true;
          if (this.isSipLoggedIn) this.readyAgentState();
          this._snackbarService.open(this._translateService.instant("snackbar.CX-Voice-Connected"), "succ");
          console.log("Connection Established, CTI Status is Connected ==>");
        } else if (event.response && event.response.type == "OUT_OF_SERVICE") {
          this.isSipConnected = false;
          this._snackbarService.open(this._translateService.instant("snackbar.CX-Voice-connection-failed"), "err");
          console.log("Connection Established, CTI Status is Connected ==>");
        }
      } else if (event.event.toLowerCase() == "dialogstate") {
        if (event.response.dialog == null) {
        } else if (event.response.dialog.state.toLowerCase() == "active") {
          this.isCallHold = false;
        } else if (event.response.dialog.state.toLowerCase() == "held") {
          this.isCallHold = true;
        }
        this.handleDialogStateEvent(event);
      } else if (event.event.toLowerCase() == "newinboundcall") {
        // this.customerNumber = event.response.dialog.customerNumber;
        // let cacheId = `${this._cacheService.agent.id}:${event.response.dialog.id}`;
        // let cacheDialog: any = this.getDialogFromCache(cacheId);
        // if (!cacheDialog) this.identifyCustomer(event, event.response.dialog.customerNumber, "INBOUND");
        this.handleInboundAndCampaignCallEvent(event, "INBOUND");
      } else if (event.event.toLowerCase() == "campaigncall") {
        this.handleInboundAndCampaignCallEvent(event, "OUTBOUND_CAMPAIGN");
      } else if (event.event.toLowerCase() == "outbounddialing") {
        if (event.response.dialog.customerNumber && event.response.dialog.state.toLowerCase() == "initiated") {
          this.identifyCustomer(event, event.response.dialog.customerNumber, "OUTBOUND");
        }
        setTimeout(() => {
          if (event.response.dialog && event.response.dialog.isCallEnded == 1) {
            this.isOBCallRequested = false;
            this.isToolbarActive = false;
            this._snackbarService.open(this._translateService.instant("snackbar.CX-Voice-call-canceled"), "err");
          }
        }, 100);
        if (event.response.dialog.state.toLowerCase() == "active") {
          this.isCallHold = false;
        } else if (event.response.dialog.state.toLowerCase() == "held") {
          this.isCallHold = true;
        }
      } else if (event.event == "Error") {
        if (event.response.type.toLowerCase() == "invalidstate") {
          this._snackbarService.open(this._translateService.instant("snackbar.CX-Voice-incorrect-request"), "err");
          this.notReadyAgentState();
        } else if (event.response.type.toLowerCase() == "subscriptionfailed") {
          this.isSubscriptionFailed = true;
          this.notReadyAgentState();
          this._snackbarService.open(this._translateService.instant("snackbar.CX-Voice-invalid-credentials"), "err");
        } else if (event.response.type.toLowerCase() == "networkissue") {
          this.notReadyAgentState();
          // this._snackbarService.open(this._translateService.instant("snackbar.CX-Voice-invalid-credentials"), "err");
        } else if (event.response.type.toLowerCase() == "generalerror") {
          if (event.response.description.toLowerCase() == "canceled") {
            this._snackbarService.open(this._translateService.instant("snackbar.CX-Voice-call-canceled"), "err");
          } else {
            let cacheId = `${this._cacheService.agent.id}:${event.response.dialog && event.response.dialog.id ? event.response.dialog.id : ""}`;
            let dialogCache: any = this.getDialogFromCache(cacheId);
            if (dialogCache && dialogCache.dialogState == "active") {
              this.handleCallDroppedEvent(cacheId, event.dialog, "call_end", undefined, "DIALOG_ENDED", undefined);
            }
            this.removeNotification(event.response.dialog);
            if (event.response.description) this._snackbarService.open(`CX Voice: ${event.response.description}`, "err");
            else this._snackbarService.open(this._translateService.instant("snackbar.CX-Voice-connection-failed"), "err");
            this.notReadyAgentState();
          }
        }
        this.isOBCallRequested = false;
        this.isCallAlerting = false;
      }
    } catch (e) {
      console.error("SIP ERROR sip==>", e);
    }
  };

  handleInboundAndCampaignCallEvent(event, callType) {
    this.customerNumber = event.response.dialog.customerNumber;
    let cacheId = `${this._cacheService.agent.id}:${event.response.dialog.id}`;
    let cacheDialog: any = this.getDialogFromCache(cacheId);
    if (!cacheDialog) this.identifyCustomer(event, event.response.dialog.customerNumber, callType);
    else if (
      event.event.toLowerCase() == "campaigncall" &&
      event.response.dialog &&
      (event.response.dialog.state.toLowerCase() == "active" || event.response.dialog.state.toLowerCase() == "dropped")
    )
      this.handleDialogStateEvent(event);
    this.isCallAlerting = true;
  }

  identifyCustomer(sipEvent: { event?: string; response: any }, ani: any, callType: string) {
    try {
      let customerIdentifier = ani;
      if (customerIdentifier) {
        this.getCustomerByVoiceIdentifier(customerIdentifier, sipEvent, callType);
      } else {
        this._snackbarService.open("No Customer Identifier Found", "err");
      }
    } catch (e) {
      console.error("[Error on Identify Customer Sip] ==>", e);
    }
  }

  getCustomerByVoiceIdentifier(identifier: any, sipEvent: { response: any }, callType: string) {
    try {
      this._httpService.getCustomerByChannelTypeAndIdentifier("CX_VOICE", identifier).subscribe(
        (res) => {
          this.customer = res.customer;
          let data = {
            customer: res.customer,
            identifier,
            dialogData: sipEvent.response.dialog,
            provider: "cx_voice",
            isOutbound: false,
            isManualOB: false
          };
          if (callType == "INBOUND" || callType == "OUTBOUND_CAMPAIGN") {
            if (callType == "OUTBOUND_CAMPAIGN") data.isOutbound = true;
            this._sharedService.serviceChangeMessage({ msg: "openExternalModeRequestHeader", data: data });
            this.setDialogCache(sipEvent, "ALERTING");
          } else if (callType == "OUTBOUND") {
            data.isManualOB = true;
            this.setDialogCache(sipEvent, "ALERTING");
            this.handleOBRequest(data);
          }
          // this.setDialogCache(sipEvent, "ALERTING");
        },
        (error) => {
          this._sharedService.Interceptor(error.error, "err");
        }
      );
    } catch (e) {
      console.error("[Error] getCustomerByVoiceIdentifier Sip ==>", e);
    }
  }

  handleOBRequest(data) {
    this.customerNumber = data.dialogData.customerNumber;
    this.activeDialog = data.dialogData;
    this.isOBActive = true;
    this._activateToolbarSub.next(data);
    // this._ctiToolbarService.openCTIToolbar(data);
  }

  getDefaultOutBoundChannel(channelCustomerIdentifier, leg, dialogState, callType, dialogEvent, intent, customerData, timeStamp, methodCalledOn) {
    try {
      let voiceChannel = this._sharedService.channelTypeList.find((item) => {
        return item.name == "CX_VOICE";
      });

      this._httpService.getDefaultOutboundChannel(voiceChannel.id).subscribe(
        (res) => {
          if (res) {
            if (methodCalledOn && methodCalledOn.action && methodCalledOn.action == "makeCall") {
              let command = methodCalledOn.command;
              command.parameter["Destination_Number"] = res.serviceIdentifier;
              console.log("makeCallOnSip ==>", command);
              postMessage(command);
            } else {
              let customer = customerData ? customerData : this.customer;
              let cacheId = `${this._cacheService.agent.id}:${dialogState.dialog.id}`;
              if (intent == "CALL_LEG_STARTED") this.setDialogCache(dialogEvent, "active");
              let cimMessage = this.createCIMMessage(
                "VOICE",
                channelCustomerIdentifier,
                res.serviceIdentifier,
                intent,
                customer,
                leg,
                dialogState.dialog,
                callType,
                timeStamp,
                undefined
              );
              console.log("[OutBoundChannel] CIM Message==>", cimMessage);
              this.ccmChannelSessionApi(cimMessage, methodCalledOn, cacheId, undefined);
            }
          }
        },
        (error) => {
          console.error("[Error on CCM Default Outbound Channel API] ==>", error);
          if (error.status && error.status == 404) {
            this._snackbarService.open(this._translateService.instant("snackbar.Default-Outbound-Channel-Not-Found"), "err");
          } else {
            this._sharedService.Interceptor(error.error, "err");
          }
        }
      );
    } catch (e) {
      console.error("[Error] getDefaultOutboundChannel ==>", e);
    }
  }

  handleDialogStateEvent(dialogEvent) {
    try {
      let dialogState = dialogEvent.response;
      this.activeDialog = dialogState.dialog;
      if (this.customer && dialogState.dialog && dialogState.dialog != null && dialogState.dialog.participants) {
        let participants = dialogState.dialog.participants;
        let cacheId = `${this._cacheService.agent.id}:${dialogState.dialog.id}`;

        if (Array.isArray(participants)) {
          this.handleDialogParticipantList(dialogEvent, participants, cacheId);
        } else {
        }
      } else {
        if (!this.customer) {
          console.log("Customer Not found sip==>");
          this.handleRefreshCase(dialogEvent, dialogState);
        }
      }
    } catch (e) {
      console.error("[Error Sip] handleDialogStateEvent ==>", e);
    }
  }

  handleDialogParticipantList(dialogEvent, participants, cacheId) {
    try {
      let dialogState = dialogEvent.response;
      participants.forEach((item) => {
        let currentParticipant = item.mediaAddress == this._cacheService.agent.attributes.agentExtension[0] ? item : undefined;
        if (currentParticipant) {
          if (dialogState.dialog.state == "ACTIVE") {
            this.removeNotification(dialogState.dialog);
            if (currentParticipant.state == "ACTIVE") {
              let cacheId = `${this._cacheService.agent.id}:${dialogState.dialog.id}`;
              this.isMuted = currentParticipant.mute ? currentParticipant.mute : false;
              let dialogCache: any = this.getDialogFromCache(cacheId);
              if (dialogState.dialog.isCallAlreadyActive == false && (!dialogCache || dialogCache.dialogState == "ALERTING")) {
                this.isCallActive = true;
                this._isActiveSub.next(true);
                this.setDialogCache(dialogEvent, "ACTIVE");
                this.handleCallActiveEvent(dialogEvent, dialogState);
              }
            }
          }
        }
      });
      if (dialogEvent.response.dialog.state == "DROPPED") {
        // this.setDialogCache(dialogEvent, "DROPPED");
        let callType = "DIALOG_ENDED";
        this.removeNotification(dialogState.dialog);
        if (dialogEvent.response.dialog.callEndReason) {
          if (dialogEvent.response.dialog.callEndReason == "NO_ANSWER" || dialogEvent.response.dialog.callEndReason == "ORIGINATOR_CANCEL") {
            let endReason = dialogEvent.response.dialog.callEndReason;
            if (dialogEvent.response.dialog.callEndReason == "NO_ANSWER") this.notReadyAgentState();
            let agentId = this._cacheService.agent.id;
            this.checkActiveTasks(agentId, dialogEvent.response, endReason);
          } else {
            if (dialogEvent.response.dialog.callEndReason == "Canceled") {
              this.notReadyAgentState();
            } else if (dialogEvent.response.dialog.callEndReason.toLowerCase() == "direct-transfered") {
              console.log("direct transfer case==>");
              callType = "DIRECT_TRANSFER";
            }
            this.handleCallDroppedEvent(cacheId, dialogState, "call_end", undefined, callType, undefined);
          }
        } else {
          let dialogCache: any = this.getDialogFromCache(cacheId);
          if (dialogCache) this.handleCallDroppedEvent(cacheId, dialogState, "call_end", dialogEvent, callType, undefined);
        }
      }
    } catch (e) {
      console.error("[Error Sip] handleDialogParticipant ==>", e);
    }
  }

  removeNotification(dialog) {
    try {
      this._sharedService.serviceChangeMessage({ msg: "closeExternalModeRequestHeader", data: dialog });
      this.isCallAlerting = false;
    } catch (e) {
      console.error("[Error Sip] removeNotification ==>", e);
    }
  }

  getCurrentParticipantFromDialog(dialog) {
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
      if (currentParticipant) {
        let time;
        if (status == "startCall") {
          time = currentParticipant.startTime;
        } else if (status == "endCall") {
          time = currentParticipant.stateChangeTime;
        }
        let unixTimeStamp = Math.floor(new Date(time).getTime() / 1000); // in seconds
        unixTimeStamp = unixTimeStamp * 1000;
        return unixTimeStamp;
      } else {
        console.log("Current participant not found ==>");
        return Math.floor(Date.now() / 1000);
      }
      return null;
    } catch (e) {
      console.error("[Error Sip] getStartOREndTimeStamp ==>", e);
    }
  }

  handleCallActiveEvent(
    dialogEvent: { event?: string; response: any },
    dialogState: { dialog: { ani: any; fromAddress: any; id: any; dnis?: any; callType?: string; dialedNumber?: any; callVariables?: any } }
  ) {
    try {
      let channelCustomerIdentifier = dialogState.dialog.ani ? dialogState.dialog.ani : dialogState.dialog.fromAddress;
      let serviceIdentifier = dialogEvent.response.dialog.dnis;
      let leg = `${this._cacheService.agent.attributes.agentExtension[0]}:${this._cacheService.agent.id}:${dialogState.dialog.id}`;
      let callType;
      let timeStamp = this.getStartOREndTimeStamp(dialogState.dialog, "startCall");
      callType = "INBOUND";
      if (
        dialogEvent.event.toLowerCase() == "campaigncall" ||
        (dialogState.dialog && dialogState.dialog.callType && dialogState.dialog.callType.toLowerCase() == "out")
      ) {
        callType = "OUTBOUND";
        serviceIdentifier = "VOICE";
        let intent = "CALL_LEG_STARTED";
        this.getDefaultOutBoundChannel(channelCustomerIdentifier, leg, dialogState, callType, dialogEvent, intent, undefined, timeStamp, undefined);
      } else {
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
          timeStamp,
          undefined
        );
        console.log("[handleCallActiveEvent] CIM Message sip==>", cimMessage);
        this.ccmChannelSessionApi(cimMessage, "", "", undefined);
      }
    } catch (e) {
      console.error("[Error] handleCallActiveEvent Sip==>", e);
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
      console.error("Not Ready State for Sip==>", error);
    }
  }

  readyAgentState() {
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
      }
      setTimeout(() => {
        this.makeCXVoiceMRDReady(voiceMrdObj);
      }, 500);
    } catch (error) {
      console.error("Ready State for Sip==>", error);
    }
  }

  makeCXVoiceMRDReady(voiceMrdObj) {
    this._socketService.emit("changeAgentState", {
      agentId: this.agentMrdStates.agent.id,
      action: "agentMRDState",
      state: "READY",
      mrdId: voiceMrdObj.mrd.id
    });
  }

  makeCXVoiceMrdNotReady() {
    try {
      const voiceMrdObj = this.getVoiceMrd(this.agentMrdStates.agentMrdStates);
      if (this.agentMrdStates.state.name.toLowerCase() != "not_ready") {
        this._socketService.emit("changeAgentState", {
          agentId: this.agentMrdStates.agent.id,
          action: "agentMRDState",
          state: "NOT_READY",
          mrdId: voiceMrdObj.mrd.id
        });
      }
    } catch (error) {
      console.error("Not Ready State for Sip==>", error);
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

  setDialogCache(sipEvent, dialogState) {
    try {
      let cacheId = `${this._cacheService.agent.id}:${sipEvent.response.dialog.id}`;
      let dialogCacheObj = {
        dialogState,
        dialog: sipEvent.response.dialog
      };
      localStorage.setItem(`${cacheId}`, JSON.stringify(dialogCacheObj));
    } catch (e) {
      console.error("[Error on Set Dialog Cache] Sip ==>", e);
    }
  }

  createCIMMessage(
    messageType: string,
    channelCustomerIdentifier: any,
    serviceIdentifier: any,
    intent: string,
    customer: any,
    leg: string,
    dialog: { ani?: any; fromAddress?: any; dnis?: any; id: any; callType?: string; dialedNumber?: any; callVariables?: any },
    reasonCode: string,
    timestamp: number,
    state
  ) {
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
          dialog,
          state
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
      console.error("[Error] createCIMMessage Sip ==>", e);
    }
  }

  ccmChannelSessionApi(data, methodCalledOn, cacheId, event) {
    try {
      this._httpService.ccmVOICEChannelSession(data).subscribe(
        (res) => {
          console.log("CCM API Success Sip==>");
          // console.log("methodCalled==>", methodCalledOn);
          if (methodCalledOn == "call_end") this.clearLocalDialogCache(cacheId);
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
      console.error("[Error on Get Call Variables List] Sip==>", err);
    }
  }

  getCurrentConversationIdORConversation(type) {
    try {
      let conversationList: Array<any> = this._socketService.conversations;
      for (let i = 0; i <= conversationList.length; i++) {
        if (conversationList[i] && conversationList[i].activeChannelSessions) {
          let voiceSession = conversationList[i].activeChannelSessions.find((item) => {
            return item.channel.channelType.name.toLowerCase() == "cx_voice";
          });
          if (voiceSession && type == "id") {
            return voiceSession.conversationId;
          } else if (voiceSession && type == "conversation") {
            return conversationList[i];
          }
        }
      }
    } catch (e) {
      console.error("[Error] getConversationIdOrConversation Sip==>", e);
    }
  }

  getDialogFromCache(cacheId: string) {
    try {
      let item = localStorage.getItem(`${cacheId}`);
      if (item) item = JSON.parse(item);
      return item;
    } catch (e) {
      console.error("[Error on Get Dialog Cache] Sip==>", e);
    }
  }

  handleCallDroppedEvent(cacheId, dialogState, methodCalledOn, event, callType, state) {
    try {
      let taskState;
      this.isToolbarActive = false;
      this.isToolbarDocked = false;
      if (state && state.taskId) taskState = state;
      let channelCustomerIdentifier = dialogState.dialog.customerNumber;
      let serviceIdentifier = dialogState.dialog.dnis;
      let intent = "CALL_LEG_ENDED";
      let leg = `${this._cacheService.agent.attributes.agentExtension[0]}:${this._cacheService.agent.id}:${dialogState.dialog.id}`;
      let customer;
      let timeStamp = this.getStartOREndTimeStamp(dialogState.dialog, "endCall");
      if (this.customer) customer = JSON.parse(JSON.stringify(this.customer));
      if (dialogState.dialog.callType.toLowerCase() == "outbound" || dialogState.dialog.callType.toLowerCase() == "out") {
        this.isOBCallRequested = false;
        // callType = "DIALOG_ENDED";
        serviceIdentifier = "VOICE";
        let cacheDialog: any = this.getDialogFromCache(cacheId);
        console.log(cacheId, "<==test==>", cacheDialog);
        if (cacheDialog && cacheDialog.dialogState == "ALERTING") {
          this.clearLocalDialogCache(cacheId);
          if (this.dialogRef) this.dialogRef.close();
        } else {
          this.getDefaultOutBoundChannel(channelCustomerIdentifier, leg, dialogState, callType, event, intent, customer, timeStamp, methodCalledOn);
        }
      } else {
        let cimMessage = this.createCIMMessage(
          "VOICE",
          channelCustomerIdentifier,
          serviceIdentifier,
          intent,
          customer,
          leg,
          dialogState.dialog,
          callType,
          timeStamp,
          taskState
        );
        console.log("[ handleCallDroppedEvent] CIM Message Sip==>", cimMessage);
        this.ccmChannelSessionApi(cimMessage, methodCalledOn, cacheId, event);
      }
      this.customer = undefined;
      this.isCallActive = false;
      this._isActiveSub.next(false);
      if (this.timeoutId) clearInterval(this.timeoutId);
      if (this.timeoutIdInCustomerInfo) clearInterval(this.timeoutIdInCustomerInfo);
    } catch (e) {
      console.error("[Error] handleCallDropEvent Sip==>", e);
    }
  }

  clearLocalDialogCache(cacheId: any) {
    try {
      localStorage.removeItem(`${cacheId}`);
    } catch (e) {
      console.error("[Error on clear Dialog Cache Sip] ==>", e);
    }
  }

  acceptCallOnSip(command: { action: string; parameter: { dialogId: any } }) {
    postMessage(command);
  }

  endCallOnSip() {
    try {
      let command = {
        action: "releaseCall",
        parameter: {
          dialogId: this.activeDialog && this.activeDialog.id ? this.activeDialog.id : null
        }
      };
      console.log("EndCallOnSip ==>", command);
      postMessage(command);
    } catch (error) {
      console.error("[Error on initMe] Sip ==>", error);
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
      console.log("holdCallOnSip==>", command);
      postMessage(command);
    } catch (error) {
      console.error("[Error on holdCallOnSip] ==>", error);
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
      console.log("resumeCallOnSip sip==>", command);
      postMessage(command);
    } catch (error) {
      console.error("[Error on resumeCallOnSip] ==>", error);
    }
  }

  makeCallOnSip(customer, number) {
    try {
      this.isOBCallRequested = true;
      this.notReadyAgentState();
      // this.makeCXVoiceMrdNotReady();
      setTimeout(() => {
        let cxMrd = this.getVoiceMrd(this.agentMrdStates.agentMrdStates);
        if (cxMrd && cxMrd.state.toLowerCase() == "not_ready") {
          let command = {
            action: "makeCall",
            parameter: {
              calledNumber: number,
              clientCallbackFunction: this.clientCallback
            }
          };
          let data = {
            action: "makeCall",
            command
          };

          // console.log("makeCallOnSip ==>", command);
          this.getDefaultOutBoundChannel(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, data);
          // postMessages(command);
        } else {
          this.isOBCallRequested = false;
          this._snackbarService.open(this._translateService.instant("snackbar.OB-Call-Request"), "err");
        }
      }, 700);
    } catch (error) {
      console.error("[Error on makeCallOnSip] ==>", error);
    }
  }

  muteCallOnSip() {
    try {
      let command = {
        action: "mute_call",
        parameter: {
          dialogId: this.activeDialog.id,
          clientCallbackFunction: this.clientCallback
        }
      };
      console.log("muteCallOnSip ==>", command);
      postMessage(command);
    } catch (error) {
      console.error("[Error on muteCallOnSip] ==>", error);
    }
  }

  unmuteCallOnSip() {
    try {
      let command = {
        action: "unmute_call",
        parameter: {
          dialogId: this.activeDialog.id,
          clientCallbackFunction: this.clientCallback
        }
      };
      console.log("unmuteCallOnSip ==>", command);
      postMessage(command);
    } catch (error) {
      console.error("[Error on unmuteCallOnSip] ==>", error);
    }
  }

  directQueueTransferOnSip(data) {
    try {
      let command = {
        action: "SST_Queue",
        parameter: {
          dialogId: this.activeDialog.id,
          queue: data.queueId,
          queueType: "ID",
          numberToTransfer: this._appConfigService.cxSipConfig.staticQueueTransferDn,
          clientCallbackFunction: this.clientCallback
        }
      };

      console.log("directQueueTransferOnSip ==>", command);
      postMessage(command);
    } catch (error) {
      console.error("[Error on directQueueTransferOnSip] ==>", error);
    }
  }

  getExtensionForTransfer(extensions) {
    try {
      if (extensions && extensions != null && extensions.length > 0) return extensions[0];
      return null;
    } catch (error) {
      console.error("[Error on getExtensionForTransferOnSip] ==>", error);
    }
  }

  directAgentTransferOnSip(extensions) {
    try {
      let ext = this.getExtensionForTransfer(extensions);
      if (ext) {
        let command = {
          action: "SST",
          parameter: {
            dialogId: this.activeDialog.id,
            numberToTransfer: ext,
            clientCallbackFunction: this.clientCallback
          }
        };
        console.log("directAgentTransferOnSip ==>", command);
        // postMessage(command);
      } else {
        this._snackbarService.open(this._translateService.instant("snackbar.CX-Voice-call-canceled"), "err");
        console.error("[Error on directAgentTransferOnSip] ==> Extension Not Found");
      }
     
    } catch (error) {
      console.error("[Error on directAgentTransferOnSip] ==>", error);
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
      let voiceTask = this.getVoiceTask();
      if (voiceTask) {
        let cacheId = `${this._cacheService.agent.id}:${voiceTask.channelSession.id}`;
        let D1: any = this.getDialogFromCache(cacheId);
        let state;
        if (voiceTask.state.name.toLowerCase() == "reserved") state = { state: "alerting", taskId: voiceTask.id };
        if (D1 && dialogState.dialog == null) {
          this.handleCallDroppedEvent(cacheId, D1, "call_end", undefined, "DIALOG_ENDED", state);
        }
        // else if (D1 && dialogState.dialog) {
        //   if (D1.dialog.id != dialogState.dialog.id) {
        //     this.handleCallDroppedEvent(cacheId, D1, "call_end", dialogEvent, "DIALOG_ENDED", state);
        //   } else if (D1.dialog.id == dialogState.dialog.id) {
        //     if (D1.dialogState == "active") {
        //       let conversation = this.getCurrentConversationIdORConversation("conversation");
        //       if (conversation) {
        //         this.customer = conversation.customer;
        //       }
        //     }
        //   }
        // }
      } else if (
        dialogState.dialog &&
        dialogState.dialog.callType &&
        (dialogState.dialog.callType.toLowerCase() == "outbound" || dialogState.dialog.callType.toLowerCase() == "out")
      ) {
        if (dialogState.dialog && dialogState.dialog.isCallEnded == 1) {
          this.isOBCallRequested = false;
          this.isToolbarActive = false;
          this._snackbarService.open(this._translateService.instant("snackbar.CX-Voice-call-canceled"), "err");
        }
      }
    } catch (e) {
      console.error("[Error] handleRefreshCase Sip==>", e);
    }
  }

  handleNoAnwerEvent(dialogState) {
    try {
      let voiceTask = this.getVoiceTask();
      let state;
      let cacheId = `${this._cacheService.agent.id}:${
        dialogState.dialog && dialogState.dialog.id ? dialogState.dialog && dialogState.dialog.id : null
      }`;
      if (voiceTask) state = { state: "alerting", taskId: voiceTask.id };
      this.handleCallDroppedEvent(cacheId, dialogState, "call_end", undefined, "DIALOG_ENDED", state);
    } catch (e) {
      console.error("[handleNoAnwerEvent] Sip Error ==>", e);
    }
  }

  checkActiveTasks(agentId, dialog, state) {
    try {
      this._httpService.getRETasksList(agentId).subscribe(
        (res) => {
          this.taskList = res;
          console.log("Tasklist ==> ", this.taskList);
          if (state) this.handleNoAnwerEvent(dialog);

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
      if (this.taskList && this.taskList.length > 0) {
        for (let i = 0; i <= this.taskList.length; i++) {
          if (this.taskList[i] && this.taskList[i].channelSession && this.taskList[i].channelSession.channel.channelType.name == "CX_VOICE")
            return this.taskList[i];
        }
      }
      return null;
    } catch (e) {
      console.error("[Error] getVoiceTask ==>", e);
    }
  }

  logout() {
    try {
      if (this.isSipLoggedIn) {
        let command = {
          action: "logout",
          parameter: {
            reasonCode: "Logged Out",
            userId: this._cacheService.agent.attributes.agentExtension[0],
            clientCallbackFunction: this.clientCallback
          }
        };
        postMessage(command);
      }
    } catch (error) {
      console.error("[Error] Handle Logout for Sip==>", error);
    }
  }
}
