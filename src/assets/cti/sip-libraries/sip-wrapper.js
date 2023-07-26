var endcal = false;
var calls = [];
var consultSessioin;
var userAgent;
var registerer;
var again_register = false;
var sessionall = null;
var remotesession = null;
var loginid = null;
var wrapupenabler = null;
var agentInfo = false;
var callbackFunction = null;


var call_variable_array = {};
var dialogStatedata = null;
var invitedata = null;
var outboundDialingdata = null;
var sipconfig = sipConfig;

var remoteVideo = document.getElementById('remoteVideo');
var localVideo = document.getElementById('localVideo');

var dialogStatedata1 = {
    "event": "dialogState",
    "response": {
        "loginId": null,
        "dialog": {
            "id": null,
            "fromAddress": null,
            "dialedNumber": null,
            "customerNumber": null,
            "dnis": null,
            "callType": null,
            "ani": null,
            "wrapUpReason": null,
            "callEndReason": null,
            "queueName": null,
            "queueType": null,
            "associatedDialogUri": null,
            "secondaryId": null,
            "participants": [
                {
                    "actions": {
                        "action": [
                            "TRANSFER_SST",
                            "HOLD",
                            "SEND_DTMF",
                            "DROP"
                        ]
                    },
                    "mediaAddress": null,
                    "mediaAddressType": "SIP.js/0.15.11-CTI/Expertflow",
                    "startTime": null,
                    "state": null,
                    "stateCause": null,
                    "stateChangeTime": null,
                    'mute': false

                },
            ],
            "callVariables": {
                "CallVariable": []
            },
            "state": null,
            "isCallAlreadyActive": false,
            "callbackNumber": null,
            "outboundClassification": null,
            "scheduledCallbackInfo": null,
            "isCallEnded": 0,
            "eventType": "PUT"

        }
    }
}
var outboundDialingdata1 = {
    "event": "outboundDialing",
    "response": {
        "loginId": null,
        "dialog": {
            "id": null,
            "ani": null,
            "customerNumber": null,
            "associatedDialogUri": null,
            "callbackNumber": null,
            "outboundClassification": null,
            "scheduledCallbackInfo": null,
            "isCallEnded": 0,
            "eventType": "PUT",
            "callType": null,
            "queueName": null,
            "queueType": null,
            "dialedNumber": null,
            "dnis": null,
            "secondaryId": null,
            "state": "INITIATING",
            "isCallAlreadyActive": false,
            "wrapUpReason": null,
            "callEndReason": null,
            "fromAddress": null,
            "callVariables": {
                "CallVariable": []
            },
            "participants": [
                {
                    "actions": {
                        "action": [
                            "TRANSFER_SST",
                            "HOLD",
                            "SEND_DTMF",
                            "DROP"
                        ]
                    },
                    "mediaAddress": null,
                    "mediaAddressType": "SIP.js/0.15.11-CTI/Expertflow",
                    "startTime": null,
                    "state": null,
                    "stateCause": null,
                    "stateChangeTime": null,
                    'mute': false
                },
            ]
        }
    }
}
var invitedata1 = {
    "event": "newInboundCall",
    "response": {
        "loginId": null,
        "dialog": {
            "id": null,
            "ani": null,
            "customerNumber": null,
            "associatedDialogUri": null,
            "callbackNumber": null,
            "outboundClassification": null,
            "scheduledCallbackInfo": null,
            "isCallEnded": 0,
            "eventType": "PUT",
            "callType": null,
            "queueName": null,
            "queueType": null,
            "dialedNumber": null,
            "dnis": null,
            "secondaryId": null,
            "state": "ALERTING",
            "isCallAlreadyActive": false,
            "wrapUpReason": null,
            "callEndReason": null,
            "fromAddress": null,
            "callVariables": {
                "CallVariable": []
            },
            "participants": [
                {
                    "actions": {
                        "action": [
                            "ANSWER",
                        ]
                    },
                    "mediaAddress": null,
                    "mediaAddressType": "SIP.js/0.15.11-CTI/Expertflow",
                    "startTime": null,
                    "state": null,
                    "stateCause": null,
                    "stateChangeTime": null,
                    'mute': false
                },
            ]
        }
    }
}



function postMessage(obj, callback) {
    console.log(obj);
    if (Object.keys(sipconfig).length === 0) sipconfig = sipConfig;
    switch (obj.action) {
        case 'login':
            // if a callback function has been passed then we add the refereance to the EventEmitter class
            if (typeof obj.parameter.clientCallbackFunction === 'function') {
                if (sipconfig.uri !== null && sipconfig.uri !== undefined) {
                    connect_useragent(obj.parameter.extension, sipconfig.uri, sipconfig.agentStaticPassword, sipconfig.wss, sipconfig.enable_sip_log, obj.parameter.clientCallbackFunction);
                    callbackFunction = obj.parameter.clientCallbackFunction;
                } else {
                    error("invalidState", obj.parameter.extension, 'Server configurations not feteched ', obj.parameter.clientCallbackFunction);
                }
            }
            break;
        case 'logout':
            loader3(obj.parameter.clientCallbackFunction);
            break;
        case 'makeCall':
            initiate_call(obj.parameter.calledNumber, obj.parameter.clientCallbackFunction);
            break;
        case 'SST':
            blind_transfer(obj.parameter.numberToTransfer, obj.parameter.clientCallbackFunction);
            break;
        case 'SST_Queue':
            blind_transfer_queue(obj.parameter.numberToTransfer, obj.parameter.queue, obj.parameter.queueType, obj.parameter.clientCallbackFunction);
            break;
        case 'silentMonitor':
            console.log('Freeswitch do not support silentMonitor currently');
            break;
        case 'answerCall':
            respond_call(obj.parameter.clientCallbackFunction);
            break;
        case 'releaseCall':
            terminate_call();
            break;
        case 'rejectCall':
            console.log('Freeswitch do not support rejectCall currently');
            break;
        case 'closeCall':
            console.log('Freeswitch do not support closeCall currently');
            break;
        case 'end_call':
            console.log(obj);
            break;
        case 'holdCall':
            phone_hold(obj.parameter.clientCallbackFunction);
            break;
        case 'retrieveCall':
            phone_unhold(obj.parameter.clientCallbackFunction);
            break;
        case 'mute_call':
            phone_mute(obj.parameter.clientCallbackFunction);
            break;
        case 'unmute_call':
            phone_unmute(obj.parameter.clientCallbackFunction);
            break;
        case 'SST':
            console.log('Freeswitch do not support SST currently');
            break;
        case 'conferenceCall':
            console.log('Freeswitch do not support conferenceCall currently');
            break;
        case 'makeNotReadyWithReason':
            console.log('Freeswitch do not support makeNotReadyWithReason currently');
            break;
        case 'makeReady':
            console.log('Freeswitch do not support makeReady currently');
            break;
        case 'makeWorkReady':
            console.log('Freeswitch do not support makeWorkReady currently');
            break;
        case 'getDialog':
            console.log('Freeswitch do not support getDialog currently');
            break;
        case 'getWrapUpReasons':
            console.log('Freeswitch do not support getWrapUpReasons currently');
            break;
        case 'updateCallVariableData':
            console.log('Freeswitch do not support updateCallVariableData currently');
            break;
        case 'updateWrapupData':
            console.log('Freeswitch do not support updateWrapupData currently');
            break;
        case 'acceptCall':
            console.log('Freeswitch do not support updateWrapupData currently');
            break;
        case 'dropParticipant':
            console.log('Freeswitch do not support dropParticipant currently');
            break;
        case 'bargeIn':
            console.log('Freeswitch do not support bargeIn currently');
            break;
        case 'whisper':
            sendDtmf("2");
            break;
        case 'team_agent_update_status':
            console.log(obj);
            break;
        case 'team_agent_update_state':
            console.log(obj);
            break;
        case 'team_agent_update_reg':
            console.log(obj);
            break;
        case 'getState':
            console.log('Freeswitch do not support getState currently');
            //get_agent_status();
            break;
        case 'getNotReadyLogoutReasons':
            console.log('Freeswitch do not support getNotReadyLogoutReasons currently');
            break;
        case 'makeConsult':
            makeConsultCall('sip:' + obj.parameter.numberToConsult + "@" + sipconfig.uri, obj.parameter.clientCallbackFunction);
            // console.log('Freeswitch do not support makeConsult currently');
            break;
        case 'consultTransfer':
            makeConsultTransferCall(obj.parameter.clientCallbackFunction);
            // console.log('Freeswitch do not support consultTransfer currently');
            break;
        case 'getTeamUsers':
            console.log('Freeswitch do not support getTeamUsers currently');
            break;
    }
}



