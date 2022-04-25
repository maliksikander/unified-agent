
var params = {};
var callbacks = {};
var notReadyReasons = [];
var _jwClient;
var finesseFlavor = config.finesseFlavor;

$(document).ready(function () {
    if (window.jabberwerx) {
        _jwClient = new jabberwerx.Client("cisco");
    }

    //Refresh case
    // var logoutFlag = sessionStorage.getItem("logoutFlag");
    // if (logoutFlag == "false" && sessionStorage.getItem("loginParameters")) {
    //     var parameters = JSON.parse(sessionStorage.getItem("loginParameters"));
    //     loginRefreshCase(parameters);
    // }
});

function executeCommands(commandRequest) {
    switch (commandRequest.action) {
        case "login":
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
            makeReady();
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
    }
}

var eventCallback = function (data) {
    var event = _eventHandler(data);
    callbacks.clientCallbackFunction(event);
    return;
}

var apiResponseCallback = function (data) {
    var response = apiResponseHandler(data);
    callbacks.clientCallbackFunction(response);
    return;
}

function initialize(parameters) {
    try {
        var authcode = parameters.parameter.loginId + ":" + parameters.parameter.password;
        const encodedData = window.btoa(authcode);

        params =
        {
            encodedData: encodedData,
            domain: config.domain,
            boshurl: config.boshUrl,
            extension: parameters.parameter.extension,
            username: parameters.parameter.loginId
        }
        callbacks = {
            "apiCallbackFunction": apiResponseCallback,
            "eventCallbackFunction": eventCallback,
            "clientCallbackFunction": parameters.parameter.clientCallbackFunction
        }
        return params;
    }
    catch (err) {
        console.error(err.message);
    }
}

function loginRefreshCase(parameters) {
   parameters.parameter.clientCallback = window[parameters.parameter.clientCallback];
   executeCommands(parameters);
}

function login(parameters) {
    initialize(parameters);
    //error handling
    if (!params.username) {
        var error = {
            "event": "Error",
            "response": {
                "loginId": params.username,
                "type": "subscriptionFailed",
                "description": "Invalid credentials supplied for agent login",
            }
        }
        callbacks.eventCallbackFunction(error);
    }

    if (window.jabberwerx) {
        var jid = params.username + "@" + params.domain,
            _jwClient = new jabberwerx.Client("cisco");

        jwArgs =
        {
            httpBindingURL: params.boshurl,
            httpBindingURL_secondary: '',
            serviceDiscoveryEnabled: true,
            errorCallback: onClientError,
            successCallback: ()=> {
                // var loginParameters =
                // {
                //     "action": "login",
                //     "parameter":
                //     {
                //         "loginId": params.username,
                //         "password": parameters.parameter.password,
                //         "extension": params.extension,
                //         "clientCallbackFunction": clientCallback.name
                //     }
                // }
                // sessionStorage.setItem("loginParameters", JSON.stringify(loginParameters));
                loginUser();
                //callback("XMPP Connection Established");
            }
        };
        jabberwerx._config.unsecureAllowed = true;
        _jwClient.event("messageReceived").bindWhen("event[xmlns='http://jabber.org/protocol/pubsub#event'] items item notification", callbacks.eventCallbackFunction);
        _jwClient.event("clientStatusChanged").bind(function (evt) {
            if (evt.data.next == jabberwerx.Client.status_connected) {
                var xmpppEvent =
                {
                    "event": "xmppEvent",
                    "response": {
                        "loginId": params.username,
                        "type": "xmppStatus",
                        "description": "Connection Established, XMPP Status is Connected",
                    }
                }
                callbacks.eventCallbackFunction(xmpppEvent);
            }
            else if (evt.data.next == jabberwerx.Client.status_disconnected) {
                var xmpppEvent =
                {
                    "event": "xmppEvent",
                    "response": {
                        "loginId": params.username,
                        "type": "xmppStatus",
                        "description": "XMPP Status is Disconnected!",
                    }
                }
                callbacks.eventCallbackFunction(xmpppEvent);
            }
        });

        _jwClient.connect(jid, parameters.parameter.password, jwArgs);
    }
    else {
        var error = {
            "event": "Error",
            "response": {
                "loginId": params.username,
                "type": "notFound",
                "description": "The request data is not found",
            }
        }
        callbacks.eventCallbackFunction(error);
    }
}

