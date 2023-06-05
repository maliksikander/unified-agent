var ccassclient = null
var ua = null;
var sessionall = null;
var remotesession = null;
var sessiontwo = null;
var loginid = null;
var wrapupenabler = null;
var agentInfo = false;
var callbackFunction = null;

var useragentregister = false;
var callreject = false;
var call_variable_array = {};
var call_queue_uuid;
var ServerconfigParams = null;
var freeswitch_wssip = null;
var agentStatedata = null;
var dialogStatedata = null;
var invitedata = null;
var outboundDialingdata = null;
var freeswitch_domain = null;

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
          'localstream': null,
          'remotestream': null,
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
          'localstream': null,
          'remotestream': null,
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
          'localstream': null,
          'remotestream': null,
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
          freeswitch_domain = sipconfig.uri;
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
      initiate_call('sip:' + obj.parameter.calledNumber + "@" + sipconfig.uri, obj.parameter.clientCallbackFunction);
      break;
    case 'silentMonitor':
      console.log('Freeswitch do not support silentMonitor currently');
      break;
    case 'answerCall':
      respond_call();
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
      console.log('Freeswitch do not support makeConsult currently');
      break;
    case 'consultTransfer':
      console.log('Freeswitch do not support consultTransfer currently');
      break;
    case 'getTeamUsers':
      console.log('Freeswitch do not support getTeamUsers currently');
      break;
  }
}



