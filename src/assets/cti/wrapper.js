var CIMCallback = {};
var dialogsIdArray = [];
var callsResumedArray = [];

$(document).ready(function (){
    var logoutFlag = localStorage.getItem("logoutFlag");
    if (logoutFlag == "false"){
        var parameter = localStorage.getItem("wrapperClientCallback");
        CIMCallback.callbackFunction = window[parameter];
        dialogsIdArray = JSON.parse(localStorage.getItem("dialogsIdArray"));
        callsResumedArray = JSON.parse(localStorage.getItem("callsResumedArray"));
    }
});

var wrapperCallbackFunction = function (event) {
    console.log(event);
    //CIMCallbackFunction(event);
    if(event.response.dialog && event.response.dialog.id)
        event = wrapper_processDialog(event);
    let shouldClearDialogsArray = wrapper_checkIfShouldClearDialogsArray(event);
    if(shouldClearDialogsArray)
        wrapper_clearDialogsArray();
    CIMCallback.callbackFunction(event)
    //console.log(CIMCallback.callbackFunction)
}

function wrapper_checkIfShouldClearDialogsArray(event){
    if((event.event == "agentState" && event.response.state == "READY") || (event.event == "agentState" && event.response.state == "LOGOUT") || (event.event == "dialogState" && event.response.dialog == null))
        return 1;
    return 0;
}

function storeCallback(param){
    console.log(param);
    CIMCallback.callbackFunction = param.parameter.callbackFunction;
    localStorage.setItem("wrapperClientCallback", CIMCallback.callbackFunction.name);
}

function executeCommands(commandRequest) {
    switch (commandRequest.action) {
        case "registerCallback":
            console.log(commandRequest);
            storeCallback(commandRequest);
        case "login":
            commandRequest.parameter.clientCallbackFunction = wrapperCallbackFunction;
            login(commandRequest);
            break;
        case "getState":
            getState();
            break;
        case "getNotReadyLogoutReasons":
            getNotReadyLogoutReasons();
            break;
        case "makeNotReadyWithReason":
            makeNotReady(commandRequest);
            break;
        case "makeReady":
            makeReady(commandRequest);
            break;
        case "makeCall":
            makeCall(commandRequest);
            break;
        case "answerCall":
            dialogAction(commandRequest);
            break;
        case "releaseCall":
            dialogAction(commandRequest);
            break;
        case "holdCall":
            dialogAction(commandRequest);
            break;
        case "retrieveCall":
            dialogAction(commandRequest);
            break;
        case "acceptCall":
            dialogAction(commandRequest);
            break;
        case "closeCall":
            dialogAction(commandRequest);
            break;
        case "rejectCall":
            dialogAction(commandRequest);
            break;
        case "SST":
            transferCall(commandRequest);
            break;
        case "makeConsult":
            makeConsult(commandRequest);
            break;
        case "consultTransfer":
            transferCall(commandRequest);
            break;
        case "conferenceCall":
            dialogAction(commandRequest);
            break;
        case "getDialog":
            getDialogs(commandRequest);
            break;
        case "logout":
            logout(commandRequest);
            break;
        case "getWrapUpReasons":
            getWrapUpReasons(commandRequest);
            break;
        case "updateCallVariableData":
            updateCallVariableData(commandRequest);
            break;
        case "updateWrapupData":
            updateWrapupData(commandRequest);
            break;
        case "makeWorkReady":
            makeWorkReady(commandRequest);
            break;
        case "subscribeTeam":
            subscribeToTeam(commandRequest);
            break;
        case "unsubscribeTeam":
            unsubscribeToTeam(commandRequest);
            break;
        case "getTeamUsers":
            getTeamUsers(commandRequest);
            break;
        case "silentMonitor":
            silentMonitor(commandRequest);
            break;
        case "bargeIn":
            bargeIn(commandRequest);
            break;
        case "dropParticipant":
            dropParticipant(commandRequest);
            break;
        case "getQueues":
            getUserQueues(commandRequest);
            if((config.getQueuesDelay > 0 && config.getQueuesDelay < 10000) && queueInterval == null){
                queueSubscribed = true;
                queueInterval = setInterval(() => {
                    getUserQueues(commandRequest);
                }, config.getQueuesDelay * 1000);
            }
            break;
        case "getUserPhoneBook":
            getUserPhoneBook(commandRequest);
            break;
        case "getSSOToken":
            getSSOToken(commandRequest);
            break;
        case "reclassifyDialog":
            reclassifyDialog(commandRequest);
            break;
        case "scheduleCallback":
            scheduleCallbackDialog(commandRequest);
            break;
    }
}