function _eventHandler(data) {
    if (data.selected && data.selected.firstChild.data) {
        data = data.selected.firstChild.data;
    }

    if (!data.event) {
        var xmlObj = $.parseXML(data);
        var jsonObj = xml2json(xmlObj);

        //try
        {
            var parsedEvent = parseEvent(jsonObj);
            return parsedEvent;
        }
        //catch(err)
        {
            console.error(err.message);
        }
    }
    if (data.event && (data.event == "Error" || data.event == "xmppEvent")) {
        return data;
    }
}


function parseEvent(event) {
    var parsedEvent;
    if (event.User || event.Dialogs != undefined) {
        if (event.User)
            parsedEvent = parseUserEvent(event.User);
        else if (event.Dialogs)
            parsedEvent = parseDialogEvent(event.Dialogs.Dialog);
    }
    else if (event.Update.data.user) {
        if (event.Update.data.user)
            parsedEvent = parseUserEvent(event.Update.data.user);
    }
    else if (event.Update.data.dialogs || event.Update.data.dialog) {
        if (event.Update.data.dialogs)
            parsedEvent = parseDialogEvent(event.Update.data.dialogs.Dialog);
        else if (event.Update.data.dialog)
            parsedEvent = parseDialogEvent(event.Update.data.dialog);
    }
    else if (event.Update.data.apiErrors || event.Update.data.apiError) {
        if (event.Update.data.apiErrors) {
            parsedEvent = parseErrorEvent(event.Update.data.apiErrors.apiError);
        }
        else
            parsedEvent = parseErrorEvent(event.Update.data.apiError);
    }
    else if (event.Update.data.systemInfo) {
        parsedEvent = parseSystemInfo(event.Update.data.systemInfo);
    }
    if (parsedEvent == undefined) {
        return null;
    }
    return parsedEvent;
}

function parseUserEvent(userEvent) {
    var response = {
        loginId: userEvent.loginId,
        extension: userEvent.extension,
        firstName: userEvent.firstName,
        lastName: userEvent.lastName,
        pendingState: userEvent.pendingState,
        reasonCode: userEvent.reasonCode,
        roles: userEvent.roles,
        state: userEvent.state,
        stateChangeTime: userEvent.stateChangeTime,
        teamId: userEvent.teamId,
        teamName: userEvent.teamName,
        wrapUpOnIncoming: userEvent.settings.wrapUpOnIncoming,
    }
    var responseObject =
    {
        "event": "agentState",
        response,
    }
    if (userEvent.state == "LOGOUT") {
      //  sessionStorage.setItem("logoutFlag", true);
        _jwClient.disconnect();
    }
    else
      //  sessionStorage.setItem("logoutFlag", false);

    return responseObject;
}

function parseDialogEvent(dialogEvent) {
    if (dialogEvent.id) {
        var secondaryId = null;
        if (dialogEvent.secondaryId) {
            secondaryId = dialogEvent.secondaryId;
        }

        var wrapUpReason = null;
        if (dialogEvent.mediaProperties.wrapUpReason) {
            wrapUpReason = dialogEvent.mediaProperties.wrapUpReason;
        }

        var dialog =
        {
            id: dialogEvent.id,
            callType: dialogEvent.mediaProperties.callType,
            fromAddress: dialogEvent.fromAddress,
            dialedNumber: dialogEvent.mediaProperties.dialedNumber,
            dnis: dialogEvent.mediaProperties.DNIS,
            ani: null,
            state: dialogEvent.state,
            wrapUpReason: wrapUpReason,
            associatedDialogUri: getDigits(dialogEvent.associatedDialogUri),
            secondaryId: secondaryId,
            participants: dialogEvent.participants,
            callVariables: dialogEvent.mediaProperties.callvariables,
        }
        var responseObject = parseDialogEventType(dialog);
        return responseObject;
    }
    else
        return null;
}

function getDigits(text) {
    if (text) {
        return text.replace(/\D/g, "");
    }
    return null;
}

