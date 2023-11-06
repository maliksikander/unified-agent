
import { EventEmitter, Injectable, Output } from "@angular/core";


@Injectable({
    providedIn: "root"
  })
  export class crmEventsService {
    constructor() {}


    agentStateChanged(e){
        if(e.action == "AGENT_STATE_CHANGED" || e.action == "AGENT_STATE_UNCHANGED" || e.agentPresence.state.name == "READY" || e.agentPresence.state.name == "NOT_READY"){
            let obj = {
                event: "Agent_State_Change_Event",
                id : e.agentPresence.agent.keycloakUser.id,
                firstName:e.agentPresence.agent.keycloakUser.firstName,
                agentData: e.agentPresence
              };
              console.log("sending post event==>",obj)
              window.postMessage(obj, location.origin);
        }else if(e.agentPresence.state.name == "READY" ){
            let obj = {
                event: "MRD_State_Change_Event",
                id : e.agentPresence.agent.keycloakUser.id,
                firstName:e.agentPresence.agent.keycloakUser.firstName,
                agentData: e.agentPresence
              };
              console.log("sending post event==>",obj)
              window.postMessage(obj, location.origin);
        }

    }
    taskStateChanged(e){
        if(e.name == 'TASK_STATE_CHANGED'){
            let obj = {
                event: "Task_State_Change_Event",
                //id:e.id,
                //firstName:e.agent.keycloakUser.firstName,
                agentData: e
              };
              console.log("sending event==>",obj)
              window.postMessage(obj, location.origin);
        }

    }
    chatSwitching(e,e1){
        if(e){
            let obj = {
                event: "Chat_Switching_Event",
                agentData: {
                    currentCustomer:{
                        conversationId : e.conversationId,
                        customer : e.customer
                    },
                    previousCustomer:{
                        conversationId : e1.conversationId,
                        customer : e1.customer
                    }
                }
              };
              console.log("sending event==>",obj)
              window.postMessage(obj,location.origin);
        }

    }
    login(e){
        if(e){
            let obj = {
                event: "Login_Event",
                //id:e.id,
                //firstName:e.agent.keycloakUser.firstName,
                id: e.keycloak_User.id,
                firstName:e.keycloak_User.firstName,
                agentData: {
                    keycloak_User: e.keycloak_User
                }
              };
              console.log("sending event==>",obj)
              console.log("location",location.origin)
              window.postMessage(obj, location.origin);
        }

    }
}