
import { EventEmitter, Injectable, Output } from "@angular/core";
import { appConfigService } from "./appConfig.service";


@Injectable({
    providedIn: "root"
})
export class crmEventsService {

    eventName: string;
    agentData: any;
    conversationId = null;
    customerName = null;
    AgentReserved: boolean = false;
    crmEventsEnabled: boolean ;

    constructor(public _appConfigService: appConfigService) {
        this.crmEventsEnabled = this._appConfigService.config.isCrmEventsEnabled;
    }

// function for firing Events for CRM

    postCRMEvent(e) {
        try {
            //  when Agent Presence Object Changed
            if (this.crmEventsEnabled) {

            if ('agentStateChanged' in e && 'mrdStateChanges' in e) {
                if (e.agentStateChanged) {
                    this.eventName = "Agent_State_Change";
                    this.agentData = { id: e.agentPresence.agent.keycloakUser.id, firstName: e.agentPresence.agent.keycloakUser.firstName, agentData: e.agentPresence };
                }

                else if(e.mrdStateChanges.length !== 0 && e.agentStateChanged == false) {
                    this.eventName = "MRD_State_Change";
                    this.agentData = { id: e.agentPresence.agent.keycloakUser.id, firstName: e.agentPresence.agent.keycloakUser.firstName, agentData: e.agentPresence };
                }
            }
            //when Agent login in Agent Desk
            else if ('keycloak_User' in e) {
                this.eventName = "Agent_login";
                this.agentData = { id: e.keycloak_User.id, firstName: e.keycloak_User.firstName, agentData: e.keycloak_User };
            }
            // when Agent TASK_STATE_CHANGED in Agent Desk
            else if (e.taskState) {
                this.eventName = "TASK_STATE_CHANGED";
                this.agentData =  e ;
                  if(e.taskState.name === "RESERVED"|| e.taskState.name.toLowerCase() === "reserved"){
                    this.AgentReserved=true;
                    console.log("AgentReserved set to true");
                  }
            }
            else if(e.name == 'TASK_STATE_CHANGED'&& (e.data.task.state.name === 'WRAP_UP') ){ //&& (e.agentData.data.task.state.name === 'WRAP_UP')
                this.eventName = "TASK_STATE_CHANGED";
                this.agentData = e ;
            }

            // when Agent Answer any chat in Agent Desk
            else if( this.AgentReserved && 'topicData' in e){

                this.eventName = "TASK_STATE_CHANGED";
                this.agentData = { agentData: e };
                this.AgentReserved=false;
             }
 
             else if(e.mode == 'queue'){
                this.eventName = "TASK_STATE_CHANGED";
                this.agentData = e ;
            }
             
            //when Agent endchat any chat in Agent Desk 
            else if (e.reason == "UNSUBSCRIBED") {
                this.eventName = "Chat_End";
                this.agentData = { agentData: e };
            }
            //when Agent logout any chat in Agent Desk 
            else if (e.event == 'Logout') {
                this.eventName = "Logout_Event";
                this.agentData = { agentData: e };
            }
            this.sendEventMessage(this.eventName, this.agentData, this.conversationId, this.customerName);
           // console.log("Post==>", e)
        }
        else{
            console.log("CRM events are not enabled.");
        }
        }
        catch (e) {
            console.log("error in e==>", e)
        }
    }


    chatSwitching(currentCustomerdata, previousCustomerData) {
        try {
            if (this.crmEventsEnabled) {
            if (currentCustomerdata) {
                let obj = {
                    event: "Chat_Switching_Event",
                    agentData: {
                        currentCustomer: {
                            conversationId: currentCustomerdata.conversationId,
                            customer: currentCustomerdata   //currentCustomerdata.customer
                        },
                        previousCustomer: {
                            conversationId: previousCustomerData.conversationId,
                            customer: previousCustomerData     //previousCustomerData.customer 
                        }
                    }
                };
                //console.log("sending event==>", obj)
                window.postMessage(obj, location.origin);
            }
            //this.sendEventMessage(this.eventName, this.agentData, this.conversationId, this.customerName)
        }else{
            console.log("CRM events are not enabled.");
        }
        }
        catch (e) {
            console.log("error in e==>", e)
        }
    }


    sendEventMessage(eventName: string, agentData: any, conversationId: string | null, customerName: string | null): void {
        let eventObj: any = {
            eventName,
            agentData,
        };

        if (conversationId !== null && customerName !== null) {
            eventObj[conversationId] = conversationId;
            eventObj[customerName] = customerName;
        }

        window.postMessage(eventObj, location.origin);
        console.log("Post sendEventMessage ==>", eventObj)
    }

}



// postCRMEvent(e) {

//     // agentStateChanged
//     if ('agentStateChanged' in e && 'mrdStateChanges' in e) {
//         if (e.agentStateChanged) {
//             let event = "Agent_State_Change";
//             console.log("sending post event==>", { event: event, id: e.agentPresence.agent.keycloakUser.id, firstName: e.agentPresence.agent.keycloakUser.firstName, agentData: e.agentPresence })
//             window.postMessage({ event: event, id: e.agentPresence.agent.keycloakUser.id, firstName: e.agentPresence.agent.keycloakUser.firstName, agentData: e.agentPresence }, location.origin);
//         } else {
//             let event = "MRD_State_Change";
//             console.log("sending post event==>", { event: event, id: e.agentPresence.agent.keycloakUser.id, firstName: e.agentPresence.agent.keycloakUser.firstName, agentData: e.agentPresence })
//             window.postMessage({ event: event, id: e.agentPresence.agent.keycloakUser.id, firstName: e.agentPresence.agent.keycloakUser.firstName, agentData: e.agentPresence }, location.origin);

//         }
//     }
//     //login
//     else if ('keycloak_User' in e) {
//         let event = "Agent_login";
//         console.log("sending post event==>", { event: event, id: e.keycloak_User.id, firstName: e.keycloak_User.firstName, agentData: e })
//         window.postMessage({ event: event, id: e.keycloak_User.id, firstName: e.keycloak_User.firstName, agentData: e }, location.origin);

//     }
//     else if ((e.name == 'TASK_STATE_CHANGED') || (e.taskState)) {
//         let event = "TASK_STATE_CHANGED";
//         console.log("sending event==>", { event: event, agentData: e })
//         window.postMessage({ event: event, agentData: e }, location.origin);

//     }

//     //logout
//     else if (e.event == 'Logout') {
//         let event = "Logout_Event";
//         console.log("sending chat end event==>", { event: event, agentData: e })
//         window.postMessage({ event: event, agentData: e }, location.origin);

//     }
//     //endchat
//     else if (e.reason == "UNSUBSCRIBED") {
//         let event = "Chat_End";
//         console.log("sending chat end event==>", { event: event, agentData: e })
//         window.postMessage({ event: event, agentData: e }, location.origin);
//     }
// }