function wrapper_getCurrentCallVariableValue(callObj, configCallVariable)
{
    try{
        for(var i = 0; i < callObj.callVariables.CallVariable.length; i++)
        {
            if(callObj.callVariables.CallVariable[i].name == configCallVariable)
                return callObj.callVariables.CallVariable[i].value;
        }
        return "";
    }
    catch(exception)
    {
        console.error(exception);
    }
}
function wrapper_updateCallvariablesCommand(callEvent)
{
    var ani = callEvent.ani;
    var dn = callEvent.dialedNumber ? callEvent.dialedNumber : "";
    if(dn)
        ani = ani + ":" + dn;
    var currentCallVariableValue = wrapper_getCurrentCallVariableValue(callEvent, config.callVariable);
    if(currentCallVariableValue == "")
    {
        var commandParams =
        {
            "action": "updateCallVariableData",
            "parameter" :
            {
                "dialogId": callEvent.id,
                "callVariables":
                {
                    "callVariable":
                    [
                        {
                            "name": config.callVariable,
                            "value": ani
                        }
                    ]
                }
            }
        }
        executeCommands(commandParams);
    }
}

function wrapper_getCurrentParticipantState(participants) {
    var length;
    if (participants.Participant)
        length = participants.Participant.length;

    if (length) {
        for (var i = 0; i < length; i++) {
            if (participants.Participant[i].mediaAddress == params.extension)
                return participants.Participant[i].state;
        }
    }
    else {
        if (participants.Participant.mediaAddress == params.extension)
            return participants.Participant.state;
    }
    return null;
}

function wrapper_processDialog(event){
    try{
        //dialogResponseEvent = checkIfIgnoreable(dialogResponseEvent, loggedParticipantState);
        // if(loggedParticipantState == "DROPPED" || loggedParticipantState == "FAILED")
        //     dialogResponseEvent.response.dialog.dialogEndingReason = getDialogEndingReason(dialog.callType);
        let isCallExists = wrapper_checkIfCallResumedExist(event.response.dialog.id);
        if(isCallExists == 0)
            wrapper_addCallResumed(event.response.dialog.id);
        let callResumed = wrapper_findResumedCallById(event.response.dialog.id);
        let loggedParticipantState = wrapper_getCurrentParticipantState(event.response.dialog.participants);
        event.response.dialog.isCallAlreadyActive = wrapper_manageisCallResumedProperty(loggedParticipantState, callResumed);
        event.response.dialog.participants = wrapper_parseDialogParticipants(event.response.dialog.participants);
        console.log("Wrapper processing");

        if(event.response.dialog.state == "ALERTING" || event.response.dialog.state == "ACTIVE" || (event.response.dialog.state == "INITIATED" && event.event != "consultCall"))
            wrapper_storeDialog(event);
        if(event.response.dialog.state == "ACTIVE" && loggedParticipantState == "ACTIVE")
            wrapper_updateCallvariablesCommand(event.response.dialog);
        let wrapper_callExist = wrapper_checkIfCallExist(event.response.dialog.id);

        if(event.response.dialog.state == "DROPPED" || event.response.dialog.state == "FAILED"){
            wrapper_removeDialog(event.response.dialog.id);
            wrapper_removeResumedCall(event.response.dialog.id);
        }

        var currentCallVariableValue = wrapper_getCurrentCallVariableValue(event.response.dialog, config.callVariable);
        if(currentCallVariableValue == ""){
            event.response.dialog.customerNumber = event.response.dialog.ani;
            event.response.dialog.primaryDN = event.response.dialog.dialedNumber;
        }
        else{
            event.response.dialog.customerNumber = currentCallVariableValue.split(":")[0];;
            let primaryDN = currentCallVariableValue.split(":")[1];
            if(primaryDN)
                event.response.dialog.primaryDN = primaryDN;
            else
                event.response.dialog.primaryDN = event.response.dialog.dialedNumber;
        }
        if(wrapper_callExist)
            return event;
    }catch(err){
        console.error(err);
    }

}

function wrapper_clearDialogsArray(){
    dialogsIdArray = [];
    callsResumedArray = [];
    localStorage.setItem("dialogsIdArray", JSON.stringify(dialogsIdArray));
    localStorage.setItem("callsResumedArray", JSON.stringify(callsResumedArray));
}

function wrapper_removeDialog(callid){
    const index = dialogsIdArray.indexOf(callid);
    if (index > -1) {
        dialogsIdArray.splice(index, 1);
        localStorage.setItem("dialogsIdArray", JSON.stringify(dialogsIdArray));
        console.log("dialogsIdArray => " , dialogsIdArray)
    }
}

function wrapper_removeResumedCall(id) {
    try{
        var i = 0;
        var callsInList = callsResumedArray.length;
        for (var i = 0; i < callsResumedArray.length; i++) {
            if (callsResumedArray[i].id == id) {
                callsResumedArray.splice(i, 1);
                if (callsInList == 1) {
                    callsResumedArray = [];
                }
                localStorage.setItem("callsResumedArray", JSON.stringify(callsResumedArray));
            }
        }
    }catch(err){
        console.error(err);
    }
}

function wrapper_storeDialog(event){
    var iscallIdExists = wrapper_checkIfCallExist(event.response.dialog.id);
    if(!iscallIdExists){
        dialogsIdArray.push(event.response.dialog.id);
        localStorage.setItem("dialogsIdArray", JSON.stringify(dialogsIdArray));
        console.log("dialogsIdArray => " , dialogsIdArray)
    }
}