function parseDialogEventType(dialog) {
    var callType = dialog.callType;
    var dialogEvent;
    switch (callType) {
        case callTypes.directType:
            dialogEvent = processDirectCall(dialog);
            break;
        case callTypes.inboundTypeCCE:
        case callTypes.inboundTypeCCX:
            dialogEvent = processInboundCall(dialog);
            break;
        case callTypes.outboundType:
        case callTypes.outboundType2:
            if (finesseFlavor == "UCCE" && dialog.associatedDialogUri)
                dialogEvent = processConsultCall(dialog);
            else
                dialogEvent = processOutboundCall(dialog);
            break;
        case callTypes.consultType:
            dialogEvent = processConsultCall(dialog);
            break;
        case callTypes.directTransferTypeCCE:
        case callTypes.directTransferTypeCCX:
            dialogEvent = processDirectTransferCall(dialog);
            break;
        case callTypes.consultTransferTypeCCE:
        case callTypes.consultTransferTypeCCX:
            dialogEvent = processConsultTransferCall(dialog);
            break;
        case callTypes.conferenceType:
            dialogEvent = processConferenceCall(dialog);
            break;
    }

    delete dialogEvent.response.dialog.fromAddress;
    delete dialogEvent.response.dialog.dialedNumber;
    delete dialogEvent.response.dialog.dnis;
    return dialogEvent;
}

function processConferenceCall(dialog) {
    dialog.ani = getCallVariableValue(dialog, config.callVariable);

    if (dialog.state == "ALERTING") {
        eventType = "newInboundCall";
    }
    else
        eventType = "dialogState";

    var response =
    {
        "event": eventType,
        "response":
        {
            "loginId": params.username,
            dialog,
        }
    }
    return response;
}

function processConsultTransferCall(dialog) {
    dialog.ani = getCustomer(dialog.participants);

    if (dialog.state == "ALERTING") {
        eventType = "newInboundCall";
    }
    else
        eventType = "dialogState";

    var response =
    {
        "event": eventType,
        "response":
        {
            "loginId": params.username,
            dialog,
        }
    }
    return response;
}

function processDirectTransferCall(dialog) {
    dialog.ani = getCallVariableValue(dialog, config.callVariable);

    if (dialog.state == "ALERTING") {
        eventType = "newInboundCall";
    }
    else
        eventType = "dialogState";

    var response =
    {
        "event": eventType,
        "response":
        {
            "loginId": params.username,
            dialog,
        }
    }
    return response;
}

function getCallVariableValue(dialog, callVariableName) {
    for (var i = 0; i < dialog.callVariables.CallVariable.length; i++) {
        if (dialog.callVariables.CallVariable[i].name == callVariableName) {
            return dialog.callVariables.CallVariable[i].value;
        }
    }
    return null;
}

function processConsultCall(dialog) {
    if (finesseFlavor == "UCCE") {
        dialog.ani = setAniForConsultCCE(dialog);
    }
    else
        dialog.ani = setAniForConsultCCX(dialog);

    var response =
    {
        "event": "consultCall",
        "response":
        {
            "loginId": params.username,
            dialog,
        }
    }
    return response;
}

function setAniForConsultCCX(dialog) {
    if (dialog.callType == callTypes.outboundType || dialog.callType == callTypes.outboundType2) {
        return getCustomer(dialog.participants);
    }
    else {
        if (dialog.fromAddress != params.extension) {
            return dialog.fromAddress;
        }
        else {
            return dialog.dnis;
        }
    }
}

function setAniForConsultCCE(dialog) {
    if (dialog.callType == callTypes.outboundType || dialog.callType == callTypes.outboundType2) {
        return getCustomer(dialog.participants);
    }
    else {
        if (dialog.fromAddress != params.extension) {
            return dialog.fromAddress;
        }
        else {
            var customer = getCustomer(dialog.participants);
            if (customer) {
                return customer;
            }
            else {
                return dialog.dnis;
            }
        }
    }
}

function getCustomer(participants) {

    var length;
    if (participants.Participant)
        length = participants.Participant.length;

    if (length) {
        for (var i = 0; i < length; i++) {
            if (participants.Participant[i].mediaAddressType != "AGENT_DEVICE") {
                return participants.Participant[i].mediaAddress;
            }
        }
    }
    return null;
}

function setOutboundConnectedNumberCCX(dialog) {
    if (params.extension != dialog.fromAddress) {
        return dialog.fromAddress;
    }
    else {
        if (dialog.dnis) {
            return dialog.dnis;
        }
        else {
            return dialog.dialedNumber;
        }
    }
    return null;
}

