import { Injectable, Optional } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
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
  finesseAgent = { loginId: "", password: "", extension: "",isSSOUser: "" };
  finesseAgentState = { state: "", reasonId: "" };
  finesseNotReadyReasonCodes;
  finesseLogoutReasonCodes;
  ignoreAgentState: boolean = false; // in a particular scnerio when from finesse, agent state to going to ready but in cim agent was
  // not_ready, so 1st need to set the agent state ready and then voice mrd state ready so for this need to send two concurrent requests
  // 1st concurrent request dont need to be listen for which we are using this varibale to ignore that request
  voiceConversationId;
  min: any = 0;
  sec: any = 0;
  timer;
  callTimer = new Subject<any>();
  currentConversation = new Subject<any>();
  voiceChannelSessionSubject = new Subject<any>();
  removeNotification = new Subject<any>();
  _ciscoDialogID = new Subject<any>();
  activeConversation;
  isLeaveButtonClicked: boolean = false;
  dialogState: any = {};
  customerIdentifier;
  timeoutId;
  voiceChannelSession;

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

    this.voiceChannelSessionSubject.subscribe((res) => {
      this.voiceConversationId = res.conversationId;
      this.voiceChannelSession = res.channelSession;
    });

    this.currentConversation.subscribe((res) => {
      this.activeConversation = res;
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
        extension: this.finesseAgent.extension,
        isSSOUser: this.finesseAgent.isSSOUser,
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

  checkForNonVoiceSession(conversation) {
    let list: Array<any> = conversation.activeChannelSessions ? conversation.activeChannelSessions : [];
    let nonVoiceIndex = list.findIndex((item) => {
      return item.channel.channelType.name != "VOICE";
    });
    if (nonVoiceIndex != -1) return true;
    return false;
  }

  onCallEnd(conversation) {
    let voiceSession: boolean = this.checkForVoiceSession(conversation);
    let nonVoiceSession: boolean = this.checkForNonVoiceSession(conversation);

    if (voiceSession && nonVoiceSession) {
      this.emitEndChannelSessionEvent();
    } else if (voiceSession && !nonVoiceSession) {
      this.emitEndChannelSessionEvent();
      this._socketService.topicUnsub(conversation);
    } else {
      console.log("Only NON VOICE EXITS ON CALL END==>");
    }
  }

  getParticipantFromExtension(ext, participants: Array<any>) {
    return participants.find((participant) => {
      return participant.mediaAddress == ext;
    });
  }

  clientCallback = (event) => {
    try {
      console.log("CTI event==>", event);

      if (event.event.toLowerCase() == "dialogstate") {
        this.dialogState = event.response;

        if (this.dialogState.dialog && this.dialogState.dialog.participants.Participant) {
          this._ciscoDialogID.next(event.response.dialog.id)
          let participants = this.dialogState.dialog.participants.Participant;
          if (Array.isArray(participants)) {
            participants.forEach((item) => {
              let currentParticipant = item.mediaAddress == this.finesseAgent.extension ? item : undefined;

              if (currentParticipant) {
                if (this.dialogState.dialog.state == "ACTIVE") {
                  if (currentParticipant.state == "ACTIVE") {
                    this.timeoutId = setInterval(() => {
                      this.startTimer();
                    }, 1000);
                    if (this.voiceConversationId && this.voiceChannelSession) {
                      this.createTaskAndTopicSubscriptionEvent(this.voiceConversationId, this.voiceChannelSession);
                    } else {
                      this._snackbarService.open("No Conversation ID Found", "err");
                    }
                  } else if (currentParticipant.state == "DROPPED") {
                    if (this.timeoutId) {
                      clearInterval(this.timeoutId);
                      this.min = 0;
                      this.sec = 0;
                    }
                    if (!this.isLeaveButtonClicked) {
                      if (this.activeConversation) {
                        this.onCallEnd(this.activeConversation);
                      } else {
                        console.log("[Call Dropped Event] No Conversation Found");
                      }
                    } else {
                      this.isLeaveButtonClicked = false;
                    }
                  }
                }
              }
              if (this.dialogState.dialog.state == "ALERTING" && item.state == "DROPPED") {
                this.removeNotification.next({
                  conversationId: this.voiceConversationId,
                  identifier : this.customerIdentifier
                });
                this.emitEndChannelSessionEvent();
              } else if (this.dialogState.dialog.state == "FAILED") {
                let identifier = this.dialogState.dialog.fromAddress;
                this.removeNotification.next({
                  conversationId: this.voiceConversationId,
                  identifier
                });
                this.emitEndChannelSessionEvent();
              }
            });
          } else {
            if (participants.state == "DROPPED") {
              if (this.timeoutId) {
                clearInterval(this.timeoutId);
                this.min = 0;
                this.sec = 0;
              }
              if (!this.isLeaveButtonClicked) {
                if (this.activeConversation) {
                  this.onCallEnd(this.activeConversation);
                } else {
                  console.log("[Call Dropped Event] No Conversation Found");
                }
              } else {
                this.isLeaveButtonClicked = false;
              }
            } else if (this.dialogState.dialog.state == "FAILED") {
              let identifier = this.dialogState.dialog.fromAddress;
              this.removeNotification.next({
                conversationId: this.voiceConversationId,
                identifier
              });
              this.emitEndChannelSessionEvent();
            }
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
          cisco_data: event
          // agent: this._cacheService.agent
        };
        this.customerIdentifier = event.response.dialog.ani;
        this._socketService.emit("newInboundCallRequest", data);
      }
    } catch (e) {
      console.error("CTI ERROR==>", e);
    }
  };

  checkForExisitingConversation(idenitifer) {
    let list: Array<any> = this._socketService.conversations ? this._socketService.conversations : [];
    let conversation = list.find((item) => {
      if (item.firstChannelSession.customer) {
        return item.firstChannelSession.customer.voice == idenitifer;
      }
    });
    if (conversation) {
      return conversation.firstChannelSession;
    }
    return null;
  }

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

          // rona
          if (resp.reasonCode && resp.reasonCode.label) {
            if (resp.reasonCode.label == ronaStateOnCisco) {
              if (this.voiceConversationId) {
                this.removeNotification.next({
                  conversationId: this.voiceConversationId,
                  identifier: this.customerIdentifier
                });
                this.emitEndChannelSessionEvent();
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
      const voiceMrdObj = this.getVoiceMrd(this._cacheService.agentPresence.agentMrdStates);
      if (voiceMrdObj.state.toLowerCase() == "pending_not_ready" || voiceMrdObj.state.toLowerCase() == "not_ready") {
        this._socketService.emit("changeAgentState", {
          agentId: this._cacheService.agent.id,
          action: "agentMRDState",
          state: "READY",
          mrdId: voiceMrdObj.mrd.id
        });
      } else if (voiceMrdObj.state.toLowerCase() == "ready") {
        this._socketService.emit("changeAgentState", {
          agentId: this._cacheService.agent.id,
          action: "agentMRDState",
          state: "BUSY",
          mrdId: voiceMrdObj.mrd.id
        });
      }
    }
  }

  emitEndChannelSessionEvent() {
    let data = {
      cisco_data: this.dialogState
    };

    this._socketService.emit("endChannelSession", data);
  }

  createTaskAndTopicSubscriptionEvent(conversationId, channelSession) {
    this._socketService.emit("onCallAcceptTopicSubscription", {
      topicParticipant: new TopicParticipant("AGENT", this._cacheService.agent, conversationId, "PRIMARY", "SUBSCRIBED"),
      agentId: this._cacheService.agent.id,
      conversationId,
      channelSession
    });

    this.removeNotification.next({
      conversationId,
      identifier: this.customerIdentifier
    });
    // this.currentTaskId.next(taskId);
    this._router.navigate(["customers"]);
  }

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
}