function wrapper_addCallResumed(id){
    let call = {id: id, isCallFirstActive: 0, isCallAlreadyActive: 0};
    callsResumedArray.push(call);
    localStorage.setItem("callsResumedArray", JSON.stringify(callsResumedArray));
}

function wrapper_manageisCallResumedProperty(loggedParticipantState, callResumedObj){

    if(loggedParticipantState == "ACTIVE" && callResumedObj.isCallFirstActive == 1){
        callResumedObj.isCallAlreadyActive = 1;
    }

    if(callResumedObj.isCallFirstActive == 0 && loggedParticipantState == "ACTIVE"){
        callResumedObj.isCallFirstActive = 1;
    }
    localStorage.setItem("callsResumedArray", JSON.stringify(callsResumedArray));
    return callResumedObj.isCallAlreadyActive;
}

function wrapper_findResumedCallById(callid){
    var i = 0;
    if(callsResumedArray){
        for (i; i < callsResumedArray.length; i++) {
            if (callsResumedArray[i].id && callsResumedArray[i].id == callid) {
                return callsResumedArray[i];
            }
        }
    }
    return null;
}

function wrapper_checkIfCallResumedExist(callid) {
    if(callsResumedArray){
        for (let i = 0; i < callsResumedArray.length; i++) {
            if (callsResumedArray[i] && callsResumedArray[i].id == callid) {
                return 1;
            }
        }
    }
    return 0;
}
function wrapper_checkIfCallExist(callid) {
    if(dialogsIdArray){
        for (let i = 0; i < dialogsIdArray.length; i++) {
            if (dialogsIdArray[i] && dialogsIdArray[i] == callid) {
                return 1;
            }
        }
    }
    return 0;
}

function wrapper_parseDialogParticipants(participants){
    participants = participants.Participant;
    let participantArray = [];
    if(participants.length){
        for(participant of participants){
            participantArray.push(participant);
        }
    }
    else{
        participantArray.push(participants);
    }
    return participantArray;
}

function checkIfIgnoreable(dialogResponseEvent, loggedParticipantState){
    return;
}

// function getDialogEndingReason(callType){
//     let reason = null;
//     try{
//         switch (callType) {
//             case callTypes.directType:
//             case callTypes.inboundTypeCCE:
//             case callTypes.inboundTypeCCX:
//                 reason = 'Inbound';
//                 break;
//             case callTypes.outboundType:
//             case callTypes.outboundType2:
//                 reason = 'Outbound';
//                 break;
//             case callTypes.consultType:
//                 reason = 'Consult';
//                 break;
//             case callTypes.directTransferTypeCCE:
//             case callTypes.directTransferTypeCCX:
//             case callTypes.consultTransferTypeCCE:
//             case callTypes.consultTransferTypeCCX:
//                 if(finesseFlavor == "UCCE" && callType == callTypes.directTransferTypeCCE)
//                     reason = 'Direct Transfer';
//                 else if(finesseFlavor == "UCCX" && callType == callTypes.directTransferTypeCCX)
//                     reason = 'Direct Transfer';
//                 else if(finesseFlavor == "UCCE" && callType == callTypes.consultTransferTypeCCE)
//                     reason = 'Consult Transfer';
//                 else if(finesseFlavor == "UCCX" && callType == callTypes.consultTransferTypeCCX)
//                     reason = 'Consult Transfer';
//                 break;
//             case callTypes.conferenceType:
//                 reason = 'Conference';
//                 break;
//             case callTypes.outboundCampaignType:
//             case callTypes.outboundCampaignCallbackCCEType1:
//             case callTypes.outboundCampaignCallbackCCEType2:
//             case callTypes.outboundPreviewCampaignTypeCCX:
//             case callTypes.outboundPreviewCampaignTypeCCE:
//             case callTypes.outboundPreviewCampaignCallbackCCEType1:
//             case callTypes.outboundPreviewCampaignCallbackCCEType2:
//                 reason = 'Outbound Campaign';
//                 break;
//             case callTypes.silentMonitorType:
//                 reason = 'Silent Monitor';
//                 break;
//             case callTypes.bargeInTypeCCX:
//             case callTypes.bargeInTypeCCE:
//                 reason = 'Barge In';
//                 break;
//         }
//         return reason;
//     }catch(err){
//         console.error(err);
//     }
// }



// async function loadWrapper() {
//     let scriptPromise = new Promise((resolve, reject) => {
//         console.log('resolving promise...');
//         this.loadScript();
//     });
//     scriptPromise.then(console.log("Script loaded")).catch("Script loading failed")
// }

// function loadScript() {
//     console.log('preparing to load...')
//     let node = document.createElement('script');
//     node.src = config.wrapperFile;
//     node.type = 'text/javascript';
//     node.async = true;
//     node.charset = 'utf-8';
//     document.getElementsByTagName('head')[0].appendChild(node);
// }