function setOutboundConnectedNumberCCE(dialog) {
    if (dialog.dialedNumber != params.extension) {
        var customer = getCustomer(dialog.participants);
        if (customer) {
            return customer;
        }
        else {
            return dialog.dialedNumber;
        }
    }
    else {
        return dialog.fromAddress;
    }
    return null;
}

function processOutboundCall(dialog) {
    if (finesseFlavor == "UCCE") {
        dialog.ani = setOutboundConnectedNumberCCE(dialog);
    }
    else
        dialog.ani = setOutboundConnectedNumberCCX(dialog);

    var eventType;
    if ((dialog.state == "INITIATING" || dialog.state == "INITIATED") && !dialog.associatedDialogUri) {
        eventType = "outboundDialing";
    }
    else {
        eventType = "dialogState";
    }

    var dialogEvent =
    {
        "event": eventType,
        "response": {
            "loginId": params.username,
            dialog,
        }
    }
    return dialogEvent;
}

function processInboundCall(dialog) {
    if (finesseFlavor == "UCCX") {
        dialog.ani = dialog.fromAddress;
    }
    else
        dialog.ani = getCustomer(dialog.participants);

    var eventType;
    if (dialog.state == "ALERTING") {
        eventType = "newInboundCall";
    }
    else
        eventType = "dialogState";

    var response =
    {
        "event": eventType,
        "response":
        {
            "loginId": params.username,
            dialog,
        }
    }
    return response;
}

function processDirectCall(dialog) {
    dialog.ani = dialog.fromAddress;

    var eventType;
    if (dialog.state == "ALERTING") {
        eventType = "newInboundCall";
    }
    else
        eventType = "dialogState";

    var response =
    {
        "event": eventType,
        "response": {
            "loginId": params.username,
            dialog,
        }
    }
    return response;
}

function parseNoDialogEvent() {
    var responseObject =
    {
        "event": "dialogState",
        "response":
        {
            "loginId": params.username,
            "dialog": null,
        }
    }
    return responseObject;
}

function parseErrorEvent(errorEvent) {
    if (typeof errorEvent.errorType == "string") {
        errorEvent.errorType = formatCamelCase(errorEvent.errorType);
    }

    makeEventErrorsReadable(errorEvent);

    var response =
    {
        "loginId": params.username,
        "description": errorEvent.errorMessage,
        "type": errorEvent.errorType,
    }

    var errorJson = {
        "event": "Error",
        response
    }
    return errorJson;
}

function makeEventErrorsReadable(errorEvent) {
    switch (errorEvent.errorMessage) {
        case "CF_INVALID_OBJECT_STATE":
            errorEvent.errorMessage = "The object is in the incorrect state for the request, Send the request again.";
            return errorEvent;
        case "CF_GENERIC_UNSPECIFIED_REJECTION":
            errorEvent.errorType = "invalidDevice";
            return errorEvent;
    }
}

function parseSystemInfo(systemInfoEvent) {
    var responseObject =
    {
        event: "systemInfo",
        systemInfoEvent
    }
    return responseObject;
}

function onClientError(rsp) {
    var stringdoc = new XMLSerializer().serializeToString(rsp);
    var contains_error_authentication = stringdoc.includes("not-authorized");
    var contains_error_unreachable = stringdoc.includes("service-unavailable");
    var errorString, errorType;

    if (contains_error_authentication) {
        errorType = "subscriptionFailed";
        errorString = "Invalid credentials supplied for agent login";
    }
    else if (contains_error_unreachable) {
        errorType = "networkIssue"
        errorString = "Service is Unreachable";
    }
    else {
        errorType = "generalError"
        errorString = "XMPP Connection Failed";
    }

    var errorResponse = {
        "event": "Error",
        "response": {
            "loginId": params.username,
            "type": errorType,
            "description": errorString,
        }
    }
    callbacks.eventCallbackFunction(errorResponse);
}

function print2Console(type, data) {
    console.log(typeof (data) + ": ");
    console.log(data);
}

function xml2json(xml) {
    try {
        var obj = {};
        if (xml.children.length > 0) {
            for (var i = 0; i < xml.children.length; i++) {
                var item = xml.children.item(i);
                var nodeName = item.nodeName;

                if (typeof (obj[nodeName]) == "undefined") {
                    obj[nodeName] = xml2json(item);
                }
                else {
                    if (typeof (obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];

                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xml2json(item));
                }
            }
        }
        else {
            obj = xml.textContent;
        }
        return obj;
    }
    catch (e) {
        console.error(e.message);
        return null;
    }
}


