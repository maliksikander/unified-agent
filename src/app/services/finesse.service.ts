import { Injectable } from "@angular/core";
import { cacheService } from "./cache.service";
import { sharedService } from "./shared.service";
import { snackbarService } from "./snackbar.service";
import { socketService } from "./socket.service";
import { httpService } from "./http.service";
import * as uuid from "uuid";
import { TranslateService } from "@ngx-translate/core";
import { appConfigService } from "./appConfig.service";

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
  conversationID;

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
      // console.log("state change==>", e.msg);
      if (e.msg == "stateChanged" && this.finesseAgent.loginId != "") {
        this.handlePresence(e.data);
      }
    });
  }

  // incoming states from CIM
  handlePresence(agentPresence) {
    // check if the MRDs have a voice mrd in it or not
    let hasVoiceMrd: boolean = this._appConfigService.config.isCiscoEnabled;
    // console.log("mrd==>", hasVoiceMrd)

    if (hasVoiceMrd) {
      // console.log("isCiscoEnabled==>", hasVoiceMrd);
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
    } else {
      // console.log("isCiscoEnabled==>", hasVoiceMrd);
      console.error("Cisco is Not Enabled, Check configurations to enable it.");
      this._snackbarService.open("CISCO is not Enabled!", "err");
    }
  }

  // from the list of mrds, it will return voice mrd
  getVoiceMrd(mrds) {
    try {
      let voiceMrd = mrds.find((e) => {
        if (e.mrd.id == this._appConfigService.config.CISCO_CC_MRD) {
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
    this.registerCallBack();
    //this.finesseLogin();
  }

  registerCallBack() {
    let command = {
      action: "registerCallback",
      parameter: {
        callbackFunction: this.cimClientCallbackFunction
      }
    };
    console.log("register command==>", command);
    executeCommands(command);
    try {
      let ctiLib = document.createElement("script");
      ctiLib.setAttribute("src", "assets/cti/CTIJsLibrary.js");
      ctiLib.onload = () => {
        this.finesseLogin();
      };
      document.head.appendChild(ctiLib);
    } catch (err) {
      console.error("[registerCallBack] Error ==>", err);
    }
  }

  finesseLogin() {
    let command = {
      action: "login",
      parameter: {
        loginId: this.finesseAgent.loginId,
        password: this.finesseAgent.password,
        extension: this.finesseAgent.extension,
        isSSOUser: this.finesseAgent.isSSOUser,
        // authToken: this.finesseAgent.authToken,
        clientCallbackFunction: this.cimClientCallbackFunction
      }
    };

    let logoutStatus = localStorage.getItem("logoutFlag");
    if (logoutStatus == null || logoutStatus == undefined || logoutStatus == "true") {
      console.log("login command==>", command);
      executeCommands(command);
    }
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
        if (this.finesseLogoutReasonCodes) {
          executeCommands({ action: "makeNotReadyWithReason", parameter: { reasonCode: this.finesseNotReadyReasonCodes[0].code } });
        } else {
          let loginParameters = localStorage.getItem("loginParameters");
          if (loginParameters) {
            let params = JSON.parse(loginParameters);
            let loginId = params.parameter.loginId;
            executeCommands({ action: "makeNotReadyWithReason", parameter: { userId: loginId } });
          }
        }
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

  cimClientCallbackFunction = (event) => {
    try {
      console.log("CTI event==>", event);

      if (event.event.toLowerCase() == "dialogstate") {
        this.handleDialogStateEvent(event);
      } else if (event.event.toLowerCase() == "agentstate") {
        this.handleAgentStateFromFinesse(event.response);
        this.showErr = false;
      } else if (event.event.toLowerCase() == "xmppevent") {
        if (event.response.description == "Connection Established, XMPP Status is Connected") {
          // this._snackbarService.open("CISCO : Synsying state with cisco", "succ");
          this._snackbarService.open(this._translateService.instant("snackbar.Cisco-State-Sync-Success"), "succ");
          this.showErr = false;
          executeCommands({ action: "getNotReadyLogoutReasons" });
        } else if (event.response.description == "XMPP Status is Disconnected!") {
          this.showErr = true;
          this._snackbarService.open("XMPP Status is Disconnected!", "err");
        }
      } else if (event.event.toLowerCase() == "error") {
        console.error("Error Event ==>", event.response.description);
        // this.showErr = true;
        this._snackbarService.open("CISCO :" + event.response.description, "err");
      } else if (event.event.toLowerCase() == "notreadylogoutreasoncode") {
        this.finesseLogoutReasonCodes = null;
        this.finesseNotReadyReasonCodes = null;

        this.finesseLogoutReasonCodes = event.response.logoutReasons;
        this.finesseNotReadyReasonCodes = event.response.notReadyReasons;
      } else if (event.event.toLowerCase() == "newinboundcall") {
        if (event.response.dialog) {
          let cacheId = `${this._cacheService.agent.id}:${event.response.dialog.id}`;
          let cacheDialog: any = this.getDialogFromCache(cacheId);
          if (!cacheDialog) this.identifyCustomer(event, event.response.dialog.customerNumber, "INBOUND");
        }
      } else if (event.event.toLowerCase() == "outbounddialing") {
        if (event.response.dialog.customerNumber && event.response.dialog.state.toLowerCase() == "initiated") {
          this.identifyCustomer(event, event.response.dialog.customerNumber, "OUTBOUND");
        }
      } else if (event.event.toLowerCase() == "consultcall") {
        this.handleConsultCallEvent(event);
      }
    } catch (e) {
      console.error("CTI ERROR==>", e);
    }
  };

  handleConsultCallEvent(event) {
    let dialog = event.response.dialog;
    let cacheId = `${this._cacheService.agent.id}:${dialog.id}`;
    let participants;
    if (dialog) participants = dialog.participants;
    let currentParticipant;
    if (Array.isArray(participants)) {
      // currentParticipant = participants.find((item) => {
      //   return item.mediaAddress == this.finesseAgent.extension;
      // });
      currentParticipant = this.getCurrentParticipantFromDialog(dialog);
      if (dialog.state.toLowerCase() == "alerting") {
        if (currentParticipant && currentParticipant.state.toLowerCase() == "alerting") {
          let agentIdentifier = dialog.fromAddress;
          let data = {
            identifier: agentIdentifier,
            dialogData: dialog,
            provider: "cisco"
          };
          this._sharedService.serviceChangeMessage({ msg: "openExternalModeRequestHeader", data: data });
          // this.setLocalDialogCache(event, "alerting");
          this.identifyCustomer(event, dialog.customerNumber, "");
        }

        if (currentParticipant && currentParticipant.state.toLowerCase() == "dropped") {
          // rona case for consult
          if (currentParticipant.mediaAddress !== dialog.fromAddress) this.handleCiscoRona(cacheId, dialog);
        }
      } else if (dialog.isCallEnded == 1) {
        // console.log("consult call dropped1==>");
        if (currentParticipant.mediaAddress !== dialog.fromAddress) {
          // console.log("consult call dropped2==>");
          this.handleDroppedConsultCall(event, cacheId, dialog);
        }
      } else if (dialog.state.toLowerCase() == "active") {
        if (currentParticipant.mediaAddress !== dialog.fromAddress) {
          if (currentParticipant && currentParticipant.state.toLowerCase() == "active") {
            let initiaterParticipant = participants.find((item) => {
              return item.mediaAddress == dialog.fromAddress;
            });
            if (initiaterParticipant && initiaterParticipant.state.toLowerCase() == "active") {
              let cacheId = `${this._cacheService.agent.id}:${dialog.id}`;
              let cacheDialog: any = this.getDialogFromCache(cacheId);
              console.log("Cache Dialog==>", cacheDialog);
              if (cacheDialog && cacheDialog.dialogState.toLowerCase() !== "active") {
                this.handleActiveConsultCall(event, dialog);
              }
            }
          }
        }
      } else if (dialog.state.toLowerCase() == "failed") {
        let dialogCache: any = this.getDialogFromCache(cacheId);
        if (dialogCache && dialogCache.dialogState == "active") {
          this.handleCallDroppedEvent(cacheId, dialog, "", undefined, "DIALOG_ENDED");
        }
        this.removeNotification(dialog);
      } else if (dialog.state.toLowerCase() == "dropped" && dialog.isCallEnded == 1) {
        // console.log("consult call dropped1==>");
        if (currentParticipant.mediaAddress !== dialog.fromAddress) {
          // console.log("consult call dropped2==>");
          this.handleDroppedConsultCall(event, cacheId, dialog);
        }
      }
    }
  }

  identifyCustomer(ciscoEvent, customerNumber, callType) {
    try {
      let customerIdentifier = customerNumber;
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
      this._httpService.getCustomerByChannelTypeAndIdentifier("CISCO_CC", identifier).subscribe(
        (res) => {
          this.customer = res.customer;
          let data = {
            customer: res.customer,
            identifier,
            dialogData: ciscoEvent.response.dialog,
            provider: "cisco"
          };
          if (callType == "INBOUND") {
            this._sharedService.serviceChangeMessage({ msg: "openExternalModeRequestHeader", data: data });
            this.setLocalDialogCache(ciscoEvent, "alerting");
          } else if (callType == "CONSULT_OFFERED" || callType == "CONFERENCE") {
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

  handleDialogStateEvent(dialogEvent) {
    try {
      let dialogState = dialogEvent.response;
      if (this.customer && dialogState.dialog && dialogState.dialog.participants) {
        // console.log("Dialog State 1==>");
        let participants = dialogState.dialog.participants;
        let cacheId = `${this._cacheService.agent.id}:${dialogState.dialog.id}`;
        if (Array.isArray(participants) && participants.length > 0) {
          // console.log("Dialog State 2==>");
          this.handleDialogParticipants(dialogEvent, participants, cacheId);
        } else {
          // console.log("Dialog State 3==>");
          console.log("No Participant Found==>");
          // this.handleDialogParticipantObject(participants, dialogState, cacheId);
        }
      } else if (
        !this.customer &&
        dialogState.dialog &&
        dialogState.dialog.participants &&
        (dialogState.dialog.callType.toLowerCase() == "transfer" ||
          dialogState.dialog.callType.toLowerCase() == "offered" ||
          dialogState.dialog.callType.toLowerCase() == "consult_offered" ||
          dialogState.dialog.callType.toLowerCase() == "conference")
      ) {
        console.log("direct transfer case cce==>");
        // console.log("Dialog State 4==>");
        let participants = dialogState.dialog.participants;
        let cacheId = `${this._cacheService.agent.id}:${dialogState.dialog.id}`;
        if (Array.isArray(participants)) {
          // console.log("Dialog State 5==>");
          this.handleDialogParticipants(dialogEvent, participants, cacheId);
        } else {
          // console.log("Dialog State 6==>");
          console.log("No Participant Found==>");
          // this.handleDialogParticipantObject(participants, dialogState, cacheId);
        }
      } else {
        // console.log("na g==>");
        // console.log("Dialog State 7==>");
        if (!this.customer) {
          // console.log("Dialog State 8==>");
          this.handleRefreshCase(dialogEvent, dialogState);
        }
      }
    } catch (e) {
      console.error("[Error] handleDialogStateEvent ==>", e);
    }
  }

  handleDialogParticipants(dialogEvent, participants, cacheId) {
    try {
      let dialogState = dialogEvent.response;
      participants.forEach((item) => {
        let currentParticipant = item.mediaAddress == this.finesseAgent.extension ? item : undefined;
        if (currentParticipant) {
          if (dialogState.dialog.isCallEnded === 1) {
            // console.log("handle dialog 1==>");
            let item: any = this.getDialogFromCache(cacheId);
            if (item && item.dialogState == "active") {
              // console.log("handle dialog 2==>");
              if (this.timeoutId) clearInterval(this.timeoutId);

              this.handleCallDroppedEvent(cacheId, dialogState, "", undefined, "DIALOG_ENDED");
            }
          } else if (dialogState.dialog.state.toLowerCase() == "active") {
            // console.log("handle dialog 3==>");
            if (currentParticipant.state.toLowerCase() == "active") {
              // console.log("handle dialog 4==>");
              let dialogCache: any = this.getDialogFromCache(cacheId);
              // console.log("dialog cache==>", dialogCache);
              if (dialogCache && dialogCache.dialogState == "alerting") {
                // console.log("handle dialog 5==>");
                this.handleCallActiveEvent(dialogEvent, dialogState);
              } else {
                // console.log("handle dialog 6==>");
                // if (dialogState.dialog.callType == "AGENT_INSIDE" || dialogState.dialog.callType == "OUT") {
                //   this.handleCallActiveEvent(dialogEvent, dialogState);
                // } else
                if (
                  dialogState.dialog.callType.toLowerCase() == "consult_offered" ||
                  ((this._appConfigService.finesseConfig.finesseFlavor.toLowerCase() == "uccx" ||
                    this._appConfigService.finesseConfig.finesseFlavor.toLowerCase() == "ccx") &&
                    dialogState.dialog.callType.toLowerCase() == "transfer")
                ) {
                  // console.log("handle dialog 7==>");
                  // consult-transfer active case
                  let dialogCache: any = this.getDialogFromCache(cacheId);
                  if (!dialogCache) {
                    // console.log("handle dialog 8==>");
                    this.handleActiveConsultTransferORConferenceCCall(dialogEvent, "CONSULT_OFFERED");
                  }
                } else if (dialogState.dialog.callType.toLowerCase() == "conference") {
                  // console.log("handle dialog 9==>");
                  if (!dialogCache) {
                    // console.log("handle dialog 10==>");
                    let consultDialogId = dialogState.dialog.secondaryId;
                    let consultCallDialogCacheId = `${this._cacheService.agent.id}:${consultDialogId}`;
                    let consultCacheDialog = this.getDialogFromCache(consultCallDialogCacheId);
                    if (!consultCacheDialog) {
                      // console.log("handle dialog 11==>");
                      this.handleActiveConsultTransferORConferenceCCall(dialogEvent, "CONFERENCE");
                    }
                  }
                }
              }
            } else if (currentParticipant.state.toLowerCase() == "dropped") {
              // console.log("handle dialog 12==>");
              let callType;
              if (dialogState.dialog.callType.toLowerCase() == "transfer") {
                callType = "DIRECT_TRANSFER";
                if (
                  this._appConfigService.finesseConfig.finesseFlavor.toLowerCase() == "uccx" ||
                  this._appConfigService.finesseConfig.finesseFlavor.toLowerCase() == "ccx"
                ) {
                  callType = "CONSULT_TRANSFER";
                }

                if (dialogState.dialog.callType.toLowerCase() == "offered") {
                  callType = "DIRECT_TRANSFER";
                }
                // console.log("handle dialog 13==>");
                let item: any = this.getDialogFromCache(cacheId);
                if (item && item.dialogState == "active") {
                  // console.log("handle dialog 13.2==>");
                  this.handleCallDroppedEvent(cacheId, dialogState, "", undefined, callType);
                } else if (item && item.dialogState == "alerting") {
                  // console.log("handle dialog 13.3==>");
                  if (dialogState.dialog.state.toLowerCase() == "active") {
                    // console.log("handle dialog 13.4==>");
                    this.handleCiscoRona(cacheId, dialogState);
                  }
                }
              } else if (dialogState.dialog.callType.toLowerCase() == "consult_offered") {
                // console.log("handle dialog 14==>");
                callType = "CONSULT_TRANSFER";
                this.handleCallDroppedEvent(cacheId, dialogState, "", undefined, callType);
              } else if (
                dialogState.dialog.callType.toLowerCase() == "conference" ||
                dialogState.dialog.callType.toLowerCase() == "preroute_acd_in"
              ) {
                console.log("handle dialog 15==>");
                callType = "CONSULT_CONFERENCE";
                this.handleCallDroppedEvent(cacheId, dialogState, "", undefined, callType);
              } else if (dialogState.dialog.callType.toLowerCase() == "offered") {
                console.log("ccx direct transfer case 1==>");
                let item: any = this.getDialogFromCache(cacheId);
                if (item && item.dialogState == "active") {
                  let callType = "DIRECT_TRANSFER";
                  this.handleCallDroppedEvent(cacheId, dialogState, "", undefined, callType);
                }
              } else {
                // console.log("handle dialog 16.1==>");
                this.handleCiscoRona(cacheId, dialogState);
              }
            } else if (
              currentParticipant.state.toLowerCase() == "alerting" &&
              (dialogState.dialog.callType.toLowerCase() == "transfer" || dialogState.dialog.callType.toLowerCase() == "offered")
            ) {
              console.log("direct transfer case 2==>");
              // console.log("handle dialog 17==>");
              this.handleDirectTransferOnAgentExtension(dialogEvent, cacheId);
            }
          } else if (currentParticipant.state.toLowerCase() == "dropped") {
            this.removeNotification(dialogState);
            // console.log("handle dialog 18==>");
            if (
              dialogState.dialog.state.toLowerCase() == "dropped" ||
              dialogState.dialog.isCallEnded === 1 ||
              dialogState.dialog.state.toLowerCase() == "active"
            ) {
              // console.log("handle dialog 19==>");
              let item: any = this.getDialogFromCache(cacheId);
              if (item && item.dialogState == "active") {
                // console.log("handle dialog 20==>");
                if (this.timeoutId) clearInterval(this.timeoutId);

                this.handleCallDroppedEvent(cacheId, dialogState, "", undefined, "DIALOG_ENDED");
              }
            }
          }
        }
        if (dialogState.dialog.state.toLowerCase() == "alerting" && item.state.toLowerCase() == "dropped") {
          let item: any = this.getDialogFromCache(cacheId);
          if (item && item.dialogState == "active") {
            console.log("ccx direct transfer case==>");
            // console.log("handle dialog 21==>");
            let callType = "DIRECT_TRANSFER";
            this.handleCallDroppedEvent(cacheId, dialogState, "", undefined, callType);
          } else {
            // console.log("handle dialog 22==>");
            //rona Case
            this.handleCiscoRona(cacheId, dialogState);
          }
        } else if (dialogState.dialog.state.toLowerCase() == "failed") {
          // console.log("handle dialog 22==>");
          let dialogCache: any = this.getDialogFromCache(cacheId);
          if (dialogCache && dialogCache.dialogState == "active") {
            this.handleCallDroppedEvent(cacheId, dialogState, "", undefined, "DIALOG_ENDED");
          }
          this.removeNotification(dialogState);
        }
      });
    } catch (e) {
      console.error("[Error] handleDialogParticipant ==>", e);
    }
  }

  // updateCallVariables(dialog) {
  //   try {
  //     if (dialog && dialog.callVariables && dialog.callVariables.CallVariable) {
  //       let variablesTemp: Array<any> = JSON.parse(JSON.stringify(dialog.callVariables.CallVariable));

  //       let mainDN = {
  //         name: "mainDN",
  //         value: dialog.dialedNumber
  //       };
  //       // if (variablesTemp) {
  //         variablesTemp.push(mainDN);
  //         console.log("variables==>", variablesTemp);
  //         let command = {
  //           action: "updateCallVariableData",
  //           parameter: {
  //             dialogId: dialog.id,
  //             callVariables: {
  //               callVariable: variablesTemp
  //             }
  //           }
  //         };
  //         console.log("variable command==>", command);
  //         executeCommands(command);
  //       }
  //     // }
  //   } catch (e) {
  //     console.error("[Error] updateCallVariables ==>", e);
  //   }
  // }

  handleCallActiveEvent(dialogEvent, dialogState) {
    try {
      // this.updateCallVariables(dialogState.dialog);
      this.removeNotification(dialogState);
      let channelCustomerIdentifier = dialogState.dialog.customerNumber;
      let serviceIdentifier = dialogState.dialog.primaryDN;
      let callId = dialogState.dialog.id;
      let leg = `${this.finesseAgent.extension}:${this._cacheService.agent.id}:${dialogState.dialog.id}`;
      let callType;
      let timeStamp = this.getStartOREndTimeStamp(dialogState.dialog, "startCall");
      if (dialogState.dialog.callType.toLowerCase() == "agent_inside" || dialogState.dialog.callType.toLowerCase() == "out") {
        callType = "OUTBOUND";
        serviceIdentifier = "VOICE";
        let intent = "CALL_LEG_STARTED";
        let callId = dialogState.dialog.id;
        this.getDefaultOutBoundChannel(channelCustomerIdentifier, leg, dialogState, callType, dialogEvent, intent, undefined, timeStamp, callId);
      } else {
        if (dialogState.dialog.callType.toLowerCase() == "consult_offered") {
          callType = "CONSULT_TRANSFER";
        } else if (dialogState.dialog.callType.toLowerCase() == "conference") {
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
          callType,
          timeStamp,
          callId
        );
        console.log("[handleCallActiveEvent] CIM Message ==>", cimMessage);
        this.ccmChannelSessionApi(cimMessage, "", "", undefined);
      }
    } catch (e) {
      console.error("[Error] handleCallActiveEvent ==>", e);
    }
  }

  handleCallDroppedEvent(cacheId, dialogState, methodCalledOn, event, callType) {
    try {
      if (methodCalledOn != "onRefresh") this.clearLocalDialogCache(cacheId);
      let channelCustomerIdentifier = dialogState.dialog.customerNumber;
      if (
        channelCustomerIdentifier == undefined ||
        channelCustomerIdentifier == null ||
        channelCustomerIdentifier == "" ||
        channelCustomerIdentifier == " " ||
        channelCustomerIdentifier == "null"
      ) {
        console.log("cacheId in drop1 ==>", cacheId);
        let cacheDialog: any = this.getDialogFromCache(cacheId);
        console.log("cache dialog in drop1 ==>", cacheDialog);
        if (cacheDialog) channelCustomerIdentifier = cacheDialog.dialog.customerNumber;
        console.log("customer no in drop1 ==>", channelCustomerIdentifier);
      }
      let serviceIdentifier = dialogState.dialog.primaryDN;

      if (
        serviceIdentifier == undefined ||
        serviceIdentifier == null ||
        serviceIdentifier == "" ||
        serviceIdentifier == " " ||
        serviceIdentifier == "null"
      ) {
        console.log("cacheId in drop1 ==>", cacheId);
        let cacheDialog: any = this.getDialogFromCache(cacheId);
        console.log("cache dialog in drop1 ==>", cacheDialog);
        if (cacheDialog) serviceIdentifier = cacheDialog.dialog.primaryDN;
        console.log("primary DN in drop1 ==>", channelCustomerIdentifier);
      }
      let leg = `${this.finesseAgent.extension}:${this._cacheService.agent.id}:${dialogState.dialog.id}`;
      let timeStamp = this.getStartOREndTimeStamp(dialogState.dialog, "endCall");
      let callId = dialogState.dialog.id;
      let customer;
      if (this.customer) customer = JSON.parse(JSON.stringify(this.customer));
      if (dialogState.dialog.callType.toLowerCase() == "agent_inside" || dialogState.dialog.callType.toLowerCase() == "out") {
        callType = "DIALOG_ENDED";
        serviceIdentifier = "VOICE";
        let intent = "CALL_LEG_ENDED";
        channelCustomerIdentifier = dialogState.dialog.dialedNumber;
        this.getDefaultOutBoundChannel(channelCustomerIdentifier, leg, dialogState, callType, event, intent, customer, timeStamp, callId);
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
          timeStamp,
          callId
        );
        console.log("[ handleCallDroppedEvent] CIM Message==>", cimMessage);
        this.ccmChannelSessionApi(cimMessage, methodCalledOn, cacheId, event);
      }
      this.customer = undefined;
    } catch (e) {
      console.error("[Error] handleCallDropEvent ==>", e);
    }
  }

  handleCiscoRona(cacheId, dialog) {
    try {
      console.log("RONA==>");
      this.removeNotification(dialog);
      let item: any = this.getDialogFromCache(cacheId);
      if (item && item.dialogState == "alerting") this.clearLocalDialogCache(cacheId);
      this.customer = undefined;
    } catch (e) {
      console.error("[Error] handleCiscoRona ==>", e);
    }
  }

  getDefaultOutBoundChannel(channelCustomerIdentifier, leg, dialogState, callType, dialogEvent, intent, customerData, timeStamp, callId) {
    let customer = customerData ? customerData : this.customer;
    let voiceChannel = this._sharedService.channelTypeList.find((item) => {
      return item.name == "CISCO_CC";
    });
    try {
      this._httpService.getDefaultOutboundChannel(voiceChannel.id).subscribe(
        (res) => {
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
              callType,
              timeStamp,
              callId
            );
            console.log("[OutBoundChannel] CIM Message==>", cimMessage);
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

  getCurrentParticipantFromDialog(dialog) {
    try {
      let participantsList: Array<any> = dialog.participants;
      let currentParticipant = participantsList.find((item) => {
        return item.mediaAddress == this.finesseAgent.extension;
      });
      return currentParticipant;
    } catch (e) {
      console.error("[Error] getCurrentParticipantFromDialog ==>", e);
    }
  }

  removeNotification(dialog) {
    try {
      this._sharedService.serviceChangeMessage({ msg: "closeExternalModeRequestHeader", data: dialog });
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
    try {
      this._httpService.ccmVOICEChannelSession(data).subscribe(
        (res) => {
          console.log("CCM API Success==>");
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

  createCIMMessage(messageType, channelCustomerIdentifier, serviceIdentifier, intent, customer, leg, dialog, reasonCode, timestamp, callId) {
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
          timestamp,
          securityInfo: {},
          stamps: [],
          intent,
          entities: {},
          customer,
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
          callId,
          leg,
          dialog
        }
      };
      let voiceConversationId;
      if (intent == "CALL_LEG_ENDED") {
        voiceConversationId = this.getCurrentConversationIdORConversation("id");
        if (!voiceConversationId) voiceConversationId = this.conversationID;
        if (voiceConversationId) cimMessage.header["conversationId"] = voiceConversationId;
        let obj = {
          key: "conversationId",
          type: "String2000",
          value: voiceConversationId
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
      // console.log("list==>", conversationList);
      for (let i = 0; i <= conversationList.length; i++) {
        if (conversationList[i] && conversationList[i].activeChannelSessions) {
          let voiceSession = conversationList[i].activeChannelSessions.find((item) => {
            return item.channel.channelType.name.toLowerCase() == "cisco_cc";
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

  // getCurrentAgentFromParticipantList(list: Array<any>) {
  //   try {
  //     let currentParticpant;
  //     for (let i = 0; i <= list.length; i++) {
  //       if (list[i].mediaAddress == this.finesseAgent.extension) {
  //         currentParticpant = list[i];
  //         return currentParticpant;
  //       }
  //     }
  //     return null;
  //   } catch (e) {
  //     console.error("[Error] getCurrentAgentFromParticipantList ==>", e);
  //   }
  // }

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

  // handleSameAgentAndMrdState(resp, voiceMrdObj) {
  //   if (resp.state.toLowerCase() == "ready") {
  //     // if (this._cacheService.agentPresence.state.name.toLowerCase() != "ready") {
  //     // If state in finesse is ready and aur agent state in not readtthen make the agent ready first
  //     // and then make voice mrd ready
  //     this._socketService.emit("changeAgentState", {
  //       agentId: this._cacheService.agent.id,
  //       action: "agentState",
  //       state: { name: "READY", reasonCode: null }
  //     });

  //     // for this particular request we dont need to listen its response so making it ignorable when receiving
  //     this.ignoreAgentState = true;

  //     setTimeout(() => {
  //       this._socketService.emit("changeAgentState", {
  //         agentId: this._cacheService.agent.id,
  //         action: "agentMRDState",
  //         state: "READY",
  //         mrdId: voiceMrdObj.mrd.id
  //       });
  //     }, 500);
  //     // }
  //     // else {
  //     //   this._socketService.emit("changeAgentState", {
  //     //     agentId: this._cacheService.agent.id,
  //     //     action: "agentMRDState",
  //     //     state: "READY",
  //     //     mrdId: voiceMrdObj.mrd.id
  //     //   });
  //     // }
  //   } else if (resp.state.toLowerCase() == "not_ready") {
  //     // If state in finesse is not_ready then make the agent voice mrd not_ready
  //     this._socketService.emit("changeAgentState", {
  //       agentId: this._cacheService.agent.id,
  //       action: "agentMRDState",
  //       state: "NOT_READY",
  //       mrdId: voiceMrdObj.mrd.id
  //     });
  //   } else if (resp.state.toLowerCase() == "talking") {
  //     this._socketService.emit("changeAgentState", {
  //       agentId: this._cacheService.agent.id,
  //       action: "agentMRDState",
  //       state: "BUSY",
  //       mrdId: voiceMrdObj.mrd.id
  //     });
  //   }
  // }

  // handleDifferentAgentAndMrdState(resp, voiceMrdObj) {
  //   if (resp.state.toLowerCase() == "ready") {
  //     if (this._cacheService.agentPresence.state.name.toLowerCase() != "ready") {
  //       // If state in finesse is ready and aur agent state in not readtthen make the agent ready first
  //       // and then make voice mrd ready
  //       this._socketService.emit("changeAgentState", {
  //         agentId: this._cacheService.agent.id,
  //         action: "agentState",
  //         state: { name: "READY", reasonCode: null }
  //       });

  //       // for this particular request we dont need to listen its response so making it ignorable when receiving
  //       this.ignoreAgentState = true;

  //       setTimeout(() => {
  //         this._socketService.emit("changeAgentState", {
  //           agentId: this._cacheService.agent.id,
  //           action: "agentMRDState",
  //           state: "READY",
  //           mrdId: voiceMrdObj.mrd.id
  //         });
  //       }, 500);
  //     } else {
  //       this._socketService.emit("changeAgentState", {
  //         agentId: this._cacheService.agent.id,
  //         action: "agentMRDState",
  //         state: "READY",
  //         mrdId: voiceMrdObj.mrd.id
  //       });
  //     }
  //   } else if (resp.state.toLowerCase() == "not_ready") {
  //     // If state in finesse is not_ready then make the agent voice mrd not_ready
  //     this._socketService.emit("changeAgentState", {
  //       agentId: this._cacheService.agent.id,
  //       action: "agentMRDState",
  //       state: "NOT_READY",
  //       mrdId: voiceMrdObj.mrd.id
  //     });
  //   } else if (resp.state.toLowerCase() == "talking") {
  //     this._socketService.emit("changeAgentState", {
  //       agentId: this._cacheService.agent.id,
  //       action: "agentMRDState",
  //       state: "BUSY",
  //       mrdId: voiceMrdObj.mrd.id
  //     });
  //   }
  // }

  handleDroppedConsultCall(event, cacheId, dialog) {
    let cacheDialog: any = this.getDialogFromCache(cacheId);
    this.removeNotification(dialog);
    if (cacheDialog && cacheDialog.dialogState == "active") {
      this.clearLocalDialogCache(cacheId);
      this.onConsultCallEndCall(event, dialog, cacheId);
    }
  }

  onConsultCallEndCall(dialogEvent, dialog, cacheId) {
    try {
      // if (methodCalledOn != "onRefresh") this.clearLocalDialogCache(cacheId);
      let channelCustomerIdentifier = dialog.customerNumber;
      if (
        channelCustomerIdentifier == undefined ||
        channelCustomerIdentifier == null ||
        channelCustomerIdentifier == "" ||
        channelCustomerIdentifier == " " ||
        channelCustomerIdentifier == "null"
      ) {
        console.log("cacheId in drop2 ==>", cacheId);
        let cacheDialog: any = this.getDialogFromCache(cacheId);
        console.log("cache dialog in drop2 ==>", cacheDialog);
        if (cacheDialog) channelCustomerIdentifier = cacheDialog.dialog.customerNumber;
        console.log("customer no in drop2 ==>", channelCustomerIdentifier);
      }
      let serviceIdentifier = dialog.primaryDN;
      if (
        serviceIdentifier == undefined ||
        serviceIdentifier == null ||
        serviceIdentifier == "" ||
        serviceIdentifier == " " ||
        serviceIdentifier == "null"
      ) {
        console.log("cacheId in drop2 ==>", cacheId);
        let cacheDialog: any = this.getDialogFromCache(cacheId);
        console.log("cache dialog in drop2 ==>", cacheDialog);
        if (cacheDialog) serviceIdentifier = cacheDialog.dialog.primaryDN;
        console.log("primary DN in drop2 ==>", channelCustomerIdentifier);
      }

      let leg = `${this.finesseAgent.extension}:${this._cacheService.agent.id}:${dialog.id}`;
      let callType = "CONSULT_ENDED";
      let callId = dialog.id;
      let customer;
      let timeStamp = this.getStartOREndTimeStamp(dialog, "endCall");
      if (this.customer) customer = JSON.parse(JSON.stringify(this.customer));
      let obj = {
        // type:"VOICE",
        channelCustomerIdentifier,
        serviceIdentifier,
        // intent:"CALL_LEG_ENDED",
        customer,
        leg,
        dialog,
        callType,
        timeStamp,
        callId
      };

      let voiceConversationId = this.getCurrentConversationIdORConversation("id");
      if (!voiceConversationId) this.checkActiveTasks(this._cacheService.agent.id, "consult_ended", obj);
      else this.handleConsultEnding(obj);
    } catch (e) {
      console.error("[Error] onConsultCallEndCall ==>", e);
    }
  }

  handleConsultEnding(obj) {
    let cimMessage = this.createCIMMessage(
      "VOICE",
      obj.channelCustomerIdentifier,
      obj.serviceIdentifier,
      "CALL_LEG_ENDED",
      obj.customer,
      obj.leg,
      obj.dialog,
      obj.callType,
      obj.timeStamp,
      obj.callId
    );
    console.log("[Consult End CIM Message]==>", cimMessage);
    this.ccmChannelSessionApi(cimMessage, "", "", undefined);
    this.customer = undefined;
  }

  handleActiveConsultCall(dialogEvent, dialog) {
    this.removeNotification(dialog);
    try {
      let channelCustomerIdentifier = dialog.customerNumber;
      let serviceIdentifier = dialog.primaryDN;
      let leg = `${this.finesseAgent.extension}:${this._cacheService.agent.id}:${dialog.id}`;
      let callType = "CONSULT";
      let timeStamp = this.getStartOREndTimeStamp(dialog, "startCall");
      this.setLocalDialogCache(dialogEvent, "active");
      let callId = dialog.id;
      let cimMessage = this.createCIMMessage(
        "VOICE",
        channelCustomerIdentifier,
        serviceIdentifier,
        "CALL_LEG_STARTED",
        this.customer,
        leg,
        dialog,
        callType,
        timeStamp,
        callId
      );
      console.log("[handleActiveConsultCall] CIM Message==>", cimMessage);
      this.ccmChannelSessionApi(cimMessage, "", "", undefined);
    } catch (e) {
      console.error("[handleActiveConsultCall] Error ==>", e);
    }
  }

  handleActiveConsultTransferORConferenceCCall(event, callType) {
    let customerNumber = event.response.dialog.customerNumber;
    this.setLocalDialogCache(event, "active");
    this.identifyCustomer(event, customerNumber, callType);
  }

  handleDirectTransferOnAgentExtension(event, cacheId) {
    let customerNumber = event.response.dialog.customerNumber;
    this.setLocalDialogCache(event, "alerting");
    let dialogCache: any = this.getDialogFromCache(cacheId);

    if (!this.customer) {
      this.identifyCustomer(event, customerNumber, "INBOUND");
    }
  }

  handleRefreshCase(dialogEvent, dialogState) {
    try {
      // console.log("refresh called ==>");
      let voiceTask = this.getVoiceTask();
      if (voiceTask) {
        // console.log("refresh called 1==>");
        let cacheId = `${this._cacheService.agent.id}:${voiceTask.channelSession.id}`;
        // console.log("refresh cacheId==>", cacheId);
        let D1: any = this.getDialogFromCache(cacheId);
        // console.log("D1==>", D1);
        if (!D1) {
          if (voiceTask.type.direction == "CONSULT") {
            let test1: any = localStorage.getItem("consultCallObject");
            if (typeof test1 == "string") test1 = JSON.parse(test1);
            let consultCacheId = `${this._cacheService.agent.id}:${test1.id}`;
            let D2: any = this.getDialogFromCache(consultCacheId);
            if (D2 && dialogState.dialog == null) {
              this.handleDroppedConsultCall(dialogEvent, consultCacheId, D2.dialog);
            }
          }
        } else if (D1 && dialogState.dialog == null) {
          // console.log("refresh called 2==>");
          this.handleCallDroppedEvent(cacheId, D1, "onRefresh", undefined, "DIALOG_ENDED");
        } else if (D1 && dialogState.dialog) {
          // console.log("refresh called 3==>");
          if (D1.dialog.id != dialogState.dialog.id) {
            // console.log("refresh called 4==>");
            this.handleCallDroppedEvent(cacheId, D1, "onRefresh", dialogEvent, "DIALOG_ENDED");
          } else if (D1.dialog.id == dialogState.dialog.id) {
            // console.log("refresh called 5==>");
            if (D1.dialogState == "active") {
              // console.log("refresh called 6==>");
              let conversation = this.getCurrentConversationIdORConversation("conversation");
              if (conversation) {
                // console.log("refresh called 7==>");
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

  checkActiveTasks(agentId, method, callData) {
    try {
      this._httpService.getRETasksList(agentId).subscribe(
        (res) => {
          this.taskList = res;
          if (this.taskList.length > 0) {
            let task = this.getVoiceTask();
            if (task && method == "consult_ended") {
              this.conversationID = task.channelSession.conversationId;
              this.handleConsultEnding(callData);
            }
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
          // if (this.taskList[i].state && this.taskList[i].state.name.toLowerCase() == "active") {
          if (this.taskList[i].mrd.id == this._appConfigService.config.CISCO_CC_MRD) return this.taskList[i];
          // }
        }
      }
      return null;
    } catch (e) {
      console.error("[Error] getVoiceTask ==>", e);
    }
  }
}