function connect_useragent(extension, sip_uri, sip_password, wss, sip_log, callback) {
    const undefinedParams = checkUndefinedParams(connect_useragent, [extension, sip_uri, sip_password, wss, sip_log, callback]);

    if (undefinedParams.length > 0) {
        // console.log(`Error: The following parameter(s) are undefined or null: ${undefinedParams.join(', ')}`);
        error("generalError", extension, `Error: The following parameter(s) are undefined or null or empty: ${undefinedParams.join(', ')}`, callback);
        return;
    }
    const uri = SIP.UserAgent.makeURI("sip:" + extension + "@" + sip_uri);
    if (!uri) {
        // Failed to create URI
    }
    // if (!ua) {
    var config = {
        uri: uri,
        authorizationUsername: extension,
        authorizationPassword: sip_password,
        transportOptions: {
            server: wss, // wss Protocol
        },
        extraContactHeaderParams: ['X-Referred-By-Someone: Username'],
        extraHeaders: ['X-Referred-By-Someone12: Username12'],
        contactParams: { transport: "wss" },
        contactName: extension,
        /**
* If true, a first provisional response after the 100 Trying will be sent automatically if UAC does not
* require reliable provisional responses.
* defaultValue `true`
*/
        sendInitialProvisionalResponse: true,
        refreshFrequency: 5000,
        delegate: {
            onTransportMessage: (message) => {
                console.log("SIP Transport message received:", message);
                // Handle the SIP transport message here
                // You can access the message content and headers
            },
            onConnect: () => {
                console.log("Network connectivity established");
                var event = {
                    "event": "xmppEvent",
                    "response": {
                        "loginId": extension,
                        "type": "IN_SERVICE",
                        "description": "Connected"
                    }
                };
                callback(event);
                if (again_register) {
                    // setupRemoteMedia(sessionall);
                    //    if(dialogStatedata.response.dialog.state=="ACTIVE")
                    //    terminate_call();
                    registerer.register()
                        .then((request) => {
                            console.log("Successfully sent REGISTER");
                            console.log("Sent request = ", request);
                            // if(dialogStatedata.response.dialog.state=="ACTIVE")
                            // terminate_call();
                            again_register = false
                        })
                        .catch((error) => {
                            console.error("Failed to send REGISTER", error.message);
                        });
                }
            },
            onDisconnect: (errorr) => {
                again_register = true;
                console.log("Network connectivity lost going to unregister");
                error("networkIssue", extension, errorr.message, callback);
                endcal = true;
                if (!errorr) {
                    console.log("User agent stopped");
                    var event = {
                        "event": "agentInfo",
                        "response": {
                            "loginId": extension,
                            "extension": extension,
                            "state": "LOGOUT",
                            "cause": cause
                        }
                    };
                    callback(event);
                    return;
                }
                // On disconnect, cleanup invalid registrations
                registerer.unregister()
                    .then((data) => {
                        again_register = true;
                    })
                    .catch((e) => {
                        // Unregister failed
                        console.log('Unregister failed  ', e);
                    });
                // Only attempt to reconnect if network/server dropped the connection
                if (errorr) {
                    console.log('Only attempt to reconnect if network/server dropped the connection', errorr);
                    var event = {
                        "event": "xmppEvent",
                        "response": {
                            "loginId": extension,
                            "type": "OUT_OF_SERVICE",
                            "description": errorr.message
                        }
                    };
                    callback(event);
                    attemptReconnection();
                }
            },
            onInvite: (invitation) => {
                console.log("INVITE received", invitation);
                //
                invitedata = invitedata1;

                var sip_from = invitation.incomingInviteRequest.message.headers.From[0].raw.split(" <")
                var variablelist = sip_from[0].substring(1, sip_from[0].length - 1).split("|")
                const sysdate = new Date();
                var datetime = sysdate.toISOString();

                var dnis = sip_from[1].split(">;")[0]


                dialedNumber = invitation.incomingInviteRequest.message.headers["X-Destination-Number"];
                dialedNumber = dialedNumber != undefined ? dialedNumber[0].raw : loginid;

                call_variable_array = [];
                if (variablelist.length === 1) {
                    if (variablelist[0].replace(/['"]+/g, '') == 'conference') {

                        call_variable_array.push({
                            "name": 'callVariable0',
                            "value": ''
                        })
                        for (let index = 1; index < 10; index++) {
                            if (invitation.incomingInviteRequest.message.headers['X-Call-Variable' + index]) {
                                call_variable_array.push({
                                    "name": 'callVariable' + index,
                                    "value": invitation.incomingInviteRequest.message.headers['X-Call-Variable' + index][0]['raw']
                                })
                                // call_variable_array['call_variable'+index]=session.request.headers['X-Call-Variable'+index][0]['raw']
                            }
                        }
                    } else if (/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/.test(variablelist[0].replace(/['"]+/g, ''))) {
                        // call_variable_array['call_variable0'] = variablelist[0].replace(/['"]+/g, '');
                        call_variable_array.push({
                            "name": 'callVariable0',
                            "value": variablelist[0].replace(/['"]+/g, '')
                        })
                        wrapupenabler = true;
                    } else {
                        // call_variable_array['call_variable0'] = session.request.headers['X-Call-Variable0'][0]['raw'];
                        call_variable_array.push({
                            "name": 'callVariable0',
                            "value": invitation.incomingInviteRequest.message.headers['X-Call-Variable0'][0]['raw']
                        })
                        for (let index = 1; index < 10; index++) {
                            if (invitation.incomingInviteRequest.message.headers['X-Call-Variable' + index]) {
                                call_variable_array.push({
                                    "name": 'callVariable' + index,
                                    "value": invitation.incomingInviteRequest.message.headers['X-Call-Variable' + index][0]['raw']
                                })
                                // call_variable_array['call_variable'+index]=session.request.headers['X-Call-Variable'+index][0]['raw']
                            }
                        }
                    }
                } else {
                    if (/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/.test(variablelist[0].replace(/['"]+/g, ''))) {
                        // call_variable_array['call_variable0'] = variablelist[0].replace(/['"]+/g, '');
                        call_variable_array.push({
                            "name": 'callVariable0',
                            "value": variablelist[0].replace(/['"]+/g, '')
                        })
                        wrapupenabler = true;
                    }
                    for (let index = 1; index < variablelist.length; index++) {
                        call_variable_array.push({
                            "name": 'callVariable' + index,
                            "value": variablelist[index]
                        })
                    }

                }
                if (invitation.incomingInviteRequest) {
                    dialogStatedata.event = "dialogState";
                    invitedata.event = "newInboundCall";
                    if (invitation.incomingInviteRequest.message.from._displayName === 'conference') {
                        dialogStatedata.response.dialog.callType = 'conference';
                        invitedata.response.dialog.callType = 'conference';

                    } else if (invitation.incomingInviteRequest.message.headers["X-Calltype"] !== undefined) {
                        var calltype = invitation.incomingInviteRequest.message.headers["X-Calltype"][0].raw;
                        if (calltype == "PROGRESSIVE") {
                            dialogStatedata.response.dialog.callType = "OUTBOUND";
                            invitedata.response.dialog.callType = "OUTBOUND";
                            dialogStatedata.event = "campaignCall";
                            invitedata.event = "campaignCall";
                            setTimeout(respond_call, sipconfig.autoCallAnswer * 1000, callback);
                        }
                    }
                    else {
                        dialogStatedata.response.dialog.callType = 'OTHER_IN'
                        invitedata.response.dialog.callType = 'OTHER_IN';

                    }
                }
                var queuenameval = invitation.incomingInviteRequest.message.headers["X-Queue"] != undefined ? invitation.incomingInviteRequest.message.headers["X-Queue"][0]['raw'] : "Nil";
                var queuetypeval = invitation.incomingInviteRequest.message.headers["X-Queuetype"] != undefined ? invitation.incomingInviteRequest.message.headers["X-Queuetype"][0]['raw'] : "Nil";
                dialogStatedata.response.dialog.callVariables.CallVariable = call_variable_array;
                dialogStatedata.response.loginId = loginid;
                dialogStatedata.response.dialog.id = invitation.incomingInviteRequest.message.headers["X-Call-Id"] != undefined ? invitation.incomingInviteRequest.message.headers["X-Call-Id"][0]['raw'] : invitation.incomingInviteRequest.message.headers["Call-ID"][0]['raw'];
                dialogStatedata.response.dialog.ani = dnis.split('sip:')[1].split('@')[0];
                dialogStatedata.response.dialog.fromAddress = dnis.split('sip:')[1].split('@')[0];
                dialogStatedata.response.dialog.customerNumber = dnis.split('sip:')[1].split('@')[0];
                dialogStatedata.response.dialog.participants[0].mediaAddress = loginid;
                dialogStatedata.response.dialog.dnis = dialedNumber;
                dialogStatedata.response.dialog.participants[0].startTime = datetime;
                dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
                dialogStatedata.response.dialog.participants[0].state = "ALERTING";
                dialogStatedata.response.dialog.state = "ALERTING";
                dialogStatedata.response.dialog.dialedNumber = dialedNumber;
                dialogStatedata.response.dialog.queueName = queuenameval == "Nil" ? null : queuenameval;
                dialogStatedata.response.dialog.queueType = queuetypeval == "Nil" ? null : queuetypeval;

                invitedata.response.dialog.callVariables.CallVariable = call_variable_array;
                invitedata.response.loginId = loginid;
                invitedata.response.dialog.dnis = dialedNumber;
                invitedata.response.dialog.id = invitation.incomingInviteRequest.message.headers["X-Call-Id"] != undefined ? invitation.incomingInviteRequest.message.headers["X-Call-Id"][0]['raw'] : invitation.incomingInviteRequest.message.headers["Call-ID"][0]['raw'];
                invitedata.response.dialog.ani = dnis.split('sip:')[1].split('@')[0];
                invitedata.response.dialog.fromAddress = dnis.split('sip:')[1].split('@')[0];
                invitedata.response.dialog.customerNumber = dnis.split('sip:')[1].split('@')[0];
                invitedata.response.dialog.participants[0].mediaAddress = loginid;
                invitedata.response.dialog.participants[0].startTime = datetime;
                invitedata.response.dialog.participants[0].stateChangeTime = datetime;
                invitedata.response.dialog.participants[0].state = "ALERTING";
                invitedata.response.dialog.state = "ALERTING";
                invitedata.response.dialog.dialedNumber = dialedNumber;
                invitedata.response.dialog.queueName = queuenameval == "Nil" ? null : queuenameval;
                invitedata.response.dialog.queueType = queuetypeval == "Nil" ? null : queuetypeval;

                callback(JSON.parse(JSON.stringify(invitedata)));
                calls.push(invitedata);
                remotesession = invitation;
                sessionall = invitation;
                addsipcallback(invitation, 'inbound', callback);
            },
            onAck: (onACk) => {
                console.log("onACk received", onACk);
                //invitation.accept();
            },
            onMessage: (message) => {
                console.log("MESSAGE received");
                //message.accept();
            },
            onNotify: (notification) => {
                console.log("NOTIFY received", notification);
                notification.accept();
            },
            onRefer: (referral) => {
                console.log("REFER received");
                referral.accept();
            },
            onSubscribe: (subscription) => {
                console.log("SUBSCRIBE received");
            },
            onReject: (response) => {
                console.log("onReject response = ", response);
                // error("generalError",loginid,response.message.reasonPhrase,callback);
            },
        }
    };

    userAgent = new SIP.UserAgent(config)
    userAgent.start()
        .then(() => {
            console.log("Connected");
            registerer = new SIP.Registerer(userAgent);
            // Setup registerer state change handler
            registerer.stateChange.addListener((newState) => {
                console.log('newState:', newState);
                switch (newState) {
                    case SIP.RegistererState.Registered:
                        console.log("Registered");
                        if (dialogStatedata == null)
                            dialogStatedata = dialogStatedata1;
                        if (dialogStatedata.response.dialog.state == "ACTIVE" && endcal == true) {
                            setTimeout(terminate_call, 5000);
                            endcal = false;
                        }
                        loginid = extension;
                        dialogStatedata.response.loginId = extension;
                        console.log(' connected registered', registerer);
                        var event = {
                            "event": "agentInfo",
                            "response": {
                                "loginId": extension,
                                "extension": extension,
                                "state": "LOGIN",
                                cause: null
                            }
                        };
                        if (!agentInfo) {
                            callback(event);
                            callback({
                                "event": "dialogState",
                                "response": {
                                    "loginId": extension,
                                    "dialog": null
                                }
                            });
                            agentInfo = true;
                        }
                        break;
                    case SIP.RegistererState.Unregistered:
                        console.log("Unregistered", registerer);
                        if (!again_register) {
                            var event = {
                                "event": "agentInfo",
                                "response": {
                                    "loginId": extension,
                                    "extension": extension,
                                    "state": "LOGOUT",
                                    "cause": null
                                }
                            };
                            callback(event);
                            dialogStatedata = null;
                            loginid = null;
                            agentInfo = false;
                            userAgent.delegate = null;
                            userAgent = null;
                            sessionall = null;

                        }
                        break;
                    case SIP.RegistererState.Terminated:
                        console.log("Terminated");
                        break;
                }
            });
            // Send REGISTER
            registerer.register()
                .then((request) => {
                    console.log("Successfully sent REGISTER");
                    console.log("Sent request = ", request);
                    // request.delegate={
                    //     onReject: (response) => {
                    //     },
                    //     onAccept: (response) => {

                    //         //error("generalError",loginid,response.message.reasonPhrase,callback);
                    //     },
                    //     onProgress: (response) => {
                    //         console.log("onProgress response = ", response);
                    //         //error("generalError",loginid,response.message.reasonPhrase,callback);
                    //     },
                    //     onRedirect: (response) => {
                    //         console.log("onRedirect response = ", response);
                    //         //error("generalError",loginid,response.message.reasonPhrase,callback);
                    //     },
                    //     onTrying: (response) => {
                    //         console.log("onTrying response = ", response);
                    //         //error("generalError",loginid,response.message.reasonPhrase,callback);
                    //     },
                    // }
                })
                .catch((error) => {
                    console.error("Failed to send REGISTER", error.message);
                    error("subscriptionFailed", extension, error.message, callback);
                });
        })
        .catch((errorr) => {
            console.error("Failed to connect", errorr);
            error("subscriptionFailed", extension, errorr.message, callback);
        });



}
function initiate_call(calledNumber, callback) {
    const undefinedParams = checkUndefinedParams(initiate_call, [calledNumber, callback]);

    if (undefinedParams.length > 0) {
        // console.log(`Error: The following parameter(s) are undefined or null: ${undefinedParams.join(', ')}`);
        error("generalError", loginid, `Error: The following parameter(s) are undefined or null or empty: ${undefinedParams.join(', ')}`, callback);
        return;
    }

    if (userAgent !== null && userAgent !== undefined) {
        // Target URI
        var sip_uri = SIP.UserAgent.makeURI('sip:' + calledNumber + "@" + sipconfig.uri);
        if (!sip_uri) {
            // console.error("Failed to create target URI.");
            error("generalError", loginid, "Invalid target Uri:" + calledNumber, callback);
            return;
        }
        // Create new Session instance in "initial" state
        sessionall = new SIP.Inviter(userAgent, sip_uri);
        const request = sessionall.request;

        request.extraHeaders.push('X-Custom-Header: Value1');
        request.extraHeaders.push('Another-Header: Value2');


        // Options including delegate to capture response messages
        const inviteOptions = {
            requestDelegate: {
                onAccept: (response) => {
                    console.log("onAccept response = ", response);
                },
                onReject: (response) => {
                    console.log("onReject response = ", response);
                    error("generalError", loginid, response.message.reasonPhrase, callback);
                },
                onCancel: (response) => {
                    console.log("onCancel response = ", response);
                    error("generalError", loginid, response.message.reasonPhrase, callback);
                },
                onBye: (response) => {
                    console.log("onBye response = ", response);
                    error("generalError", loginid, response.message.reasonPhrase, callback);
                },
                onTerminate: (response) => {
                    console.log("onTerminate response = ", response);
                    error("generalError", loginid, response.message.reasonPhrase, callback);
                },
                onProgress: (response) => {
                    console.log("INITIATED response = onProgress", response);
                    const sysdate = new Date();
                    var datetime = sysdate.toISOString();
                    dialogStatedata.response.dialog.participants[0].state = "INITIATED";
                    dialogStatedata.response.dialog.state = "INITIATED";
                    outboundDialingdata.response.dialog.participants[0].startTime = datetime;
                    outboundDialingdata.response.dialog.participants[0].state = "INITIATED";
                    outboundDialingdata.response.dialog.state = "INITIATED";
                    callback(JSON.parse(JSON.stringify(outboundDialingdata)));
                },
                onTrying: (response) => {
                    console.log("INITIATING response = onTrying", response);
                    if (response.message) {
                        outboundDialingdata = outboundDialingdata1;

                        const sysdate = new Date();
                        var datetime = sysdate.toISOString();
                        dialedNumber = response.message.to.uri.raw.user;;
                        dialogStatedata.response.loginId = loginid;
                        dialogStatedata.response.dialog.fromAddress = loginid;
                        dialogStatedata.response.dialog.callType = 'OUT';
                        dialogStatedata.response.dialog.ani = dialedNumber;
                        dialogStatedata.response.dialog.id = response.message.callId;
                        dialogStatedata.response.dialog.dialedNumber = dialedNumber;
                        dialogStatedata.response.dialog.fromAddress = loginid;
                        dialogStatedata.response.dialog.customerNumber = dialedNumber;
                        dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
                        //change dialogStatedata.response.dialog.participants[0].mediaAddress = agentlogindata.agent_contact.split('/')[1].split('@')[0];

                        outboundDialingdata.response.loginId = loginid;
                        outboundDialingdata.response.dialog.fromAddress = loginid;
                        outboundDialingdata.response.dialog.callType = 'OUT';
                        outboundDialingdata.response.dialog.ani = dialedNumber;
                        outboundDialingdata.response.dialog.dnis = dialedNumber;
                        outboundDialingdata.response.dialog.id = response.message.callId;
                        outboundDialingdata.response.dialog.dialedNumber = dialedNumber;
                        outboundDialingdata.response.dialog.customerNumber = dialedNumber;
                        outboundDialingdata.response.dialog.participants[0].mediaAddress = loginid;
                        outboundDialingdata.response.dialog.participants[0].startTime = datetime;
                        outboundDialingdata.response.dialog.participants[0].stateChangeTime = datetime;
                        outboundDialingdata.response.dialog.participants[0].startTime = datetime;
                        outboundDialingdata.response.dialog.participants[0].state = "INITIATING";
                        outboundDialingdata.response.dialog.state = "INITIATING";

                        dialogStatedata.response.dialog.participants[0].startTime = datetime;
                        dialogStatedata.response.dialog.participants[0].state = "INITIATING";
                        dialogStatedata.response.dialog.state = "INITIATING";
                        callback(JSON.parse(JSON.stringify(outboundDialingdata)));

                    }

                },
                onRedirect: (response) => {
                    console.log("Negative response = onRedirect" + response);
                },
                onRefer: (response) => {
                    console.log("onRefer response = onRefer" + response);
                }
            },
            sessionDescriptionHandlerOptions: {
                constraints: {
                    audio: true,
                    video: false
                }
            },
            earlyMedia: true,
            requestOptions: {
                extraHeaders: [
                    'X-Referred-By-Someone: Username'
                ]
            },
        };

        // Send initial INVITE
        sessionall.invite(inviteOptions)
            .then((request) => {
                console.log("Successfully sent INVITE");
                console.log("INVITE request = ", request);

                if (sessionall.outgoingRequestMessage) {

                }
            })
            .catch((errorr) => {
                console.log("Failed to send INVITE", errorr.message);
                error("generalError", loginid, errorr.message, callback);


            });
        addsipcallback(sessionall, 'outbound', callback);
    } else {
        error('invalidState', loginid, "invalid action makeCall", callback);
    }
}
function terminate_call() {
    if (!sessionall) {
        if (typeof callbackFunction === "function")
            error('invalidState', loginid, "invalid action releaseCall", callbackFunction);
        return;
    }
    console.log('state', sessionall.state);
    switch (sessionall.state) {
        case SIP.SessionState.Initial:
        case SIP.SessionState.Establishing:
            if (sessionall instanceof SIP.Inviter) {
                // An unestablished outgoing session
                sessionall.cancel();
            } else {
                // An unestablished incoming session
                dialogStatedata.response.dialog.callEndReason = "Rejected";
                sessionall.reject();
            }
            break;
        case SIP.SessionState.Established:
            // An established session
            sessionall.bye();
            break;
        case SIP.SessionState.Terminating:
        case SIP.SessionState.Terminated:
            // Cannot terminate a session that is already terminated
            break;
    }
    sessionall = null;
}
function reject_call() {
    // reject a call
    if (remotesession) {
        remotesession.reject();
    }
    else {
        error('invalidState', loginid, "invalid action rejectCall", callback);
    }
}
function blind_transfer(numberToTransfer, callback) {
    const undefinedParams = checkUndefinedParams(blind_transfer, [numberToTransfer, callback]);

    if (undefinedParams.length > 0) {
        // console.log(`Error: The following parameter(s) are undefined or null: ${undefinedParams.join(', ')}`);
        error("generalError", loginid, `Error: The following parameter(s) are undefined or null or empty: ${undefinedParams.join(', ')}`, callback);
        return;
    }

    if (!sessionall) {
        return;
    }
    // Target URI
    var target = SIP.UserAgent.makeURI('sip:' + numberToTransfer + "@" + sipconfig.uri);
    if (!target) {
        // console.error("Failed to create target URI.");
        error("generalError", loginid, "Invalid target Uri:" + numberToTransfer, callback);
        return;
    }
    const options = {
        eventHandlers: {
            accepted: () => {
                console.log('REFER request accepted');
            },
            failed: (response) => {
                console.log('REFER request failed:', response.statusCode);
            }
        },
        requestDelegate: {
            onAccept: (request) => {
                console.log('Custom onAccept logic');
                // Custom logic for accepting the REFER request
            },
            onReject: (request) => {
                console.log('Custom onReject logic');
                // Custom logic for rejecting the REFER request
            }
        },
    };
    sessionall.refer(target, options).then((res) => {
        console.log('success blind_transfer', res);
        dialogStatedata.response.dialog.callEndReason = "direct-transfered";

    }).catch((e) => {
        console.log('blind_transfer error ', e);
        error("generalError", loginid, e.message, callback);
    })
}
function blind_transfer_queue(numberToTransfer, queue, queuetype, callback) {
    const undefinedParams = checkUndefinedParams(blind_transfer_queue, [numberToTransfer, queue, queuetype, callback]);

    if (undefinedParams.length > 0) {
        // console.log(`Error: The following parameter(s) are undefined or null: ${undefinedParams.join(', ')}`);
        error("generalError", loginid, `Error: The following parameter(s) are undefined or null or empty: ${undefinedParams.join(', ')}`, callback);
        return;
    }

    if (!sessionall) {
        return;
    }
    // Target URI
    var target = SIP.UserAgent.makeURI('sip:' + numberToTransfer + "-" + queue + "@" + sipconfig.uri);
    if (!target) {
        error("generalError", loginid, "Invalid target Uri:" + numberToTransfer, callback);
        return;
    }
    const options = {
        eventHandlers: {
            accepted: () => {
                // console.log('REFER request accepted');
            },
            failed: (response) => {
                // console.log('REFER request failed:', response.statusCode);
            }
        },
        requestOptions: {
            extraHeaders: [
                'X-queueTransfer: ' + queue, // Replace with your desired header and value
                'X-queueTypeTransfer: ' + queuetype,
            ]
        },
        requestDelegate: {
            onAccept: (request) => {
                //console.log('Custom onAccept logic');
                // Custom logic for accepting the REFER request
            },
            onReject: (request) => {
                //console.log('Custom onReject logic');
                // Custom logic for rejecting the REFER request
            }
        },
    };

    sessionall.refer(target, options).then((res) => {
        console.log('success blind_transfer_queue', res);
        dialogStatedata.response.dialog.callEndReason = "direct-transfered";
    }).catch((e) => {
        console.log('blind_transfer_queue error ', e);
        error("generalError", loginid, e.message, callback);
    })

}
function phone_hold(callback) {

    if (!sessionall || dialogStatedata.response.dialog.state == "HELD") {
        error('invalidState', loginid, "invalid action holdCall", callback);
        return;
    }
    //for mute/unmute
    let peer = sessionall.sessionDescriptionHandler.peerConnection;
    let senders = peer.getSenders();

    if (!senders.length) return;

    //let that = this;
    senders.forEach(function (sender) {
        if (sender.track) sender.track.enabled = false;
    });

    // Hold the session by sending a re-INVITE with hold session description
    const holdOptions = {
        sessionDescriptionHandlerOptions: {
            hold: true,
        }
    };

    sessionall.invite(holdOptions)
        .then(() => {
            console.log("Session held successfully.");
            const sysdate = new Date();
            var datetime = sysdate.toISOString();
            dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
            dialogStatedata.response.dialog.participants[0].state = "HELD";
            dialogStatedata.response.dialog.state = "HELD";
            dialogStatedata.response.dialog.isCallAlreadyActive = true;
            if (typeof callback === 'function') {
                callback(dialogStatedata);
            }
        })
        .catch((errorr) => {
            console.error("Failed to hold the session:", errorr);
            error('generalError', loginid, errorr.message, callback);
        });

}
function phone_unhold(callback) {
    if (!sessionall || dialogStatedata.response.dialog.state == "ACTIVE") {
        error('invalidState', loginid, "invalid action unholdCall", callback);
        return;
    }
    //for mute/unmute
    let peer = sessionall.sessionDescriptionHandler.peerConnection;
    let senders = peer.getSenders();

    if (!senders.length) return;

    //let that = this;
    senders.forEach(function (sender) {
        if (sender.track) sender.track.enabled = true;
    });

    // Hold the session by sending a re-INVITE with hold session description
    const holdOptions = {
        sessionDescriptionHandlerOptions: {
            hold: false,
        }
    };

    sessionall.invite(holdOptions)
        .then(() => {
            console.log("Session unhold successfully.");
            const sysdate = new Date();
            var datetime = sysdate.toISOString();
            dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
            dialogStatedata.response.dialog.participants[0].state = "ACTIVE";
            dialogStatedata.response.dialog.state = "ACTIVE";
            dialogStatedata.response.dialog.isCallAlreadyActive = true;
            if (typeof callback === 'function') {
                callback(dialogStatedata);
            }
        })
        .catch((errorr) => {
            console.error("Failed to unhold the session:", errorr);
            error('generalError', loginid, errorr.message, callback);
        });
}
function phone_mute(callback) {
    if (!sessionall) {
        //console.warn("No session to toggle mute");
        error('invalidState', loginid, "invalid action mute_call", callback);
        return;
    }
    //for mute/unmute
    let peer = sessionall.sessionDescriptionHandler.peerConnection;
    let senders = peer.getSenders();

    if (!senders.length) return;

    //let that = this;
    senders.forEach(function (sender) {
        if (sender.track) sender.track.enabled = false;
    });

    const sysdate = new Date();
    var datetime = sysdate.toISOString();
    dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
    dialogStatedata.response.dialog.participants[0].mute = true;
    if (typeof callback === 'function') {
        callback(dialogStatedata);
    }
}
function phone_unmute(callback) {
    if (!sessionall) {
        error('invalidState', loginid, "invalid action unmute_call", callback);
        return;
    }

    //for mute/unmute
    let peer = sessionall.sessionDescriptionHandler.peerConnection;
    let senders = peer.getSenders();

    if (!senders.length) return;

    //let that = this;
    senders.forEach(function (sender) {
        if (sender.track) sender.track.enabled = true;
    });

    const sysdate = new Date();
    var datetime = sysdate.toISOString();
    dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
    dialogStatedata.response.dialog.participants[0].mute = false;
    if (typeof callback === 'function') {
        callback(dialogStatedata);
    }
}
function respond_call(callback) {
    if (!sessionall || sessionall.state === SIP.SessionState.Established) {
        if (typeof callback === "function")
            error('invalidState', loginid, "invalid action answerCall", callback);
        return;
    }
    // answer a call
    if (sessionall.status === SIP.SessionState.Established) {
        console.log('Call already answered');
    } else {
        var sdp = sessionall.request.body;
        var offeredAudio = false, offeredVideo = false;

        if ((/\r\nm=audio /).test(sdp)) {
            offeredAudio = true;
        }

        if ((/\r\nm=video /).test(sdp)) {
            offeredVideo = true;
        }
        sessionall.accept({
            sessionDescriptionHandlerOptions: {
                constraints: {
                    audio: offeredAudio,
                    video: false
                }
            }
        }).then((res) => {
            console.log('call accepted : ', res)
        })
            .catch((e) => {
                console.log('error :', e.message);
                error("generalError", loginid, e.message, callback);

            });
        video = true;
        sessionall = sessionall;

    }


}
function makeConsultCall(sip_id, callback) {
    if (userAgent !== null && userAgent !== undefined) {
        // Target URI
        var sip_uri = SIP.UserAgent.makeURI(sip_id);
        if (!sip_uri) {
            // console.error("Failed to create target URI.");
            error("generalError", loginid, "Invalid target Uri:" + sip_id, callback);
            return;
        }
        // Create new Session instance in "initial" state
        consultSessioin = new SIP.Inviter(userAgent, sip_uri);

        // Options including delegate to capture response messages
        const inviteOptions = {
            requestDelegate: {
                onAccept: (response) => {
                    console.log("onAccept response = ", response);
                },
                onReject: (response) => {
                    console.log("onReject response = ", response);
                    error("generalError", loginid, response.message.reasonPhrase, callback);
                },
                onCancel: (response) => {
                    console.log("onCancel response = ", response);
                    error("generalError", loginid, response.message.reasonPhrase, callback);
                },
                onBye: (response) => {
                    console.log("onBye response = ", response);
                    error("generalError", loginid, response.message.reasonPhrase, callback);
                },
                onTerminate: (response) => {
                    console.log("onTerminate response = ", response);
                    error("generalError", loginid, response.message.reasonPhrase, callback);
                },
                onProgress: (response) => {
                    console.log("INITIATED response = onProgress", response);
                    // const sysdate = new Date();
                    // var datetime = sysdate.toISOString();
                    // dialogStatedata.response.dialog.participants[0].state = "INITIATED";
                    // dialogStatedata.response.dialog.state = "INITIATED";
                    // outboundDialingdata.response.dialog.participants[0].startTime = datetime;
                    // outboundDialingdata.response.dialog.participants[0].state = "INITIATED";
                    // outboundDialingdata.response.dialog.state = "INITIATED";
                    // callback(JSON.parse(JSON.stringify(outboundDialingdata)));
                },
                onTrying: (response) => {
                    console.log("INITIATING response = onTrying", response);
                    // if (response.message) {
                    //     outboundDialingdata = outboundDialingdata1;

                    //     const sysdate = new Date();
                    //     var datetime = sysdate.toISOString();
                    //     dialedNumber = response.message.to.uri.raw.user;;
                    //     dialogStatedata.response.loginId = loginid;
                    //     dialogStatedata.response.dialog.fromAddress = loginid;
                    //     dialogStatedata.response.dialog.callType = 'OUT';
                    //     dialogStatedata.response.dialog.ani = dialedNumber;
                    //     dialogStatedata.response.dialog.id = response.message.callId;
                    //     dialogStatedata.response.dialog.dialedNumber = dialedNumber;
                    //     dialogStatedata.response.dialog.fromAddress = loginid;
                    //     dialogStatedata.response.dialog.customerNumber = dialedNumber;
                    //     dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
                    //     //change dialogStatedata.response.dialog.participants[0].mediaAddress = agentlogindata.agent_contact.split('/')[1].split('@')[0];

                    //     outboundDialingdata.response.loginId = loginid;
                    //     outboundDialingdata.response.dialog.fromAddress = loginid;
                    //     outboundDialingdata.response.dialog.callType = 'OUT';
                    //     outboundDialingdata.response.dialog.ani = dialedNumber;
                    //     outboundDialingdata.response.dialog.dnis = dialedNumber;
                    //     outboundDialingdata.response.dialog.id = response.message.callId;
                    //     outboundDialingdata.response.dialog.dialedNumber = dialedNumber;
                    //     outboundDialingdata.response.dialog.customerNumber = dialedNumber;
                    //     outboundDialingdata.response.dialog.participants[0].mediaAddress = loginid;
                    //     outboundDialingdata.response.dialog.participants[0].startTime = datetime;
                    //     outboundDialingdata.response.dialog.participants[0].stateChangeTime = datetime;
                    //     outboundDialingdata.response.dialog.participants[0].startTime = datetime;
                    //     outboundDialingdata.response.dialog.participants[0].state = "INITIATING";
                    //     outboundDialingdata.response.dialog.state = "INITIATING";

                    //     dialogStatedata.response.dialog.participants[0].startTime = datetime;
                    //     dialogStatedata.response.dialog.participants[0].state = "INITIATING";
                    //     dialogStatedata.response.dialog.state = "INITIATING";
                    //     callback(JSON.parse(JSON.stringify(outboundDialingdata)));

                    // }

                },
                onRedirect: (response) => {
                    console.log("Negative response = onRedirect" + response);
                },
                onRefer: (response) => {
                    console.log("onRefer response = onRefer" + response);
                }
            },
            sessionDescriptionHandlerOptions: {
                constraints: {
                    audio: true,
                    video: false
                }
            }
        };

        // Send initial INVITE
        consultSessioin.invite(inviteOptions)
            .then((request) => {
                console.log("Successfully sent INVITE");
                console.log("INVITE request = ", request);

                if (consultSessioin.outgoingRequestMessage) {

                }
            })
            .catch((errorr) => {
                console.log("Failed to send INVITE", errorr.message);
                error("generalError", loginid, errorr.message, callback);


            });
        consultSessioin.stateChange.addListener((newState) => {
            console.log(newState);
            switch (newState) {
                case SIP.SessionState.Establishing:
                    console.log("Ringing");

                    break;
                case SIP.SessionState.Established:
                    console.log("Answered");
                    break;
                case SIP.SessionState.Terminated:
                    console.log("Ended");
                    break;
            }
        });

        //addsipcallback(sessionall, 'outbound', callback);
    } else {
        error('invalidState', loginid, "invalid action makeCall", callback);
    }

    //sessionall.refer(consultSessioin);
}
function makeConsultTransferCall(callback) {
    sessionall.refer(consultSessioin);
}
function addsipcallback(temp_session, call_type, callback) {
    try {
        //
        remotesession = temp_session;
        temp_session.stateChange.addListener((newState) => {
            console.log(newState);
            switch (newState) {
                case SIP.SessionState.Establishing:
                    console.log("Ringing");

                    break;
                case SIP.SessionState.Established:
                    console.log("Answered");
                    setupRemoteMedia(temp_session);


                    var call_type1;
                    if (temp_session.incomingInviteRequest) {
                        if (temp_session.incomingInviteRequest.message.from._displayName === 'conference') {
                            call_type1 = 'conference'
                        } else {
                            call_type1 = 'incoming'
                        }
                    } else {
                        call_type1 = 'outbound'
                    }
                    const sysdate = new Date();
                    var datetime = sysdate.toISOString();
                    temp_session.startTime = datetime;

                    // console.log(event);
                    if (call_type != 'inbound') {
                        call_variable_array = [];
                        if (temp_session.outgoingRequestMessage.headers['X-Call-Variable0']) {
                            call_variable_array.push({
                                "name": 'callVariable0',
                                "value": data.headers['X-Call-Variable0'][0]['raw']
                            })
                        } else {
                            call_variable_array.push({
                                "name": 'callVariable0',
                                "value": ''
                            })
                        }
                        for (let index = 1; index < 10; index++) {
                            if (temp_session.outgoingRequestMessage.headers['X-Call-Variable' + index]) {
                                call_variable_array.push({
                                    "name": 'callVariable' + index,
                                    "value": data.headers['X-Call-Variable' + index]
                                })
                            }
                        }
                        dialogStatedata.response.dialog.callVariables.CallVariable = call_variable_array;
                        dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
                        dialogStatedata.response.dialog.participants[0].state = "ACTIVE";
                        dialogStatedata.response.dialog.state = "ACTIVE";
                        dialogStatedata.response.dialog.isCallEnded = 0;
                    } else {
                        dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
                        dialogStatedata.response.dialog.participants[0].state = "ACTIVE";
                        dialogStatedata.response.dialog.state = "ACTIVE";
                        dialogStatedata.response.dialog.isCallEnded = 0;

                    }
                    var dialogstatemedia = JSON.parse(JSON.stringify(dialogStatedata));
                    dialogstatemedia.response.dialog.participants[0].mute = false;
                    callback(dialogstatemedia)
                    break;
                case SIP.SessionState.Terminated:
                    console.log("Ended");
                    var sysdate1 = new Date();
                    var datetime = sysdate1.toISOString();
                    if (dialogStatedata != null) {
                        dialogStatedata.response.dialog.participants[0].mute = false;
                        dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
                        dialogStatedata.response.dialog.participants[0].state = "DROPPED";
                        if (dialogStatedata.response.dialog.callEndReason == "direct-transfered") {
                            dialogStatedata.response.dialog.isCallEnded = 0;
                        } else {
                            dialogStatedata.response.dialog.isCallEnded = 1;
                        }
                        dialogStatedata.response.dialog.state = "DROPPED";
                        dialogStatedata.response.dialog.isCallAlreadyActive = false;
                        callback(JSON.parse(JSON.stringify(dialogStatedata)));
                        dialogStatedata.response.dialog.callEndReason = null;
                        // clearTimeout(myTimeout);
                    }
                    break;
            }
        });
        temp_session.delegate = {
            onBye(bye) {
                console.log(`we received a bye message!`, bye);
            },
            onRejec: (invitation) => {
                console.log("onReject received", invitation);
                //invitation.accept();
            },
            onRejected: (invitation) => {
                console.log("onRejected received", invitation);
                //invitation.accept();
            },
            onCancel: (invitation) => {
                console.log("onCancel received", invitation);
                const match = invitation.incomingCancelRequest.data.match(/text="([^"]+)"/);

                if (match && match[1]) {
                    dialogStatedata.response.dialog.callEndReason = match[1];
                } else {
                    dialogStatedata.response.dialog.callEndReason = "Canceled";
                }
                //invitation.accept();
            },
            onFailed: (invitation) => {
                console.log("onFailed received", invitation);
                //invitation.accept();
            },
            onAccepted: (invitation) => {
                console.log("onAccepted received", invitation);
                //invitation.accept();
            },
            onrejectionhandled: (invitation) => {
                console.log("onrejectionhandled received", invitation);
                //invitation.accept();
            },
            onunhandledrejection: (invitation) => {
                console.log("onunhandledrejection received", invitation);
                //invitation.accept();
            },

            onTerminated: (invitation) => {
                console.log("onTerminated received", invitation);
                //invitation.accept();
            },
            onTerminate: (invitation) => {
                console.log("onTerminate received", invitation);
                //invitation.accept();
            },
            onRefer: (refer) => {
                console.log('onRefer received : ', refer)
            }

        };
        //

    } catch (e) {
        console.log(e);
        error('generalError', loginid, "e", callback);
    }
}
window.addEventListener('beforeunload', (event) => {
    terminate_call();
    call_variable_array = {};
    dialogStatedata = null;
    invitedata = null;
    outboundDialingdata = null;



});
function loader3(callback) {
    if (!userAgent || !registerer) {
        error("invalidState", '', 'Invalid action logout', callback);
    } else {
        // Send un-REGISTER
        console.log(registerer.state);
        registerer.unregister()
            .then((request) => {
                console.log("Successfully sent un-REGISTER");
                console.log("Sent request = " + request);
            })
            .catch((error) => {
                console.error("Failed to send un-REGISTER", error);
                console.log("Failed to send un-REGISTER", error);
            });
    }

}
function error(type, loginid, cause, callback) {
    if (typeof callback !== 'function') {
        console.error("invalid call back function");
        return;
    }
    const sysdate = new Date();
    let datetime = sysdate.getFullYear() + '-' + (sysdate.getMonth() + 1) + '-' + sysdate.getDate() + ' ' + sysdate.getHours() + ':' + sysdate.getMinutes() + ':' + sysdate.getSeconds() + '.' + sysdate.getMilliseconds()
    let event = {
        "event": "Error",
        "response":
        {
            "type": type,
            "loginId": loginid,
            "description": cause,
            'event_time': datetime
        }
    };
    callback(event);
}
var errorsList = {

    Forbidden: "Invalid Credentials.Plese provide valid credentials.",
    Busy: "Device is busy",
    Redirected: "Redirected",
    Unavailable: "Unavailable",
    "Not Found": "Not Found",
    "Address Incomplete": "Address Incomplete",
    "Incompatible SDP": "Incompatible SDP",
    "Authentication Error": "Authentication Error",
    "Request Timeout": "The timeout expired for the client transaction before a response was received.",
    "Connection Error": "WebSocket connection error occurred.",
    "Invalid target": "The specified target can not be parsed as a valid SIP.URI",
    "SIP Failure Code": "A negative SIP response was received which is not part of any of the groups defined in the table below.",
    Terminated: "Session terminated normally by local or remote peer.",
    Canceled: "Session canceled by local or remote peer",
    "No Answer": "Incoming call was not answered in the time given in the configuration no_answer_timeout parameter.",
    Expires: "Incoming call contains an Expires header and the local user did not answer within the time given in the header",
    "No ACK": "An incoming INVITE was replied to with a 2XX status code, but no ACK was received.",
    "No PRACK": "An incoming iNVITE was replied to with a reliable provisional response, but no PRACK was received",
    "User Denied Media Access": "Local user denied media access when prompted for audio/video devices.",
    "WebRTC not supported": "The browser or device does not support the WebRTC specification.",
    "RTP Timeout": "There was an error involving the PeerConnection associated with the call.",
    "Bad Media Description": "Received SDP is wrong.",
    "‘Dialog Error": "	An in-dialog request received a 408 or 481 SIP error.",
};



// Number of times to attempt reconnection before giving up
const reconnectionAttempts = 10;
// Number of seconds to wait between reconnection attempts
const reconnectionDelay = 5;

// Used to guard against overlapping reconnection attempts
let attemptingReconnection = false;
// If false, reconnection attempts will be discontinued or otherwise prevented
let shouldBeConnected = true;

// Function which recursively attempts reconnection
const attemptReconnection = (reconnectionAttempt = 1) => {
    // If not intentionally connected, don't reconnect.
    if (!shouldBeConnected) {
        return;
    }

    // Reconnection attempt already in progress
    if (attemptingReconnection) {
        return;
    }

    // Reconnection maximum attempts reached
    if (reconnectionAttempt > reconnectionAttempts) {
        return;
    }

    // We're attempting a reconnection
    attemptingReconnection = true;

    setTimeout(() => {
        // If not intentionally connected, don't reconnect.
        if (!shouldBeConnected) {
            attemptingReconnection = false;
            return;
        }
        // Attempt reconnect
        userAgent.reconnect()
            .then(() => {
                // Reconnect attempt succeeded
                attemptingReconnection = false;
            })
            .catch((error) => {
                // Reconnect attempt failed
                console.log('error  ', error)
                attemptingReconnection = false;
                attemptReconnection(++reconnectionAttempt);
            });
    }, reconnectionAttempt === 1 ? 0 : reconnectionDelay * 1000);
};

function setupRemoteMedia(session) {

    var remoteVideo = document.getElementById('remoteVideo');
    var localVideo = document.getElementById('localVideo');

    var pc = session.sessionDescriptionHandler.peerConnection;
    var remoteStream;
    remoteStream = new MediaStream();
    var receiver = pc.getReceivers()[0];
    remoteStream.addTrack(receiver.track);
    remoteVideo.srcObject = remoteStream;


    var localStream_1;
    if (pc.getSenders) {
        localStream_1 = new window.MediaStream();
        pc.getSenders().forEach(function (sender) {
            var track = sender.track;
            if (track && track.kind === "video") {
                localStream_1.addTrack(track);
            }
        });
    }
    else {
        localStream_1 = pc.getLocalStreams()[0];
    }
    localVideo.srcObject = localStream_1;
}
function registrationFailed(response) {
    //console.log('helo ',msg);
    error("subscriptionFailed", loginid, errorsList[response.message.reasonPhrase], callbackFunction);
}
function getCallIndex(dialogId) {
    for (let index = 0; index < calls.length; index++) {
        var element = calls[index];
        if (element.dialogId == dialogId) {
            return index;
        }
    }
    return -1;
}
function checkUndefinedParams(func, params) {
    const paramNames = getParameterNames(func);
    const undefinedParams = [];

    paramNames.forEach((paramName, index) => {
        const paramValue = params[index];
        if (paramValue === undefined || paramValue === null || paramValue === "") {
            undefinedParams.push(paramName);
        }
    });

    return undefinedParams;
}

function getParameterNames(func) {
    const functionString = func.toString();
    const parameterRegex = /function\s*\w*\s*\(([\s\S]*?)\)/;
    const match = parameterRegex.exec(functionString);
    if (match && match[1]) {
        return match[1].split(',').map(param => param.trim());
    }
    return [];
}