function apiResponseHandler(data) {
    if (data.selected && data.selected.firstChild.data) {
        data = data.selected.firstChild.data;
    }

    if (!data.event) {
        var xmlObj = $.parseXML(data);
        var jsonObj = xml2json(xmlObj);
        try {
            var parsedResponse = parseApiResponse(jsonObj);
            return parsedResponse;
        }
        catch (err) {
            console.error(err.message)
        }
    }
    else if (data.event && data.event == "Error") {
        return data;
    }
}

function parseApiResponse(response) {
    var parsedResponse = [];

    if (response.User) {
        parsedResponse[0] = parseUserEvent(response.User);
    }
    else if (response.Dialogs) {
        if (response.Dialogs.Dialog.length) {
            for (var i = 0; i < response.Dialogs.Dialog.length; i++) {
                parsedResponse[i] = parseDialogEvent(response.Dialogs.Dialog[i]);
            }
        }
        else {
            parsedResponse[0] = parseDialogEvent(response.Dialogs.Dialog);
        }
    }
    else if (response.Dialogs != undefined && !response.Dialogs) {
        parsedResponse[0] = parseNoDialogEvent();
    }
    else if (response.ReasonCodes) {
        parsedResponse[0] = parseReasonCodes(response.ReasonCodes.ReasonCode);
    }
    else if (response.WrapUpReasons) {
        parsedResponse[0] = parseWrapUpReasonCodes(response.WrapUpReasons.WrapUpReason);
    }


    if (parsedResponse[0] == undefined) {
        return null;
    }

    if (parsedResponse.length == 1)
        return parsedResponse[0];
    return parsedResponse;
}

function parseCallVariables(variables) {
    var variableString = "";
    for (var i = 0; i < variables.length; i++) {
        variableString += "<CallVariable><name>" + variables[i].name + "</name><value>" + variables[i].value + "</value></CallVariable>"
    }
    return variableString;
}

function apiErrors(jqXHR, errorThrown, callback) {
    if (typeof jqXHR.status == "string") {
        jqXHR.status = formatCamelCase(jqXHR.status);
    }
    else if (typeof jqXHR.status == "number") {
        var errObj = makeApiErrorsReadable(jqXHR.status, errorThrown);
        jqXHR.status = errObj.type;
        errorThrown = errObj.description;
    }


    if (jqXHR.status == 0 && !errorThrown) {
        jqXHR.status = "generalError";
        errorThrown = "Sorry we are unable to process your request";
    }

    var response =
    {
        "loginId": params.username,
        "type": jqXHR.status,
        "description": errorThrown,
    }
    var responseObject =
    {
        "event": "Error",
        response,
    }
    console.error(responseObject);
    callback(responseObject);
}

function makeApiErrorsReadable(type, description) {
    switch (type) {
        case 400:
            return { "type": "badRequest", "description": "Bad request, some data is missing." }
        case 405:
            return { "type": "methodNotAllowed", "description": "Dialog ID is missing , can not process the request." }
        case 404:
            return { "type": "notFound", "description": "The request data is not found." }

    }
    return { "type": type, "description": description }

}

function formatCamelCase(str) {
    if (!str || str.split(" ").length > 2)
        return null;

    var firstLetter = str.substr(0, 1);
    str = firstLetter.toLowerCase() + str.substr(1);
    str = str.replace(" ", "");
    return str;
}

function makeConsult(parameters) {
    $ = jQuery.noConflict();
    var weblink = "https://" + params.domain + ":8445/finesse/api/Dialog/" + parameters.parameter.dialogId;

    $.ajax(
        {
            url: weblink,
            data: "<Dialog><toAddress>" + parameters.parameter.numberToConsult + "</toAddress><targetMediaAddress>" + params.extension + "</targetMediaAddress><requestedAction>CONSULT_CALL</requestedAction></Dialog>",
            type: 'PUT',
            dataType: "xml",
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + params.encodedData);
                request.setRequestHeader("Content-Type", "application/xml");
            },
            crossDomain: true,
            success: function (result) {
                return 202;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction);
            }
        });
}

