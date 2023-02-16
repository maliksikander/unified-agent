import { Injectable } from "@angular/core";
import { cacheService } from "./cache.service";
import { sharedService } from "./shared.service";
import { snackbarService } from "./snackbar.service";
import { socketService } from "./socket.service";
import { httpService } from "./http.service";
import * as uuid from "uuid";
import { TranslateService } from "@ngx-translate/core";
import { appConfigService } from "./appConfig.service";
import { Dialog } from "primeng/dialog";

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
  min: any = 0;
  sec: any = 0;
  timer;
  timeoutId;
  customer;
  taskList: Array<any>;

  constructor(
    private _snackbarService: snackbarService,
    private _appConfigService: appConfigService,
    private _sharedService: sharedService,
    public _cacheService: cacheService,
    private _socketService: socketService,
    private _httpService: httpService,
    private _translateService: TranslateService
  ) {}

  initMe() {
    this._sharedService.serviceCurrentMessage.subscribe((e: any) => {
      console.log("state cahnge", e.msg);
      if (e.msg == "stateChanged" && this.finesseAgent.loginId != "") {
        this.handlePresence(e.data);
      }
    });
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
    try {
      let found: boolean = false;
      found = mrds.some((e) => {
        if (e.mrd.name.toLowerCase() == "voice") {
          return true;
        }
      });
      return found;
    } catch (e) {
      console.error("[Error] isVoiceMrdExists ==>", e);
    }
  }

  // from the list of mrds, it will return voice mrd
  getVoiceMrd(mrds) {
    try {
      let voiceMrd = mrds.find((e) => {
        if (e.mrd.name.toLowerCase() == "voice") {
          return e;
        }
      });

      return voiceMrd;
    } catch (e) {
      console.error("[Error] getVoiceMrd ==>", e);
    }
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
    console.log("agent presence==>", agentPresence);
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

  clientCallback = (event) => {
    try {
      console.log("CTI event==>", event);

      if (event.event.toLowerCase() == "dialogstate") {
        this.handleDialogStateEvent(event);
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
        this.identifyCustomer(event, event.response.dialog.ani, "INBOUND");
      } else if (event.event == "outboundDialing") {
        if (event.response.dialog.ani && event.response.dialog.state == "INITIATED") {
          this.identifyCustomer(event, event.response.dialog.ani, "OUTBOUND");
        }
      } else if (event.event == "consultCall") {
        let dialog = event.response.dialog;
        let cacheId = `${this._cacheService.agent.id}:${dialog.id}`;
        let participants;
        if (dialog) participants = dialog.participants.Participant;
        let currentParticipant;
        if (Array.isArray(participants)) {
          currentParticipant = participants.find((item) => {
            return item.mediaAddress == this.finesseAgent.extension;
          });
          if (dialog.state == "ALERTING") {
            if (currentParticipant && currentParticipant.state == "ALERTING") {
              // console.log("pkre gye tum notification==>");
              let agentIdentifier = dialog.fromAddress;
              let data = {
                // agent: res.customer,
                identifier: agentIdentifier,
                dialogData: dialog
              };
              this._sharedService.serviceChangeMessage({ msg: "openExternalModeRequestHeader", data: data });
              this.setLocalDialogCache(event, "alerting");
            }

            if (currentParticipant && currentParticipant.state == "DROPPED") {
              // rona case for consult
              console.log("consult rona==>");
              if (currentParticipant.mediaAddress !== dialog.fromAddress) this.handleCiscoRona(cacheId);
            }
          } else if (dialog.state == "ACTIVE") {
            if (currentParticipant.mediaAddress !== dialog.fromAddress) {
              if (currentParticipant && currentParticipant.state == "ACTIVE") {
                let initiaterParticipant = participants.find((item) => {
                  return item.mediaAddress == dialog.fromAddress;
                });
                if (initiaterParticipant && initiaterParticipant.state == "ACTIVE") {
                  // console.log("pkre gye tum bete ==>");
                  this.handleActiveConsultCall(event, dialog);
                }
              }
            }
          } else if (dialog.state == "FAILED") {
            let dialogCache: any = this.getDialogFromCache(cacheId);
            if (dialogCache && dialogCache.dialogState == "active") {
              this.handleCallDroppedEvent(cacheId, dialog, "", undefined, "DIALOG_ENDED");
            }
            this.removeNotification();
          } else if (dialog.state == "DROPPED" && dialog.isCallEnded == 1) {
            if (currentParticipant.mediaAddress !== dialog.fromAddress) {
              console.log("consult ending ==>");
              this.handleDroppedConsultCall(event, cacheId, dialog);
            }
          }
        } else {
          if (dialog.state == "ALERTING") {
            if (participants.state == "DROPPED") {
              this.clearLocalDialogCache(cacheId);
              this.removeNotification();
            }
          } else if (dialog.state == "DROPPED") {
            if (participants.state == "DROPPED") {
              this.handleDroppedConsultCall(event, cacheId, dialog);
            }
          }
        }

        // if (event.response.dialog.ani && event.response.dialog.state == "INITIATED") {
        // }
      }
    } catch (e) {
      console.error("CTI ERROR==>", e);
    }
  };

  handleDroppedConsultCall(event, cacheId, dialog) {
    let cacheDialog: any = this.getDialogFromCache(cacheId);
    if (cacheDialog && cacheDialog.dialogState == "active") {
      console.log("tester==>");
      this.clearLocalDialogCache(cacheId);
      this.removeNotification();
      this.onConsultCallEndCall(event, dialog);
    }
  }

  onConsultCallEndCall(dialogEvent, dialog) {
    try {
      // if (methodCalledOn != "onRefresh") this.clearLocalDialogCache(cacheId);
      let channelCustomerIdentifier = dialog.fromAddress;
      let serviceIdentifier = "N/A";
      // let leg = `${dialog.id}:${this._cacheService.agent.id}`;
      let leg = `${this.finesseAgent.extension}:${this._cacheService.agent.id}`;
      let callType = "DIALOG_ENDED";
      let cimMessage = this.createCIMMessage(
        "VOICE",
        channelCustomerIdentifier,
        serviceIdentifier,
        "CALL_LEG_ENDED",
        this.customer,
        leg,
        dialog,
        callType
      );
      console.log("CIM5==>", cimMessage);
      this.ccmChannelSessionApi(cimMessage, "", "", undefined);
    } catch (e) {
      console.error("[Error] handleCallDropEvent ==>", e);
    }
  }

  handleActiveConsultCall(dialogEvent, dialog) {
    this.removeNotification();
    try {
      let channelCustomerIdentifier = dialog.fromAddress;
      let serviceIdentifier = "N/A";
      // let leg = `${dialog.id}:${this._cacheService.agent.id}`;
      let leg = `${this.finesseAgent.extension}:${this._cacheService.agent.id}`;
      let callType = "CONSULT";

      this.setLocalDialogCache(dialogEvent, "active");
      let cimMessage = this.createCIMMessage(
        "VOICE",
        channelCustomerIdentifier,
        serviceIdentifier,
        "CALL_LEG_STARTED",
        this.customer,
        leg,
        dialog,
        callType
      );
      console.log("CIM4==>", cimMessage);
      this.ccmChannelSessionApi(cimMessage, "", "", undefined);
    } catch (e) {
      console.error("[handleActiveConsultCall] Error ==>", e);
    }
  }

  handleDialogStateEvent(dialogEvent) {
    try {
      // console.log("customer==>", this.customer);
      let dialogState = dialogEvent.response;
      if (this.customer && dialogState.dialog && dialogState.dialog.participants.Participant) {
        let participants = dialogState.dialog.participants.Participant;
        let cacheId = `${this._cacheService.agent.id}:${dialogState.dialog.id}`;
        // console.log("cacheId==>", cacheId);
        if (Array.isArray(participants)) {
          this.handleDialogParticipantList(dialogEvent, participants, cacheId);
        } else {
          this.handleDialogParticipantObject(participants, dialogState, cacheId);
        }
      } else if (
        !this.customer &&
        dialogState.dialog &&
        dialogState.dialog.participants.Participant &&
        (dialogState.dialog.callType == "TRANSFER" ||
          dialogState.dialog.callType == "OFFERED" ||
          dialogState.dialog.callType == "CONSULT_OFFERED" ||
          dialogState.dialog.callType == "CONFERENCE")
      ) {
        let participants = dialogState.dialog.participants.Participant;
        let cacheId = `${this._cacheService.agent.id}:${dialogState.dialog.id}`;
        if (Array.isArray(participants)) {
          this.handleDialogParticipantList(dialogEvent, participants, cacheId);
        } else {
          this.handleDialogParticipantObject(participants, dialogState, cacheId);
        }
      } else {
        if (!this.customer) {
          this.handleRefreshCase(dialogEvent, dialogState);
        }
      }
    } catch (e) {
      console.error("[Error] handleDialogStateEvent ==>", e);
    }
  }

  handleRefreshCase(dialogEvent, dialogState) {
    try {
      let voiceTask = this.getVoiceTask();
      if (voiceTask) {
        let cacheId = `${this._cacheService.agent.id}:${voiceTask.channelSession.id}`;
        let D1: any = this.getDialogFromCache(cacheId);
        if (D1 && dialogState.dialog == null) {
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

  handleDialogParticipantList(dialogEvent, participants, cacheId) {
    try {
      let dialogState = dialogEvent.response;
      participants.forEach((item) => {
        let currentParticipant = item.mediaAddress == this.finesseAgent.extension ? item : undefined;
        if (currentParticipant) {
          if (dialogState.dialog.state == "ACTIVE") {
            this.removeNotification();
            if (currentParticipant.state == "ACTIVE") {
              let dialogCache: any = this.getDialogFromCache(cacheId);
              if (dialogCache && dialogCache.dialogState == "alerting") {
                console.log("test1==>");
                this.handleCallActiveEvent(dialogEvent, dialogState);
              } else {
                console.log("test2==>");

                if (dialogState.dialog.callType == "AGENT_INSIDE" || dialogState.dialog.callType == "OUT") {
                  console.log("test3==>");
                  this.handleCallActiveEvent(dialogEvent, dialogState);
                  // this.setLocalDialogCache(dialogEvent, "active");
                } else if (dialogState.dialog.callType == "CONSULT_OFFERED") {
                  // consult-transfer active case
                  let dialogCache: any = this.getDialogFromCache(cacheId);
                  console.log("consult transfer active ==>");
                  if (!dialogCache) {
                    this.handleActiveConsultTransferORConferenceCCall(dialogEvent, "CONSULT_OFFERED");
                  }
                } else if (dialogState.dialog.callType == "CONFERENCE") {
                  if (!dialogCache) {
                    let consultDialogId = dialogState.dialog.secondaryId;
                    let consultCallDialogCacheId = `${this._cacheService.agent.id}:${consultDialogId}`;
                    let consultCacheDialog = this.getDialogFromCache(consultCallDialogCacheId);
                    if (!consultCacheDialog) {
                      this.handleActiveConsultTransferORConferenceCCall(dialogEvent, "CONFERENCE");
                      console.log("consult conference active==>");
                    }
                  }
                }
              }
            } else if (currentParticipant.state == "DROPPED") {
              console.log("dropp case==>");
              let callType;
              if (dialogState.dialog.callType == "TRANSFER" || dialogState.dialog.callType == "OFFERED") {
                console.log("direct transfer==>");
                callType = "DIRECT_TRANSFER";
                if (
                  this._appConfigService.finesseConfig.finesseFlavor.toLowerCase() == "uccx" ||
                  this._appConfigService.finesseConfig.finesseFlavor.toLowerCase() == "ccx"
                ) {
                  callType = "CONSULT_TRANSFER";
                }

                this.handleCallDroppedEvent(cacheId, dialogState, "", undefined, callType);
              } else if (dialogState.dialog.callType == "CONSULT_OFFERED") {
                console.log("consult transfer drop==>");
                callType = "CONSULT_TRANSFER";
                this.handleCallDroppedEvent(cacheId, dialogState, "", undefined, callType);
              } else if (dialogState.dialog.callType == "CONFERENCE" || dialogState.dialog.callType == "PREROUTE_ACD_IN") {
                console.log("consult conference drop==>");
                callType = "CONSULT_CONFERENCE";
                this.handleCallDroppedEvent(cacheId, dialogState, "", undefined, callType);
              } else {
                this.handleCiscoRona(cacheId);
              }
            } else if (
              currentParticipant.state == "ALERTING" &&
              (dialogState.dialog.callType == "TRANSFER" || dialogState.dialog.callType == "OFFERED")
            ) {
              console.log("test3==>");
              this.handleDirectTransferOnAgentExtension(dialogEvent, cacheId);
            }
          }
        }
        if (dialogState.dialog.state == "ALERTING" && item.state == "DROPPED") {
          //rona Case
          this.handleCiscoRona(cacheId);
        } else if (dialogState.dialog.state == "FAILED") {
          let dialogCache: any = this.getDialogFromCache(cacheId);
          if (dialogCache && dialogCache.dialogState == "active") {
            this.handleCallDroppedEvent(cacheId, dialogState, "", undefined, "DIALOG_ENDED");
          }
          this.removeNotification();
        }
      });
    } catch (e) {
      console.error("[Error] handleDialogParticipant ==>", e);
    }
  }

  handleActiveConsultTransferORConferenceCCall(event, callType) {
    let ani = event.response.dialog.ani ? event.response.dialog.ani : event.response.dialog.fromAddress;
    this.setLocalDialogCache(event, "active");
    this.identifyCustomer(event, ani, callType);
  }

  handleDirectTransferOnAgentExtension(event, cacheId) {
    let ani = event.response.dialog.ani ? event.response.dialog.ani : event.response.dialog.fromAddress;
    let dialogCache: any = this.getDialogFromCache(cacheId);

    if (!this.customer) {
      console.log("test 4===>", cacheId);
      this.identifyCustomer(event, ani, "INBOUND");
    }
  }

  handleDialogParticipantObject(participants, dialogState, cacheId) {
    try {
      if (participants.state == "DROPPED") {
        this.removeNotification();
        if (dialogState.dialog.state == "DROPPED" || dialogState.dialog.state == "ACTIVE") {
          let item: any = this.getDialogFromCache(cacheId);
          if (item && item.dialogState == "active") {
            if (this.timeoutId) clearInterval(this.timeoutId);

            this.handleCallDroppedEvent(cacheId, dialogState, "", undefined, "DIALOG_ENDED");
          }
        }
      } else if (dialogState.dialog.state == "FAILED") {
        let dialogCache: any = this.getDialogFromCache(cacheId);
        if (dialogCache && dialogCache.dialogState == "active") {
          this.handleCallDroppedEvent(cacheId, dialogState, "", undefined, "DIALOG_ENDED");
        }
        this.removeNotification();
      }
    } catch (e) {
      console.error("[Error] handleDialogParticipantObject ==>", e);
    }
  }

  identifyCustomer(ciscoEvent, ani, callType) {
    try {
      let customerIdentifier = ani;
      if (customerIdentifier) {
        this.getCustomerByVoiceIdentifier(customerIdentifier, ciscoEvent, callType);
      } else {
        this._snackbarService.open("No Customer Identifier Found", "err");
      }
    } catch (e) {
      console.error("[Error on Identify Customer] ==>", e);
    }
  }

  getCustomerByVoiceIdentifier(identifier, ciscoEvent, callType) {
    try {
      this._httpService.getCustomerByChannelTypeAndIdentifier("VOICE", identifier).subscribe(
        (res) => {
          console.log("customer res==>", res);
          this.customer = res.customer;
          let data = {
            customer: res.customer,
            identifier,
            dialogData: ciscoEvent.response.dialog
          };
          if (callType == "INBOUND") {
            this._sharedService.serviceChangeMessage({ msg: "openExternalModeRequestHeader", data: data });
            this.setLocalDialogCache(ciscoEvent, "alerting");
          } else if (callType == "CONSULT_OFFERED" || callType == "CONFERENCE") {
            console.log("test8==>");
            let dialogState = ciscoEvent.response;
            this.handleCallActiveEvent(ciscoEvent, dialogState);
          } else {
            this.setLocalDialogCache(ciscoEvent, "alerting");
          }
        },
        (error) => {
          this._sharedService.Interceptor(error.error, "err");
        }
      );
    } catch (e) {
      console.error("[Error] getCustomerByVoiceIdentifier ==>", e);
    }
  }

  handleCiscoRona(cacheId) {
    try {
      this.removeNotification();
      let item: any = this.getDialogFromCache(cacheId);
      if (item && item.dialogState == "alerting") this.clearLocalDialogCache(cacheId);
    } catch (e) {
      console.error("[Error] handleCiscoRona ==>", e);
    }
  }

  handleCallDroppedEvent(cacheId, dialogState, methodCalledOn, event, callType) {
    try {
      if (methodCalledOn != "onRefresh") this.clearLocalDialogCache(cacheId);
      let channelCustomerIdentifier = dialogState.dialog.ani ? dialogState.dialog.ani : dialogState.dialog.fromAddress;
      let serviceIdentifier = dialogState.dialog.dialedNumber;
      // let leg = `${dialogState.dialog.id}:${this._cacheService.agent.id}`;
      let leg = `${this.finesseAgent.extension}:${this._cacheService.agent.id}`;
      let customer;
      if (this.customer) customer = JSON.parse(JSON.stringify(this.customer));
      if (dialogState.dialog.callType == "AGENT_INSIDE" || dialogState.dialog.callType == "OUT") {
        callType = "DIALOG_ENDED";
        serviceIdentifier = "VOICE";
        let intent = "CALL_LEG_ENDED";
        channelCustomerIdentifier = dialogState.dialog.dialedNumber;
        this.getDefaultOutBoundChannel(channelCustomerIdentifier, leg, dialogState, callType, event, intent, customer);
      } else {
        console.log("callType==>", callType);
        let cimMessage = this.createCIMMessage(
          "VOICE",
          channelCustomerIdentifier,
          serviceIdentifier,
          "CALL_LEG_ENDED",
          customer,
          leg,
          dialogState.dialog,
          callType
        );
        console.log("CIM3==>", cimMessage);
        this.ccmChannelSessionApi(cimMessage, methodCalledOn, cacheId, event);
      }
      this.customer = undefined;
    } catch (e) {
      console.error("[Error] handleCallDropEvent ==>", e);
    }
  }

  handleCallActiveEvent(dialogEvent, dialogState) {
    try {
      console.log("test 5==>");
      let channelCustomerIdentifier = dialogState.dialog.ani ? dialogState.dialog.ani : dialogState.dialog.fromAddress;
      let serviceIdentifier = dialogState.dialog.dialedNumber;
      // let leg = `${dialogState.dialog.id}:${this._cacheService.agent.id}`;
      let leg = `${this.finesseAgent.extension}:${this._cacheService.agent.id}`;
      let callType;

      if (dialogState.dialog.callType == "AGENT_INSIDE" || dialogState.dialog.callType == "OUT") {
        callType = "OUTBOUND";
        serviceIdentifier = "VOICE";
        let intent = "CALL_LEG_STARTED";
        this.getDefaultOutBoundChannel(channelCustomerIdentifier, leg, dialogState, callType, dialogEvent, intent, undefined);
      } else {
        if (dialogState.dialog.callType == "CONSULT_OFFERED") {
          callType = "CONSULT_TRANSFER";
        } else if (dialogState.dialog.callType == "CONFERENCE") {
          callType = "CONSULT_CONFERENCE";
        } else {
          callType = "INBOUND";
          this.setLocalDialogCache(dialogEvent, "active");
        }

        let cimMessage = this.createCIMMessage(
          "VOICE",
          channelCustomerIdentifier,
          serviceIdentifier,
          "CALL_LEG_STARTED",
          this.customer,
          leg,
          dialogState.dialog,
          callType
        );
        console.log("CIM1==>", cimMessage);
        this.ccmChannelSessionApi(cimMessage, "", "", undefined);
      }
    } catch (e) {
      console.error("[Error] handleCallActiveEvent ==>", e);
    }
  }

  getDefaultOutBoundChannel(channelCustomerIdentifier, leg, dialogState, callType, dialogEvent, intent, customerData) {
    console.log("outbound channel api called==>");
    let customer = customerData ? customerData : this.customer;
    let voiceChannel = this._sharedService.channelTypeList.find((item) => {
      return item.name == "VOICE";
    });
    // console.log("voice channel==>", voiceChannel);
    try {
      this._httpService.getDefaultOutboundChannel(voiceChannel.id).subscribe(
        (res) => {
          // console.log("default outbound channel==>", res);
          if (res) {
            if (intent == "CALL_LEG_STARTED") this.setLocalDialogCache(dialogEvent, "active");
            let cimMessage = this.createCIMMessage(
              "VOICE",
              channelCustomerIdentifier,
              res.serviceIdentifier,
              intent,
              customer,
              leg,
              dialogState.dialog,
              callType
            );
            console.log("CIM2==>", cimMessage);
            this.ccmChannelSessionApi(cimMessage, "", "", undefined);
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

  removeNotification() {
    try {
      this._sharedService.serviceChangeMessage({ msg: "closeExternalModeRequestHeader", data: [] });
    } catch (e) {
      console.error("[Error] removeNotification ==>", e);
    }
  }

  setLocalDialogCache(ciscoEvent, dialogState) {
    try {
      let cacheId = `${this._cacheService.agent.id}:${ciscoEvent.response.dialog.id}`;
      let dialogCacheObj = {
        dialogState,
        dialog: ciscoEvent.response.dialog
      };
      localStorage.setItem(`${cacheId}`, JSON.stringify(dialogCacheObj));
    } catch (e) {
      console.error("[Error on Set Dialog Cache] ==>", e);
    }
  }

  getDialogFromCache(cacheId) {
    try {
      let item = localStorage.getItem(`${cacheId}`);
      if (item) item = JSON.parse(item);
      return item;
    } catch (e) {
      console.error("[Error on Get Dialog Cache] ==>", e);
    }
  }

  clearLocalDialogCache(cacheId) {
    try {
      localStorage.removeItem(`${cacheId}`);
    } catch (e) {
      console.error("[Error on clear Dialog Cache] ==>", e);
    }
  }

  ccmChannelSessionApi(data, methodCalledOn, cacheId, event) {
    console.log("ccm api called==>");
    try {
      this._httpService.ccmVOICEChannelSession(data).subscribe(
        (res) => {
          console.log("res==>", res);
          if (methodCalledOn == "onRefresh") {
            if (event) this.handleCallActiveEvent(event, event.response);
            else this.clearLocalDialogCache(cacheId);
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

  createCIMMessage(messageType, channelCustomerIdentifier, serviceIdentifier, intent, customer, leg, dialog, reasonCode) {
    try {
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
          customer,
          agent: this._cacheService.agent,
          leg,
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
    try {
      let currentParticpant;
      for (let i = 0; i <= list.length; i++) {
        if (list[i].mediaAddress == this.finesseAgent.extension) {
          currentParticpant = list[i];
          return currentParticpant;
        }
      }
      return null;
    } catch (e) {
      console.error("[Error] getCurrentAgentFromParticipantList ==>", e);
    }
  }

  // if the receiving event from the CISCO is agentState then this will be called
  handleAgentStateFromFinesse(resp) {
    try {
      // saving the current finesse states in memory
      this.finesseAgentState.state = resp.state;
      this.finesseAgentState.reasonId = resp.reasonCode != undefined ? resp.reasonCode.id : null;
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
          } else if (resp.state.toLowerCase() == "talking") {
            this._socketService.emit("changeAgentState", {
              agentId: this._cacheService.agent.id,
              action: "agentMRDState",
              state: "BUSY",
              mrdId: voiceMrdObj.mrd.id
            });
          }
        }
      }
    } catch (e) {
      console.error("[Error] handleAgentStateFromFinesse ==>", e);
    }
  }

  checkActiveTasks(agentId) {
    try {
      this._httpService.getRETasksList(agentId).subscribe(
        (res) => {
          this.taskList = res;
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
          if (this.taskList[i].state && this.taskList[i].state.name.toLowerCase() == "active") {
            if (this.taskList[i].channelSession && this.taskList[i].channelSession.channel.channelType.name == "VOICE") return this.taskList[i];
          }
        }
      }
      return null;
    } catch (e) {
      console.error("[Error] getVoiceTask ==>", e);
    }
  }
}
