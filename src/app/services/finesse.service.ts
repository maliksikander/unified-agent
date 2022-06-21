import { Injectable, Optional } from "@angular/core";
import { Router } from "@angular/router";
import { TopicParticipant } from "../models/User/Interfaces";
import { appConfigService } from "./appConfig.service";
import { cacheService } from "./cache.service";
import { sharedService } from "./shared.service";
import { snackbarService } from "./snackbar.service";
import { socketService } from "./socket.service";
declare var executeCommands;

@Injectable({
  providedIn: "root"
})
export class finesseService {
  isAlreadysubscribed: boolean = false;
  showErr: boolean = false;
  finesseAgent = { loginId: "", password: "", extention: "" };
  finesseAgentState = { state: "", reasonId: "" };
  finesseNotReadyReasonCodes;
  finesseLogoutReasonCodes;
  ignoreAgentState: boolean = false; // in a particular scnerio when from finesse, agent state to going to ready but in cim agent was
  // not_ready, so 1st need to set the agent state ready and then voice mrd state ready so for this need to send two concurrent requests
  // 1st concurrent request dont need to be listen for which we are using this varibale to ignore that request
  voiceConversationId;
  voiceTaskId;

  constructor(
    private _snackbarService: snackbarService,
    private _sharedService: sharedService,
    public _cacheService: cacheService,
    private _socketService: socketService,
    private _configService: appConfigService,
    private _router: Router
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
        extension: this.finesseAgent.extention,
        clientCallbackFunction: this.clientCallback
      }
    };
    executeCommands(command);
  }

  // send the commands to the finesse
  changeFinesseState(agentPresence) {
    const voiceMrdObj = this.getVoiceMrd(agentPresence.agentMrdStates);

    if (voiceMrdObj.state.toLowerCase() == "ready") {
      // if voice mrd state is ready and finesse state is not ready then change the finsess state to ready
      if (this.finesseAgentState.state.toLowerCase() != "ready") {
        executeCommands({ action: "makeReady" });
      }
    } else if (voiceMrdObj.state.toLowerCase() == "not_ready") {
      // if voice mrd state is not_ready and finesse state is not not_ready then change the finsess state to not_ready
      if (this.finesseAgentState.state.toLowerCase() != "not_ready") {
        executeCommands({ action: "makeNotReadyWithReason", parameter: { reasonCode: this.finesseNotReadyReasonCodes[0].code } });
      }
    }
  }

  // accept call on finesse
  acceptCallOnFinesse(command) {
    console.log("command==>", command);
    executeCommands(command);
  }

  // this will call when an event from the CTI library received
  dialogState: any = {};
  clientCallback = (event) => {
    try {
      console.log("CTI event==>", event);

      if (event.event.toLowerCase() == "dialogstate") {
        this.dialogState = event.response;
        if (this.dialogState.dialog && this.dialogState.dialog.participants.Participant) {
          let participants = this.dialogState.dialog.participants.Participant;
          // console.log("Call ENDED==>",Array.isArray(participants));
          if (Array.isArray(participants)) {
            participants.forEach((item) => {
              if (item.state == "DROPPED") {
                console.log("Call ENDED==>");
                let customerIdentifier = this.dialogState.dialog.ani;
                let conversationIndex = this.getVoiceConversationIndex(customerIdentifier);
                if (conversationIndex != -1) {
                  let conversation = this._sharedService.pushModeConversationList[conversationIndex];
                  console.log("conversation==>", conversation);

                  let data = {
                    taskState: {
                      name: "CLOSED",
                      reasonCode: "DONE"
                    },
                    taskId: conversation.taskId,
                    cisco_data: this.dialogState
                  };

                  this._socketService.emit("onCallEnd", data);
                }
                else{
                  console.log("Call ENDED2==>",this.voiceConversationId);
                }
              }
            });
          }
        }
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
        let data = {
          cisco_data: event,
          agent: this._cacheService.agent
        };
        this._socketService.emit("newInboundCallRequest", data);
      }
    } catch (e) {
      console.error("CTI ERROR==>", e);
    }
  };

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
    } else if (resp.state.toLowerCase() == "not_ready" || resp.state.toLowerCase() == "ready") {
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

          if (resp.reasonCode && resp.reasonCode.label) {
            if (resp.reasonCode.label == ronaStateOnCisco) {
              // console.log("test==>", resp.reasonCode.label);
              // console.log("dialgState==>", this.dialogState);
              let customerIdentifier = this.dialogState.dialog.ani;
              let conversationIndex = this.getVoiceConversationIndex(customerIdentifier);
              if (conversationIndex != -1) {
                let conversation = this._sharedService.pushModeConversationList[conversationIndex];

                let data = {
                  taskState: {
                    name: "CLOSED",
                    reasonCode: "RONA"
                  },
                  taskId: conversation.taskId,
                  cisco_data: this.dialogState
                };

                this._socketService.emit("onVoiceRONA", data);
              } else {
                this._snackbarService.open("No Conversation Found", "err");
              }
            }
          }

          // this._socketService.emit("changeAgentState", {
          //   agentId: this._cacheService.agent.id,
          //   action: "agentMRDState",
          //   state: "NOT_READY",
          //   mrdId: voiceMrdObj.mrd.id
          // });
        }
      }
    } else if (resp.state.toLowerCase() == "talking") {
      console.log("talking state==>");
      console.log("conversation data==>", this.voiceConversationId);
      console.log("task data==>", this.voiceTaskId);
      this._socketService.emit("topicSubscription", {
        topicParticipant: new TopicParticipant("AGENT", this._cacheService.agent, this.voiceConversationId, "PRIMARY", "SUBSCRIBED"),
        agentId: this._cacheService.agent.id,
        conversationId: this.voiceConversationId,
        taskId: this.voiceTaskId
      });
      this._router.navigate(["customers"]);
    }
  }

  getVoiceConversationIndex(identifier) {
    let temp: Array<any> = this._sharedService.pushModeConversationList;
    console.log("temp list==>", temp);
    for (let i = 0; i <= temp.length; i++) {
      if (temp[i] && temp[i].channelSession && temp[i].channelSession.customer && temp[i].channelSession.customer.vOICE) {
        if (temp[i].channelSession.customer.vOICE.includes(identifier)) {
          console.log("i==>", i);
          return i;
        }
      } else {
        console.log("not found==>");
        return -1;
      }
    }
  }
}
