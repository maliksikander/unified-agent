
import { EventEmitter, Injectable, Output } from "@angular/core";


@Injectable({
    providedIn: "root"
})
export class crmEventsService {
    constructor() { }


    postCRMEvent(e) { //replace post 

        // agentStateChanged
        if ('agentStateChanged' in e && 'mrdStateChanges' in e) {
            if (e.agentStateChanged) {
                let event = "Agent_State_Change";
                console.log("sending post event==>", { event: event, id: e.agentPresence.agent.keycloakUser.id, firstName: e.agentPresence.agent.keycloakUser.firstName, agentData: e.agentPresence })
                window.postMessage({ event: event, id: e.agentPresence.agent.keycloakUser.id, firstName: e.agentPresence.agent.keycloakUser.firstName, agentData: e.agentPresence }, location.origin);
            } else {
                let event = "MRD_State_Change";
                console.log("sending post event==>", { event: event, id: e.agentPresence.agent.keycloakUser.id, firstName: e.agentPresence.agent.keycloakUser.firstName, agentData: e.agentPresence })
                window.postMessage({ event: event, id: e.agentPresence.agent.keycloakUser.id, firstName: e.agentPresence.agent.keycloakUser.firstName, agentData: e.agentPresence }, location.origin);

            }
        }
        //login
        else if ('keycloak_User' in e) {
            let event = "Agent_login";
            console.log("sending post event==>", { event: event, id: e.keycloak_User.id, firstName: e.keycloak_User.firstName, agentData: e })
            window.postMessage({ event: event, id: e.keycloak_User.id, firstName: e.keycloak_User.firstName, agentData: e }, location.origin);

        }
        else if ((e.name == 'TASK_STATE_CHANGED') || (e.taskState)) {
            let event = "TASK_STATE_CHANGED";
            console.log("sending event==>", { event: event, agentData: e })
            window.postMessage({ event: event, agentData: e }, location.origin);

        }

        //logout
        else if (e.event == 'Logout') {
            let event = "Logout_Event";
            console.log("sending chat end event==>", { event: event, agentData: e })
            window.postMessage({ event: event, agentData: e }, location.origin);

        }
        //endchat
        else if (e.reason =="UNSUBSCRIBED") {
            let event = "Chat_End";
            console.log("sending chat end event==>", { event: event, agentData: e })
            window.postMessage({ event: event, agentData: e }, location.origin);
        }
    }

    chatSwitching(e, e1) {
        if (e) {
            let obj = {
                event: "Chat_Switching_Event",
                agentData: {
                    currentCustomer: {
                        conversationId: e.conversationId,
                        customer: e.customer
                    },
                    previousCustomer: {
                        conversationId: e1.conversationId,
                        customer: e1.customer
                    }
                }
            };
            console.log("sending event==>", obj)
            window.postMessage(obj, location.origin);
        }

// postMessage(event,id,name,obj){
// let obj={
//     event,
//     agentData:obj,

// }
// obj["id"]="686567"
//event.data.header["scheduledStatus"] = status;
//     window.postMessage(obj, location.origin);

// }


        // agentStateChanged(e){
        //     //&& e.mrdStateChanges.length === 0

        //     if('agentStateChanged' in e && 'mrdStateChanges' in e ){
        //         console.log("SAAANNNA")
        //         let obj = {
        //             event: "Agent_State_Change_Event",
        //             id : e.agentPresence.agent.keycloakUser.id,
        //             firstName:e.agentPresence.agent.keycloakUser.firstName,
        //             agentData: e.agentPresence
        //           };
        //           console.log("sending post event==>",obj)
        //           window.postMessage(obj, location.origin);
        //     }else if('agentStateChanged' in e && 'mrdStateChanges' in e ){
        //         //&& e.mrdStateChanges.length !== 0
        //         let obj = {
        //             event: "MRD_State_Change_Event",
        //             id : e.agentPresence.agent.keycloakUser.id,
        //             firstName:e.agentPresence.agent.keycloakUser.firstName,
        //             agentData: e.agentPresence
        //           };
        //           console.log("sending post event==>",obj)
        //           window.postMessage(obj, location.origin);
        //     }

        // }
        // taskStateChanged(e){
        //     if(e.name == 'TASK_STATE_CHANGED'){
        //         let obj = {
        //             event: "Task_State_Change_Event",
        //             //id:e.id,
        //             //firstName:e.agent.keycloakUser.firstName,
        //             agentData: e
        //           };
        //           console.log("sending event==>",obj)
        //           window.postMessage(obj, location.origin);
        //     }

        // }
        // chatSwitching(e,e1){
        //     if(e){
        //         let obj = {
        //             event: "Chat_Switching_Event",
        //             agentData: {
        //                 currentCustomer:{
        //                     conversationId : e.conversationId,
        //                     customer : e.customer
        //                 },
        //                 previousCustomer:{
        //                     conversationId : e1.conversationId,
        //                     customer : e1.customer
        //                 }
        //             }
        //           };
        //           console.log("sending event==>",obj)
        //           window.postMessage(obj,location.origin);
        //     }

        // }
        // login(e){
        //     if(e){
        //         let obj = {
        //             event: "Login_Event",
        //             //id:e.id,
        //             //firstName:e.agent.keycloakUser.firstName,
        //             id: e.keycloak_User.id,
        //             firstName:e.keycloak_User.firstName,
        //             agentData: {
        //                 keycloak_User: e.keycloak_User
        //             }
        //           };
        //           console.log("sending event==>",obj)
        //           console.log("location",location.origin)
        //           window.postMessage(obj, location.origin);
        //     }

        // }
        // logout(e){}
    }
}