

// if (window.addEventListener) {

//     window.addEventListener("Listening postMessageEvent", function (e) {
//         try {
//           if(e.origin !== '*')
//           return;
//           console.log("listening",e)
//         } catch (e) {
//             console.log(e);
//         }
//     }, false);


// }

window.addEventListener("message", function(e) {
    // Check if the message is from the same origin (optional)
    
        // Handle the message her
        console.log("Received a message from the same app:", e.data);
        try {
            
            
            // if (e.data.event) {
            //     changeMrdPostMessage(e.data.agentData.name, e.data.agentData.state);
            // }else{
            //     logoutPostMessage(); 
            // }

        }
        catch{}
});


function changeMrdPostMessage(name, state) {
    var agentId = localStorage.getItem("agentId");
    var mrdID = "6305de07166ba1099d11d8e6";

    var obj = {
        event: "Connector_Action", agentData: {
            agentId: agentId,
            action: "agentMRDState",
            state: state,
            mrdId: mrdID
        }
    }
    window.postMessage(obj,location.origin);
    console.log("postMessasge sent crm-service", obj);
}

function logoutPostMessage() {
    var agentId = localStorage.getItem("agentId");
    

    var obj = {
        event: "Connector_Action", agentData: {
            agentId: agentId,
            action: "agentLogout",
        }
    }
    window.postMessage(obj, location.origin);
    console.log("postMessasge sent crm-service", obj);
}




// function emitAgentStateChange(e) {
//     try {
//       if (e.data.agentData.agentId) {
//         this._socketService.emit("changeAgentState", {
//           agentId: e.data.agentData.agentId,
//           action: "agentState",
//           state: { name: e.data.agentData.state, reasonCode: null }
//         });
//       }
//     } catch (e) {
//       console.error("[Error] pocAgentStateChange ==>", e);
//     }
//   }
//  function emitMRDStateChange(e){
//     try {
//       if (e.data.agentData.agentId) {
//         this._socketService.emit("changeAgentState", {
//           agentId: e.data.agentData.agentId,
//           action: "agentMRDState",
//           state: e.data.agentData.state,
//           mrdId: e.data.agentData.mrdId
//         });
//       }
//     } catch (e) {
//       console.error("[Error] pocMRDStateChange ==>", e);
//     }
//   }
//   function emitAgentLogout(e){
//     try {
//       if (e.data.agentData.agentId) {
//         this._socketService.emit("agentLogout", {
//           agentId: e.data.agentData.agentId,
//           action: "agentLogout",
//           state: e.data.agentData.state,
//           mrdId: e.data.agentData.mrdId
//         });
//       }
//     } catch (e) {
//       console.error("[Error] agentLogout ==>", e);
//     }
//   }