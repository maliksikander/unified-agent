//Dummy Event Listener for Listening Agent Desk Events

window.addEventListener("message", function (e) {

    try {
        if (e.origin !== location.origin)
            return;
       console.log("Received a message from the same app:", e.data);
    }
    catch (e) {
        console.log("Can't received a message from the  app", e)
    }
});


function changeMrdPostMessage(name, state) {

    var agentId = localStorage.getItem("agentId");
    var mrdID = "6305de07166ba1099d11d8e6";
    try {
        var obj = {
            event: "Connector_Action", agentData: {
                agentId: agentId,
                action: "agentMRDState",
                state: state,
                mrdId: mrdID
            }
        }
        window.postMessage(obj, location.origin);
        console.log("postMessasge sent crm-service", obj);
    }
    catch {
        console.log("Can't sent postMessasge from crm-service", obj);

    }
}

function logoutPostMessage() {
    var agentId = localStorage.getItem("agentId");

    try {
        var obj = {
            event: "Connector_Action", agentData: {
                agentId: agentId,
                action: "agentLogout",
            }
        }
        window.postMessage(obj, location.origin);
        console.log("postMessasge sent crm-service", obj);
    }
    catch {
        console.log("Can't sent postMessasge from crm-service", obj);

    }
}