function transferCall(parameters) {
    var transferAction;
    if (parameters.action == "SST") {
        transferAction = "TRANSFER_SST";
    }
    else
        transferAction = "TRANSFER";

    if (!parameters.parameter.numberToTransfer)
        parameters.parameter.numberToTransfer = "";

    $ = jQuery.noConflict();
    var weblink = "https://" + params.domain + ":8445/finesse/api/Dialog/" + parameters.parameter.dialogId;

    $.ajax(
        {
            url: weblink,
            data: "<Dialog><toAddress>" + parameters.parameter.numberToTransfer + "</toAddress><targetMediaAddress>" + params.extension + "</targetMediaAddress><requestedAction>" + transferAction + "</requestedAction></Dialog>",
            type: 'PUT',
            dataType: "xml",
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + params.encodedData);
                request.setRequestHeader("Content-Type", "application/xml");
            },
            crossDomain: true,
            success: function (result) {
                return 202;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction);
            }
        });
}


function updateCallVariableData(parameters) {
    var callVariables = parseCallVariables(parameters.parameter.callVariables.callVariable);
    parameters.parameter.callVariables = callVariables;

    $ = jQuery.noConflict();
    var weblink = "https://" + params.domain + ":8445/finesse/api/Dialog/" + parameters.parameter.dialogId;
    var dataString = "<Dialog><requestedAction>UPDATE_CALL_DATA</requestedAction><mediaProperties><callvariables>" + JSON.stringify(parameters.parameter.callVariables) + "</callvariables></mediaProperties></Dialog>";

    $.ajax(
        {
            url: weblink,
            data: dataString,
            type: 'PUT',
            dataType: "xml",
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + params.encodedData);
                request.setRequestHeader("Content-Type", "application/xml");
            },
            crossDomain: true,
            success: function (result) {
                return 202;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction);
            }
        });
}

function updateWrapupData(parameters) {
    $ = jQuery.noConflict();
    var weblink = "https://" + params.domain + ":8445/finesse/api/Dialog/" + parameters.parameter.dialogId;
    var dataString = "<Dialog><requestedAction>UPDATE_CALL_DATA</requestedAction><mediaProperties><wrapUpReason>" + parameters.parameter.wrapupReason + "</wrapUpReason></mediaProperties></Dialog>";

    $.ajax(
        {
            url: weblink,
            data: dataString,
            type: 'PUT',
            dataType: "xml",
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + params.encodedData);
                request.setRequestHeader("Content-Type", "application/xml");
            },
            crossDomain: true,
            success: function (result) {
                return 202;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction);
            }
        });
}

function getWrapUpReasons() {
    $ = jQuery.noConflict();
    var weblink = "https://" + params.domain + ":8445/finesse/api/User/" + params.username + "/WrapUpReasons";

    $.ajax(
        {
            url: weblink,
            type: 'GET',
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + params.encodedData);
            },

            crossDomain: true,

            success: function (result) {
                var stringdoc = new XMLSerializer().serializeToString(result);
                callbacks.apiCallbackFunction(stringdoc);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction);
            }
        });
}

function makeNotReady(parameters) {
    var weblink = "https://" + params.domain + ":8445/finesse/api/User/" + params.username;
    var dataString;

    if (parameters.parameter.reasonCode) {
        dataString = "<User><state>NOT_READY</state> <reasonCodeId>" + parameters.parameter.reasonCode + "</reasonCodeId> </User>";
    }
    else {
        dataString = "<User><state>NOT_READY</state></User>"
    }

    $.ajax(
        {
            url: weblink,
            data: dataString,
            type: 'PUT',
            dataType: "xml",
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + params.encodedData);
                request.setRequestHeader("Content-Type", "application/xml");
            },
            crossDomain: true,
            success: function (result) {
                return 202;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction);
            }
        });
}

function makeWorkReady(parameters) {
    $ = jQuery.noConflict();
    var weblink = "https://" + params.domain + ":8445/finesse/api/User/" + params.username;

    $.ajax(
        {
            url: weblink,
            data: "<User><state>" + parameters.parameter.wrapupState + "</state></User>",
            type: 'PUT',
            dataType: "xml",
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + params.encodedData);
                request.setRequestHeader("Content-Type", "application/xml");
            },
            crossDomain: true,

            success: function (result) {
                return 202;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction);
            }
        });
}