function connect_useragent(username, sip_uri, sip_password, wss, sip_log, callback) {
  try {
    // if (!ua) {
    var config = {
      uri: "sip:" + username + "@" + sip_uri,
      authorizationUser: username,
      password: sip_password,
      displayName: username,
      log: {
        builtinEnabled: sip_log,
        level: 3 // log log level
      },
      transportOptions: {
        wsServers: [wss], // wss Protocol
        traceSip: true,// open sip logs for troubleshooting
        reconnectionAttempts: 5, // Number of reconnection attempts
        reconnectionDelay: 30000, // Delay between reconnection attempts in milliseconds
        connectionTimeout: 40,
        reconnectionTimeout: 30000,
        maxReconnectionAttempts: 10,
        //keepAliveInterval: 30

      },
      registerOptions: {
        expires: 600,
        keepAliveInterval: 30 // Send an OPTIONS request every 30 seconds to keep the registration alive
      },
      allowLegacyNotifications: true,
      hackWssInTransport: true, // set true to transport = wss registration; false: transport = ws;
      // connectionTimeout: 15,
      // reconnectionTimeout: 15,
      // maxReconnectionAttempts: 5,
      // dtmfType:SIP.C.dtmfType.RTP,
      hackIpInContact: sip_uri,
      userAgentString: "SIP.js/0.15.11-CTI/Expertflow",
      register: true,
      autostart: true,
      // contactName: username
    };

    ua = new SIP.UA(config);
    // } else {
    //     error('invalidState', loginid, "invalid action login", callback);
    // }

  } catch (errorr) {
    if (errorr instanceof SIP.Exceptions.ConfigurationError) {
      console.error('SIP.js configuration error:', errorr.message);
      error("subscriptionFailed", username, errorr.message, callback);
      // Handle the configuration error here
    } else {
      console.error('Unexpected error:', errror);
      error("subscriptionFailed", username, errror.message, callback);
      // Handle other types of errors here
    }
  }
  if (ua !== null && ua !== undefined) {
    try {
      ua.start();


      // accept inbound (user agent server) session
      ua.on('invite', function (session) {

        //
        console.log('userregisted invite');

        invitedata = invitedata1;

        var sip_from = session.request.headers.From[0].raw.split(" <")
        var variablelist = sip_from[0].substring(1, sip_from[0].length - 1).split("|")
        const sysdate = new Date();
        var datetime = sysdate.toISOString();

        var dnis = sip_from[1].split(">;")[0]
        // dialedNumber = session.request.data;
        // if (dialedNumber.includes("caller_destination:")) {
        //     dialedNumber = dialedNumber.split("caller_destination:")[1].split('X-FS-Support')[0].replace(/\s/g, '');
        // } else {
        //     dialedNumber = loginid;
        // }

        dialedNumber = session.request.headers["X-Destination-Number"];
        dialedNumber = dialedNumber != undefined ? dialedNumber[0].raw : loginid;

        call_variable_array = [];
        if (variablelist.length === 1) {
          if (variablelist[0].replace(/['"]+/g, '') == 'conference') {

            call_variable_array.push({
              "name": 'callVariable0',
              "value": ''
            })
            for (let index = 1; index < 10; index++) {
              if (session.request.headers['X-Call-Variable' + index]) {
                call_variable_array.push({
                  "name": 'callVariable' + index,
                  "value": session.request.headers['X-Call-Variable' + index][0]['raw']
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
              "value": session.request.headers['X-Call-Variable0'][0]['raw']
            })
            for (let index = 1; index < 10; index++) {
              if (session.request.headers['X-Call-Variable' + index]) {
                call_variable_array.push({
                  "name": 'callVariable' + index,
                  "value": session.request.headers['X-Call-Variable' + index][0]['raw']
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
        if (session.incomingRequest) {
          if (session.request.from._displayName === 'conference') {
            dialogStatedata.response.dialog.callType = 'conference';
            invitedata.response.dialog.callType = 'conference';

          } else {
            dialogStatedata.response.dialog.callType = 'OTHER_IN'
            invitedata.response.dialog.callType = 'OTHER_IN';

          }
        }
        console.log('Sip Call Request sip==>',session);
        console.log('Sip Call Request sip==>',session.request);
        dialogStatedata.response.dialog.callVariables.CallVariable = call_variable_array;
        dialogStatedata.response.loginId = loginid;
        dialogStatedata.response.dialog.id = session.request.headers["Call-ID"][0].raw;
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

        invitedata.response.dialog.callVariables.CallVariable = call_variable_array;
        invitedata.response.loginId = loginid;
        invitedata.response.dialog.dnis = dialedNumber;
        invitedata.response.dialog.id = session.request.headers["Call-ID"][0].raw;
        invitedata.response.dialog.ani = dnis.split('sip:')[1].split('@')[0];
        invitedata.response.dialog.fromAddress = dnis.split('sip:')[1].split('@')[0];
        invitedata.response.dialog.customerNumber = dnis.split('sip:')[1].split('@')[0];
        invitedata.response.dialog.participants[0].mediaAddress = loginid;
        invitedata.response.dialog.participants[0].startTime = datetime;
        invitedata.response.dialog.participants[0].stateChangeTime = datetime;
        invitedata.response.dialog.participants[0].state = "ALERTING";
        invitedata.response.dialog.state = "ALERTING";
        invitedata.response.dialog.dialedNumber = dialedNumber;



        // ccassclient.emit('event',JSON.parse(JSON.stringify(invitedata)));
        //ccassclient.emit('event',JSON.parse(JSON.stringify(dialogStatedata)));
        callback(JSON.parse(JSON.stringify(invitedata)));
        // console.log(event);
        remotesession = session;
        sessionall = session;
        addsipcallback(session, 'inbound', callback);
      });

      ua.on('connected', function (data) {
        console.log(' connected unregistered', data);
      });

      ua.on('registered', function (data) {
        if (dialogStatedata == null)
          dialogStatedata = dialogStatedata1;
        loginid = username;
        dialogStatedata.response.loginId = username;
        console.log(' connected registered', data);
        var event = {
          "event": "agentInfo",
          "response": {
            "loginId": username,
            "extension": username,
            "state": "LOGIN",
            cause: null
          }
        };
        if (!agentInfo) {
          callback(event);
          callback({
            "event": "dialogState",
            "response": {
              "loginId": username,
              "dialog": null
            }
          });
          agentInfo = true;
        }
      });

      ua.on('unregistered', function (data, cause) {
        dialogStatedata.response.loginId = null;
        loginid = null;
        agentInfo = false;
        SIP;
        console.log('  unregistered', data);
        console.log('  unregistered', cause);
        if (cause == undefined)
          cause = null;
        // const online = navigator.onLine;
        // console.log(online);
        var event = {
          "event": "agentInfo",
          "response": {
            "loginId": username,
            "extension": username,
            "state": "LOGOUT",
            "cause": cause
          }
        };
        callback(event);
        loader2();
        loader1();
      });
      ua.on('registrationFailed', function (data, cause) {
        // dialogStatedata.response.loginId = null;
        // loginid = null;
        console.log('  registrationFailed', cause);
        console.log('  registrationFailed', data);
        error("subscriptionFailed", username, errorsList[cause], callback);
        agentInfo = false;
      });
      ua.transport.on('connecting', () => {
        console.log('Transport is connecting...');
        // Handle the connecting event
      });
      ua.transport.on('connected', () => {
        console.log('Transport is connected');
        // Handle the connected event
      });
      ua.transport.on('transportError', (errorr) => {
        console.error('Transport error:', errorr);
        // Handle the transportError event
      });
      ua.transport.on('message', (message) => {
        console.log('Received message:', message);
        // Handle the received message
      });
      ua.transport.on('backoff', () => {
        console.log('Transport is in backoff state');
        // Handle the backoff event
      });
      ua.transport.on('nomoretransport', () => {
        console.log('No more available transports');
        // Handle the nomoretransport event
      });
      ua.transport.on('detected', () => {
        console.log('Network connection status changed');
        // Handle the detected event
      });
      ua.transport.on('reconnected', () => {
        console.log('Transport reconnected');
        // Handle the reconnected event
      });
      ua.transport.on('disconnected', (event) => {
        console.error('SIP.js disconnected: ,', event.code);

      });
      ua.transport.on('close', (event) => {
        console.log(' WebSocket connection closed:', event.code, event.reason);

        // Handle WebSocket connection closed error
        // Example: Attempt to reconnect
        ua.transport.connect();
      });
    } catch (e) {
      console.error(' ', e);
    }
  }


}
function initiate_call(sip_id, callback) {

  if (ua !== null && ua !== undefined) {
    if (ua.isRegistered()) {
      try {
        sessionall = ua.invite(sip_id, {
          sessionDescriptionHandlerOptions: {
            constraints: {
              audio: true,
              video: false
            },
            alwaysAcquireMediaFirst: true // This parameter is sip.js official fix the bug in firefox encounter set
          }

        });
        outboundDialingdata = outboundDialingdata1;
        addsipcallback(sessionall, 'outbound', callback);
      } catch (errorr) {
        if (errorr instanceof TypeError && errorr.message === 'Invalid target') {
          // Handle the "Invalid target" error
          console.error('Invalid target error:', errorr);
          error('generalError', loginid, errorr.message, callback);
          // Additional error handling logic or fallback actions
        } else {
          // Handle other types of errors
          error('generalError', loginid, errorr.message, callback);
        }
      }
    }
  }
  else {
    error('invalidState', loginid, "invalid action makeCall", callback);
  }

}
function terminate_call() {
  if (!sessionall) {
    if (typeof callbackFunction === "function")
      error('invalidState', loginid, "invalid action releaseCall", callbackFunction);
    return;
  } else if (sessionall.startTime) { // Connected
    sessionall.bye();
  } else if (sessionall.reject) { // Incoming
    sessionall.reject();
  } else if (sessionall.cancel) { // Outbound
    sessionall.cancel();
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
function blind_transfer(sip_id, userdata) {
  if (!sessionall) {
    return;
  }

  sessionall.refer(sip_id, {
    // Example of extra headers in REFER request
    requestOptions: {

    },
    activeAfterTransfer: false,
    receiveResponse: function (msg, ss) {
      console.log("testing msg" + msg);
      console.log("testing ss" + ss);
    }
  });
}
function phone_hold(callback) {
  if (!sessionall || sessionall.localHold) {
    error('invalidState', loginid, "invalid action holdCall", callback);
    return;
  }
  sessionall.hold();
  setTimeout(() => {
    if (sessionall.localHold || sessionall.remoteHold) {
      const sysdate = new Date();
      var datetime = sysdate.toISOString();
      dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
      dialogStatedata.response.dialog.participants[0].state = "HELD";
      dialogStatedata.response.dialog.state = "HELD";
      dialogStatedata.response.dialog.isCallAlreadyActive = true;
      if (typeof callback === 'function') {
        callback(dialogStatedata);
      }
    } else {
      error('invalidState', loginid, "some issue while holding call", callback);
    }
  }, 500);

}
function phone_unhold(callback) {
  if (!sessionall || !sessionall.localHold) {
    error('invalidState', loginid, "invalid action retrieveCall", callback);
    return;
  }
  sessionall.unhold();
  setTimeout(() => {
    if (sessionall.localHold || sessionall.remoteHold) {
      error('invalidState', loginid, "some issue while retrieving call", callback);
    } else {
      const sysdate = new Date();
      var datetime = sysdate.toISOString();

      dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
      dialogStatedata.response.dialog.participants[0].state = "ACTIVE";
      dialogStatedata.response.dialog.state = "ACTIVE";
      dialogStatedata.response.dialog.isCallAlreadyActive = true;
      if (typeof callback === 'function') {
        callback(dialogStatedata);
      }
    }
  }, 500);

}
function phone_mute(callback) {
  if (!sessionall) {
    //console.warn("No session to toggle mute");
    error('invalidState', loginid, "invalid action mute_call", callback);
    return;
  }

  var pc = sessionall.sessionDescriptionHandler.peerConnection;
  if (pc.getSenders) {
    pc.getSenders().forEach(function (sender) {
      if (sender.track) {
        sender.track.enabled = false;
      }
    });
  } else {
    pc.getLocalStreams().forEach(function (stream) {
      stream.getAudioTracks().forEach(function (track) {
        track.enabled = false;
      });
      stream.getVideoTracks().forEach(function (track) {
        track.enabled = false;
      });
    });
  }

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

  var pc = sessionall.sessionDescriptionHandler.peerConnection;
  if (pc.getSenders) {
    pc.getSenders().forEach(function (sender) {
      if (sender.track) {
        sender.track.enabled = true;
      }
    });
  } else {
    pc.getLocalStreams().forEach(function (stream) {
      stream.getAudioTracks().forEach(function (track) {
        track.enabled = true;
      });
      stream.getVideoTracks().forEach(function (track) {
        track.enabled = true;
      });
    });
  }


  const sysdate = new Date();
  var datetime = sysdate.toISOString();
  dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
  dialogStatedata.response.dialog.participants[0].mute = false;
  if (typeof callback === 'function') {
    callback(dialogStatedata);
  }
}
function respond_call() {
  if (!remotesession || remotesession.status === SIP.Session.C.STATUS_CONFIRMED) {
    if (typeof callbackFunction === "function")
      error('invalidState', loginid, "invalid action answerCall", callbackFunction);
    return;
  }
  // answer a call
  if (remotesession.status === SIP.Session.C.STATUS_CONFIRMED) {
    console.log('Call already answered');
  } else {
    var sdp = remotesession.request.body;
    var offeredAudio = false, offeredVideo = false;

    if ((/\r\nm=audio /).test(sdp)) {
      offeredAudio = true;
    }

    if ((/\r\nm=video /).test(sdp)) {
      offeredVideo = true;
    }
    remotesession.accept({
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: offeredAudio,
          video: false
        }
      }
    });
    video = true;
    sessionall = remotesession;
  }


}
function addsipcallback(temp_session, call_type, callback) {
  // Set a timeout for the response
  //   const responseTimeout = setTimeout(() => {
  //     if (temp_session.status === SIP.Session.C.STATUS_INVITE_SENT) {
  //       console.log('Call request timed out');
  //       temp_session.terminate();
  //     }
  //   }, 10000); // 10 seconds timeout (adjust as needed)
  try {
    temp_session.on('confirmed', function (response, cause) {
      console.log(' session confirmed.');
    });

    temp_session.on('accepted', function (data, cause) {
      console.log('accepted');
      //clearTimeout(responseTimeout);


      var pc = temp_session.sessionDescriptionHandler.peerConnection;
      var remoteStream;
      remoteStream = new MediaStream();
      pc.getReceivers().forEach((receiver) => {
        if (receiver.track) {
          console.log(receiver.track);
          remoteStream.addTrack(receiver.track);
        }
      });
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
      var call_type1;
      if (temp_session.incomingRequest) {
        if (temp_session.request.from._displayName === 'conference') {
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


      var event = {
        'event': 'call_event',
        'response':
        {
          'calling_ani': temp_session.session.remoteURI.toString().split('sip:')[1],
          'returncode': '0',
          'returndesc': 'accepted',
          'session_uuid': '',
          'call_variable_array': '',
          'call_type': call_type1,
          'localstream': localStream_1,
          'remotestream': remoteStream,
          'cause': '',
          'event_time': datetime
        }
      };

      // console.log(event);
      if (call_type != 'inbound') {
        call_variable_array = [];
        if (data.headers['X-Call-Variable0']) {
          event.response.session_uuid = data.headers['X-Call-Variable0'][0]['raw']
          call_variable_array.push({
            "name": 'callVariable0',
            "value": data.headers['X-Call-Variable0'][0]['raw']
          })
        } else {
          callVariable_array.push({
            "name": 'callVariable0',
            "value": ''
          })
        }
        for (let index = 1; index < 10; index++) {
          if (data.headers['X-Call-Variable' + index]) {
            call_variable_array.push({
              "name": 'callVariable' + index,
              "value": data.headers['X-Call-Variable' + index]
            })
          }
        }
        event.response.call_variable_array = call_variable_array
        dialogStatedata.response.dialog.callVariables.CallVariable = call_variable_array;
        dialogStatedata.response.dialog.id = data.headers['Call-ID'][0]['raw'];
        dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
        dialogStatedata.response.dialog.participants[0].state = "ACTIVE";
        dialogStatedata.response.dialog.state = "ACTIVE";
      } else {
        dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
        // dialogStatedata.response.dialog.id = data.split("Call-ID: ")[1].split("\n")[0];
        dialogStatedata.response.dialog.participants[0].state = "ACTIVE";
        dialogStatedata.response.dialog.state = "ACTIVE";
        dialogStatedata.response.dialog.isCallEnded = 0;

      }
      var dialogstatemedia = JSON.parse(JSON.stringify(dialogStatedata));
      dialogstatemedia.response.dialog.participants[0].localstream = localStream_1;
      dialogstatemedia.response.dialog.participants[0].remotestream = remoteStream;
      dialogstatemedia.response.dialog.participants[0].mute = false;
      callback(dialogstatemedia)
    });

    temp_session.on('bye', function (response, cause) {
      console.log(' bye', response);
      console.log(' bye', cause);
      //clearTimeout(responseTimeout);
      // Ringfunction();
      var event = {
        'event': 'session-bye',
        'response':
        {
          'calling_ani': temp_session.session.remoteURI.toString().split('sip:')[1],
          'returncode': '1',
          'returndesc': 'session-bye',
          'cause': cause
        }
      };
    });
    temp_session.on('rejected', function (response, cause) {
      console.log(' rejected', cause);
      console.log(' rejected', response);
      // clearTimeout(responseTimeout);
      const sysdate = new Date();
      var datetime = sysdate.toISOString();
      var ani;
      if (temp_session.session) {
        ani = temp_session.session.remoteURI.toString().split('sip:')[1];
      } else {
        //  ani = response.to.toString().replace(/<sip:|>/g, "").split(';')[0];
      }
      var call_type1;
      if (temp_session.incomingRequest) {
        // console.log(sessionall.request.from._displayName)
        if (temp_session.request.from._displayName === 'conference') {
          call_type1 = 'conference'
        } else {
          call_type1 = 'incoming'
        }
      } else {
        call_type1 = 'outbound'
      }

      // console.log(event);
      // ccassclient.emit('event',event);
      dialogStatedata.response.dialog.participants[0].localstream = null;
      dialogStatedata.response.dialog.participants[0].remotestream = null;
      dialogStatedata.response.dialog.participants[0].mute = false;
      dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
      dialogStatedata.response.dialog.participants[0].state = "DROPPED";
      dialogStatedata.response.dialog.state = "DROPPED";
      // ccassclient.emit('event',JSON.parse(JSON.stringify(dialogStatedata)));
      //callback(JSON.parse(JSON.stringify(dialogStatedata)));

    });
    temp_session.on('failed', function (response, cause) {
      // Ringfunction();
      console.log(' failed ', cause);
      console.log(' failed ', response);
      //clearTimeout(responseTimeout);
      const sysdate = new Date();
      var datetime = sysdate.toISOString();

      var ani;
      if (temp_session.session) {
        ani = temp_session.session.remoteURI.toString().split('sip:')[1];
      } else {
        //  ani = response.to.toString().replace(/<sip:|>/g, "").split(';')[0];
      }
      var call_type1;
      if (temp_session.incomingRequest) {
        // console.log(sessionall.request.from._displayName)
        if (temp_session.request.from._displayName === 'conference') {
          call_type1 = 'conference'
        } else {
          call_type1 = 'incoming'
        }
      } else {
        call_type1 = 'outbound'
      }
      // dialogStatedata.response.dialog.participants[0].localstream = null;
      // dialogStatedata.response.dialog.participants[0].remotestream = null;
      // dialogStatedata.response.dialog.participants[0].mute = false;
      // dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
      // dialogStatedata.response.dialog.participants[0].state = "DROPPED";
      // dialogStatedata.response.dialog.state = "FAILED-DROPPED";
      if (response && response.reasonPhrase) {
        dialogStatedata.response.dialog.callEndReason = response.reasonPhrase;
        error('generalError', loginid, response.reasonPhrase, callback);

      } else if (cause) {
        dialogStatedata.response.dialog.callEndReason = cause;
        error('generalError', loginid, cause, callback);
      }

      // callback(JSON.parse(JSON.stringify(dialogStatedata)));

    });
    temp_session.on('progress', function (response, cause) {
      console.log('progress');

      if (temp_session.outgoingInviteRequest) {
        const sysdate = new Date();
        var datetime = sysdate.toISOString();

        var event = {
          'event': '',
          'response':
          {
            'returncode': response.statusCode,
            'returndesc': response.reasonPhrase,
            'event_time': datetime
          }
        };
        sip_to_uri = response.to.toString().replace(/<sip:|>/g, "").split(';')[0];
        dialedNumber = sip_to_uri.split('@')[0];
        if (sip_to_uri.slice(0, 3) === "*33") {
          event['event'] = 'eavesdrop_call';
          event['response']['calling_ani'] = sip_to_uri.slice(3);
          // ccassclient.emit('event',event);
        } else {
          event['event'] = 'outbound_call';
          event['response']['calling_ani'] = sip_to_uri;
          dialogStatedata.response.loginId = loginid;
          dialogStatedata.response.dialog.fromAddress = loginid;
          dialogStatedata.response.dialog.callType = 'OUT';
          dialogStatedata.response.dialog.ani = sip_to_uri.split('@')[0];
          dialogStatedata.response.dialog.id = response.headers['Call-ID'][0]['raw'];
          dialogStatedata.response.dialog.dialedNumber = dialedNumber;
          dialogStatedata.response.dialog.fromAddress = sip_to_uri.split('@')[0];
          dialogStatedata.response.dialog.customerNumber = sip_to_uri.split('@')[0];
          dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
          //change dialogStatedata.response.dialog.participants[0].mediaAddress = agentlogindata.agent_contact.split('/')[1].split('@')[0];

          outboundDialingdata.response.loginId = loginid;
          outboundDialingdata.response.dialog.fromAddress = loginid;
          outboundDialingdata.response.dialog.callType = 'OUT';
          outboundDialingdata.response.dialog.ani = sip_to_uri.split('@')[0];
          outboundDialingdata.response.dialog.dnis = "911";
          outboundDialingdata.response.dialog.id = response.headers['Call-ID'][0]['raw'];
          outboundDialingdata.response.dialog.dialedNumber = dialedNumber;
          outboundDialingdata.response.dialog.customerNumber = sip_to_uri.split('@')[0];
          outboundDialingdata.response.dialog.participants[0].mediaAddress = loginid;
          outboundDialingdata.response.dialog.participants[0].startTime = datetime;
          outboundDialingdata.response.dialog.participants[0].stateChangeTime = datetime;
          if (response.statusCode == 100) {
            outboundDialingdata.response.dialog.participants[0].startTime = datetime;
            outboundDialingdata.response.dialog.participants[0].state = "INITIATING";
            outboundDialingdata.response.dialog.state = "INITIATING";

            dialogStatedata.response.dialog.participants[0].startTime = datetime;
            dialogStatedata.response.dialog.participants[0].state = "INITIATING";
            dialogStatedata.response.dialog.state = "INITIATING";
            // ccassclient.emit('event',JSON.parse(JSON.stringify(outboundDialingdata)));

          } else {
            dialogStatedata.response.dialog.participants[0].state = "INITIATED";
            dialogStatedata.response.dialog.state = "INITIATED";
            outboundDialingdata.response.dialog.participants[0].startTime = datetime;
            outboundDialingdata.response.dialog.participants[0].state = "INITIATED";
            outboundDialingdata.response.dialog.state = "INITIATED";
            // ccassclient.emit('event',JSON.parse(JSON.stringify(dialogStatedata)));
          }

          callback(JSON.parse(JSON.stringify(outboundDialingdata)));
        }


      }


    });
    temp_session.on("terminated", function (response, cause) {
      console.log('terminated', response);
      console.log('terminated', cause);
      // clearTimeout(responseTimeout);
      var ani;
      if (temp_session.session) {
        ani = temp_session.session.remoteURI.toString().split('sip:')[1];
      } else {
        // ani = response.to.toString().replace(/<sip:|>/g, "").split(';')[0];
      }
      const sysdate = new Date();
      var datetime = sysdate.toISOString();


      if (dialogStatedata != null) {
        dialogStatedata.response.dialog.participants[0].localstream = null;
        dialogStatedata.response.dialog.participants[0].remotestream = null;
        dialogStatedata.response.dialog.participants[0].mute = false;
        dialogStatedata.response.dialog.participants[0].stateChangeTime = datetime;
        dialogStatedata.response.dialog.participants[0].state = "DROPPED";
        if (response && response.reasonPhrase) {
          dialogStatedata.response.dialog.callEndReason = response.reasonPhrase;

        } else if (cause) {
          dialogStatedata.response.dialog.callEndReason = cause;

        }
        //  else {
        //     dialogStatedata.response.dialog.state = "DROPPED";
        //     dialogStatedata.response.dialog.callEndReason = null;
        //     dialogStatedata.response.dialog.isCallAlreadyActive = false;
        //     dialogStatedata.response.dialog.isCallEnded = 1;
        // }
        dialogStatedata.response.dialog.isCallEnded = 1;
        dialogStatedata.response.dialog.state = "DROPPED";
        dialogStatedata.response.dialog.isCallAlreadyActive = false;
        callback(JSON.parse(JSON.stringify(dialogStatedata)));

      }
    });
  } catch (e) {
    console.log(e);
  }

  // temp_session.on("cancel", function (response, cause) {
  //     console.log(' canceld')
  // });
  // temp_session.on("reinvite", function (response, cause) {
  //     console.log(' reinvite')
  // });


}
// window.addEventListener('beforeunload', (event) => {
//     if (useragentregister) {
//         terminate_current_session();
//     }

//     useragentregister = false;
//     callreject = false;
//     call_variable_array = {};
//     agentStatedata = null;
//     dialogStatedata = null;
//     invitedata = null;
//     outboundDialingdata = null;

// });
function loader1() {
  ua.stop();
  ua = null;
}
function loader2() {
  ua.transport.disconnect();
}
function loader3(callback) {
  if (!ua || !ua.isRegistered) {
    error("invalidState", '', 'Invalid action logout', callback);
  } else {
    var options = {
      'all': true
    };
    ua.unregister(options);
  }

}
function terminate_current_session() {
  Promise.all([loader1(), loader2(), loader3()]).then((value) => {
    if (useragentregister) {

      useragentregister = false;
      callreject = false;
      call_variable_array = {};
      agentStatedata = null;
      dialogStatedata = null;
      invitedata = null;
      outboundDialingdata = null;
      sipconfig = {};
      sessionall = null;

    }

  })


}
// function widgetConfigs(ccmUrl, widgetIdentifier, callback) {
//     // fetch(`${ccmUrl}/widget-configs/${widgetIdentifier}`)
//     fetch(`${ccmUrl}/widget-configs`)
//         .then(response => response.json())
//         .then((data) => {
//             if (data.webRTC.uriFS) {
//                 callback(data);
//                 sipconfig.wss = data.webRTC.wssFS;
//                 sipconfig.uri = data.webRTC.uriFS;
//                 sipconfig.enable_sip_log = data.webRTC.enable_sip_logFS;
//             }
//         }).catch(errorr => {
//             error('invalidState', loginid, "There was an error retrieving the configurational data.", callback);

//         });
// }
function error(type, loginid, cause, callback) {
  const sysdate = new Date();
  let datetime = sysdate.toISOString();
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

  Rejected: "Invalid Credentials.Plese provide valid credentials.",
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
