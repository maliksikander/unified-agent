import { Injectable } from "@angular/core";
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
    finesseAgent = { loginId: '', password: '', extention: '' };
    finesseAgentState = { state: '', reasonId: '' };
    finesseNotReadyReasonCodes;
    finesseLogoutReasonCodes;

    constructor(private _snackbarService: snackbarService, private _sharedService: sharedService, public _cacheService: cacheService, private _socketService: socketService) {
        this._sharedService.serviceCurrentMessage.subscribe((e: any) => {
            if (e.msg == "stateChanged" && this.finesseAgent.loginId != '') {
                this.handlePresence(e.data);
            }
        });

    }

    loginCommand() {

        let command = {
            "action": "login",
            "parameter":
            {
                "loginId": "716531162",
                "password": "12345",
                "extension": "1130",
                "clientCallbackFunction": this.clientCallback
            }
        };
        executeCommands(command);
    }

    handlePresence(agentPresence) {

        let hasVoicMrd: boolean = this.isVoiceMrdExists(agentPresence.agentMrdStates);

        if (hasVoicMrd) {

            if (!this.isAlreadysubscribed) {

                this.subscribeToCiscoEvents();
            } else {
                this.changeFinesseState(agentPresence);
            }

        }

    }


    isVoiceMrdExists(mrds) {

        let found: boolean = false;
        found = mrds.some(e => {
            if (e.mrd.name.toLowerCase() == "voice") {
                return true;
            }
        });
        return found;
    }

    getVoiceMrd(mrds) {
        let voiceMrd = mrds.find(e => {
            if (e.mrd.name.toLowerCase() == "voice") {
                return e;
            }
        });

        return voiceMrd;
    }

    subscribeToCiscoEvents() {

        this._snackbarService.open("Synsying state with cisco", "succ");

        let command = {
            "action": "login",
            "parameter":
            {
                "loginId": this.finesseAgent.loginId,
                "password": this.finesseAgent.password,
                "extension": this.finesseAgent.extention,
                "clientCallbackFunction": this.clientCallback
            }
        };
        executeCommands(command);
    }

    changeFinesseState(agentPresence) {

        const voiceMrdObj = this.getVoiceMrd(agentPresence.agentMrdStates);

        // for agent ready state
        if (agentPresence.state.name.toLowerCase() == "ready") {

            // if agent state is ready and finese state is also ready and voice mrd state is not ready then make the voice mrd ready
            if (this.finesseAgentState.state.toLowerCase() == "ready" && voiceMrdObj.state.toLowerCase() != "ready") {
                this._socketService.emit("changeAgentState", {
                    agentId: this._cacheService.agent.id,
                    action: "agentMRDState",
                    state: "READY",
                    mrdId: voiceMrdObj.mrd.id
                });
            }

            // if agent state is ready and finesse state is not ready then change the finsess state to ready
            if (this.finesseAgentState.state.toLowerCase() != "ready") {
                executeCommands({ "action": "makeReady" });
            }

            // for agent not ready state
        } else if (agentPresence.state.name.toLowerCase() == "not_ready") {

            // if agent state is not_ready and finesse state is not not_ready then change the finsess state to not_ready
            if (this.finesseAgentState.state.toLowerCase() != "not_ready") {
                executeCommands({ "action": "makeNotReadyWithReason", "parameter": { "reasonCode": this.finesseNotReadyReasonCodes[0].code } });
            }

        }

    }




    clientCallback = function (event) {
        console.log("CTI event ", event);

        if (event.event.toLowerCase() == "agentstate") {
            this.handleAgentStateFromFinesse(event.response);


        } else if (event.event.toLowerCase() == "xmppevent") {

            if (event.response.description == "Connection Established, XMPP Status is Connected") {
                executeCommands({ "action": "getNotReadyLogoutReasons" });
            }



        } else if (event.event.toLowerCase() == "error") {
            this._snackbarService.open(event.response.description, "err");



        } else if (event.event.toLowerCase() == "notreadylogoutreasoncode") {
            this.finesseLogoutReasonCodes = null;
            this.finesseNotReadyReasonCodes = null;

            this.finesseLogoutReasonCodes = event.response.logoutReasons;
            this.finesseNotReadyReasonCodes = event.response.notReadyReasons;
        }

    }

    handleAgentStateFromFinesse(resp) {

        this.finesseAgentState.state = resp.state;
        this.finesseAgentState.reasonId = resp.reasonCode.id;

        const voiceMrdObj = this.getVoiceMrd(this._cacheService.agentPresence.agentMrdStates);


        if (resp.state.toLowerCase() == "logout") {

            this._socketService.emit("changeAgentState", {
                agentId: this._cacheService.agent.id,
                action: "agentState",
                state: { name: "LOGOUT", reasonCode: '' }
            });


        } else if (resp.state != voiceMrdObj.state) {

            if (resp.state.toLowerCase() == "ready") {

                if (this._cacheService.agentPresence.state.name.toLowerCase() != "ready") {
                    // If state in finesse is ready and aur agent state in not readtthen make the agent also ready in our system,
                    // and mrd state will ready on incoming agent state checking on next event
                    this._socketService.emit("changeAgentState", {
                        agentId: this._cacheService.agent.id,
                        action: "agentState",
                        state: { name: "READY", reasonCode: null }
                    });
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
            }

        }

    }

} 