function makeReady() {
    $ = jQuery.noConflict();
    var weblink = "https://" + params.domain + ":8445/finesse/api/User/" + params.username;

    $.ajax(
        {
            url: weblink,
            data: "<User><state>READY</state></User>",
            type: 'PUT',
            dataType: "xml",
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + params.encodedData);
                request.setRequestHeader("Content-Type", "application/xml");
            },
            crossDomain: true,

            success: function (result) {
                return 202;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction);
            }
        });
}

function dialogAction(parameters) {
    $ = jQuery.noConflict();
    var action = getCallAction(parameters.action);
    var weblink = "https://" + params.domain + ":8445/finesse/api/Dialog/" + parameters.parameter.dialogId;

    $.ajax(
        {
            url: weblink,
            data: "<Dialog><targetMediaAddress>" + params.extension + "</targetMediaAddress><requestedAction>" + action + "</requestedAction></Dialog>",
            type: 'PUT',
            dataType: "xml",
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + params.encodedData);
                request.setRequestHeader("Content-Type", "application/xml");
            },
            crossDomain: true,
            success: function (result) {
                return 202;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction);
            }
        });
}

function getCallAction(action) {
    switch (action) {
        case "answerCall":
            return "ANSWER";
        case "releaseCall":
            return "DROP";
        case "holdCall":
            return "HOLD";
        case "retrieveCall":
            return "RETRIEVE";
        case "conferenceCall":
            return "CONFERENCE";
    }
    return null;
}


function makeCall(parameters) {
    $ = jQuery.noConflict();
    var weblink = "https://" + params.domain + ":8445/finesse/api/User/" + params.username + "/Dialogs";

    $.ajax(
        {
            url: weblink,
            data: "<Dialog><requestedAction>MAKE_CALL</requestedAction><fromAddress>" + params.extension + "</fromAddress><toAddress>" + parameters.parameter.calledNumber + "</toAddress></Dialog>",
            type: 'POST',
            dataType: "xml",
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + params.encodedData);
                request.setRequestHeader("Content-Type", "application/xml");
            },
            crossDomain: true,
            success: function (result) {
                return 202;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction);
            }
        });
}

function loginUser() {
    $ = jQuery.noConflict();

    var weblink = "https://" + params.domain + ":8445/finesse/api/User/" + params.username + "?id=" + params.username + "&state=LOGIN&extension=" + params.extension;

    $.ajax(
        {
            url: weblink,
            data: "<User><state>LOGIN</state><extension>" + params.extension + "</extension></User>",
            type: 'PUT',
            dataType: "xml",
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + params.encodedData);
                request.setRequestHeader("Content-Type", "application/xml");
            },
            crossDomain: true,
            success: function (result) {
                getState("login");
            },
            error: function (jqXHR, textStatus, errorThrown) {
                apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction);
            }
        });
}

function getState(source) {
    $ = jQuery.noConflict();
    var weblink = "https://" + params.domain + ":8445/finesse/api/User/" + params.username;
    $.ajax(
        {
            url: weblink,
            type: 'GET',
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + params.encodedData);
            },

            crossDomain: true,

            success: function (result) {
                result = new XMLSerializer().serializeToString(result);
                if (source == 'login') {
                    getDialogs();
                }
                callbacks.apiCallbackFunction(result)
            },

            error: function (jqXHR, textStatus, errorThrown) {
                apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction);
            }
        });
}

function getDialogs() {
    var weblink = "https://" + params.domain + ":8445/finesse/api/User/" + params.username + "/Dialogs";

    $.ajax(
        {
            url: weblink,
            data: "",
            type: 'GET',
            dataType: "xml",
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + params.encodedData);
            },
            success: function (result) {
                result = new XMLSerializer().serializeToString(result);
                callbacks.apiCallbackFunction(result);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction);
            }
        });
}

function logout(parameters) {
    var weblink = "https://" + params.domain + ":8445/finesse/api/User/" + params.username;
    var dataString;

    if (parameters.parameter.reasonCode) {
        dataString = "<User><state>LOGOUT</state> <reasonCodeId>" + parameters.parameter.reasonCode + "</reasonCodeId> </User>";
    }
    else {
        dataString = "<User><state>LOGOUT</state></User>";
    }

    $.ajax(
        {
            url: weblink,
            data: dataString,
            type: 'PUT',
            dataType: "xml",
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + params.encodedData);
                request.setRequestHeader("Content-Type", "application/xml");
            },
            crossDomain: true,
            success: function (result) {
                return 202;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction);
            }
        });
}

function getNotReadyLogoutReasons() {
    $ = jQuery.noConflict();
    var weblink = "https://" + params.domain + ":8445/finesse/api/User/" + params.username + "/ReasonCodes?category=NOT_READY";

    $.ajax(
        {
            url: weblink,
            type: 'GET',
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + params.encodedData);
            },

            crossDomain: true,

            success: function (result) {
                var stringdoc = new XMLSerializer().serializeToString(result);
                parseNotReadyReasons(stringdoc);
                getReasonsLogout();
                //callback(stringdoc);
                /*var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(stringdoc, "text/xml");
                var parsedReasons = parseReasonCodes(xmlDoc);
                callback(parsedReasons);*/
            },


            error: function (jqXHR, textStatus, errorThrown) {
                apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction);
            }
        });
}

function parseNotReadyReasons(reasons) {
    var xmlObj = $.parseXML(reasons);
    var response = xml2json(xmlObj);
    parseReasonCodes(response.ReasonCodes.ReasonCode, "notReady");
}

function getReasonsLogout() {
    $ = jQuery.noConflict();
    var weblink = "https://" + params.domain + ":8445/finesse/api/User/" + params.username + "/ReasonCodes?category=LOGOUT";

    $.ajax(
        {
            url: weblink,
            type: 'GET',
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + params.encodedData);
            },

            crossDomain: true,

            success: function (result) {
                var stringdoc = new XMLSerializer().serializeToString(result);
                callbacks.apiCallbackFunction(stringdoc);
            },

            error: function (jqXHR, textStatus, errorThrown) {
                apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction);
            }
        });
}

function parseReasonCodes(reasons, src) {
    var category;
    var label;
    var systemCode;
    var uri;
    var code;
    var i = 0;
    var logoutReasons = [];
    var reasonsLength = reasons.length;

    if (src == "notReady")
        notReadyReasons = [];

    if (reasonsLength && reasonsLength > 1) {
        while (i < reasonsLength) {
            systemCode = reasons[i].systemCode;

            if (systemCode == "false") {
                category = reasons[i].category;
                label = reasons[i].label;
                uri = reasons[i].uri;
                code = uri.match(/(\d+)/);
                code = code[0];

                var reason = { 'label': label, 'code': code, 'systemCode': systemCode };

                if (category == "LOGOUT") {
                    logoutReasons.push(reason)
                }
                else
                    notReadyReasons.push(reason);
            }
            i++;
        }
    }
    else if (reasons) {
        systemCode = reasons.systemCode;
        if (systemCode == "false") {
            category = reasons.category;
            label = reasons.label;
            uri = reasons.uri;
            code = uri.match(/(\d+)/);
            code = code[0];

            var reason = { 'label': label, 'code': code, 'systemCode': systemCode };
            if (category == "LOGOUT") {
                logoutReasons.push(reason)
            }
            else
                notReadyReasons.push(reason);
        }
    }
    if (src == "notReady")
        return notReadyReasons;

    var AllReasons =
    {
        "event": "notReadyLogoutReasonCode",
        "response":
        {
            "loginId": params.username,
            notReadyReasons,
            logoutReasons,
        }
    }
    return AllReasons;
}
function parseWrapUpReasonCodes(reasons) {
    var label;
    var uri;
    var code;
    var i = 0;
    var wrapupReasons = [];
    var reasonsLength = reasons.length;

    if (reasonsLength && reasonsLength > 1) {
        while (i < reasonsLength) {
            label = reasons[i].label;
            uri = reasons[i].uri;
            code = uri.match(/(\d+)/);
            code = code[0];

            var reason = { 'label': label, 'code': code, 'forAll': reasons[i].forAll };
            wrapupReasons.push(reason);
            i++;
        }
    }
    else if (reasons) {
        label = reasons.label;
        uri = reasons.uri;
        code = uri.match(/(\d+)/);
        code = code[0];

        var reason = { 'label': label, 'code': code, 'forAll': reasons.forAll };
        wrapupReasons.push(reason);
    }
    var wrapReasons =
    {
        "event": "wrapupReasonCode",
        "response":
        {
            "loginId": params.username,
            wrapupReasons,
        }
    }
    return wrapReasons;
}
