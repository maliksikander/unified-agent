
var params = {};
var callbacks = {};
var notReadyReasons = [];
var _jwClient;
var xmppClient;
var finesseFlavor = config.finesseFlavor;
var isRefreshCase = false;
var prevAgentState = null;
var failoverReconnect = false;
var heartbeatReceived = false;
var currentDomain = null;
var outOfService = false;
var xmmpConnectionStatus = null;
var isSSOAgent = false;

$(document).ready(function ()
//$(window).load(function()
{
  console.log("Window onload called");
  if (window.jabberwerx) {
    _jwClient = new jabberwerx.Client("cisco");
  }

  //Refresh case
  try {
    var logoutFlag = localStorage.getItem("logoutFlag");
    if (logoutFlag == "false" && localStorage.getItem("loginParameters")) {
      var loginParameters = JSON.parse(localStorage.getItem("loginParameters"));
      console.log(loginParameters);
      var isSSOAgent = loginParameters.parameter.isSSOUser;
      console.log(isSSOAgent);
      console.log(typeof (isSSOAgent));
      if (isSSOAgent && (isSSOAgent == "true" || isSSOAgent == true)) {
        console.log("This is sso user, going to get sso user from local storage");
        isRefreshCase = true;
        var parameter = JSON.parse(localStorage.getItem("ssoUser"));
        parameter.clientCallbackFunction = window[parameter.clientCallbackFunction];
        parameter.isSSOUser = true;
        var parameters = { "parameter": parameter };
        console.log("Got parameters ", parameters);
        login(parameters);
        //login(parameters, "refresh");
      }
      else {
        console.log("this isn't sso user");
        var parameters = JSON.parse(localStorage.getItem("loginParameters"));
        loginRefreshCase(parameters);
      }
    }
  }
  catch (err) {
    console.error(err);
  }
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
      if (config.getQueuesDelay > 0 && config.getQueuesDelay < 10000) {
        setInterval(() => {
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
    /*case "refreshUserToken":
        refreshUserToken(commandRequest);
        break;*/
  }
}

function initialize(parameters) {
  try {
    var authcode = parameters.parameter.loginId + ":" + parameters.parameter.password;
    const encodedData = window.btoa(authcode);
    var domain = getDomain();
    console.log("Got domain: " + domain);

    params =
    {
      encodedData: encodedData,
      domain: domain,
      teamId: null,
      extension: parameters.parameter.extension,
      username: parameters.parameter.loginId,
      password: parameters.parameter.password,
      boshUrl: null,
    }
    callbacks = {
      "apiCallbackFunction": apiResponseCallback,
      "eventCallbackFunction": eventCallback,
      "clientCallbackFunction": parameters.parameter.clientCallbackFunction,
    }
    return params;
  }
  catch (err) {
    console.error(err.message);
  }
}


var eventCallback = function (data) {
  var event = _eventHandler(data);
  callbacks.clientCallbackFunction(event);
  return;
}

var apiResponseCallback = function (data) {
  var response = apiResponseHandler(data);
  console.log(response);

  if (response.length && response.length == 2 && response[0].response.dialog != undefined && response[1].response.dialog != undefined) {
    callbacks.clientCallbackFunction(response[0]);
    callbacks.clientCallbackFunction(response[1]);
  }
  else
    callbacks.clientCallbackFunction(response);

  return;
}


function getDomain() {
  try {
    if (currentDomain)
      return currentDomain;
    else {
      var currentDomainStorage = localStorage.getItem("currentDomain");
      if (currentDomainStorage && (currentDomainStorage == config.domain || currentDomainStorage == config.subDomain)) {
        currentDomain = currentDomainStorage;
        return currentDomainStorage;
      }
      return config.domain;
    }
  }
  catch (err) {
    console.error(err);
  }
}

function switchDomain() {
  if (failoverReconnect == true) {
    switch (params.domain) {
      case config.domain:
        params.domain = config.subDomain;
        return config.subDomain;
      case config.subDomain:
        params.domain = config.domain;
        return config.domain;

    }
  }
  return config.domain;
}

function getBoshUrl() {
  if (currentDomain)
    return "https://" + currentDomain + ":7443/http-bind/";
  return config.boshUrl;
}

function switchBoshUrl() {
  if (failoverReconnect == true) {
    switch (params.boshUrl) {
      case config.boshUrl:
        params.boshUrl = config.subBoshUrl;
        return config.subBoshUrl;
      case config.subBoshUrl:
        params.boshUrl = config.boshUrl;
        return config.boshUrl;
    }
  }
  return config.boshUrl;
}

function manageSubscribed(teamEvent) {
  try {
    localStorage.setItem("teamId", params.teamId);
    teamEvent.response.result = "Subscribed";
    teamEvent.response.teamId = params.teamId;
    callbacks.clientCallbackFunction(teamEvent);
    return;
  }
  catch (err) {
    console.error(err);
  }
}

function manageUnsubscribed(teamEvent) {
  try {
    teamEvent.response.result = "Unsubscribed";
    teamEvent.response.teamId = localStorage.getItem("teamId");
    callbacks.clientCallbackFunction(teamEvent);
    localStorage.setItem("teamId", null);

    var isLogoutFlag = localStorage.getItem("logoutFlag");
    if (isLogoutFlag && isLogoutFlag == "false") {
      subscribeToTeam();
      return;
    }
    params.teamId = null;
    return;
  }
  catch (err) {
    console.error(err);
  }
}

function teamCallbackNode(nodeEvent) {
  var stringEvent = new XMLSerializer().serializeToString(nodeEvent);

  var teamEvent =
  {
    "event": "teamEvent",
    "response": {
      "loginId": params.username,
      "result": "",
      "teamId": "",
    }
  }
  if (stringEvent.includes('type="result"') && stringEvent.includes('subscription="subscribed"')) {
    manageSubscribed(teamEvent);
    return;
  }
  else if (stringEvent.includes('type="result"')) {
    manageUnsubscribed(teamEvent)
    return;
  }

  sendTeamErrorstoClient("invalidRequest", "Invalid data for the request");
  return;
}

function loginRefreshCase(parameters) {
  isRefreshCase = true;
  parameters.parameter.clientCallbackFunction = window[parameters.parameter.clientCallbackFunction];
  executeCommands(parameters);
}

function processTokenLogin(token) {
  try {
    if (token.error == undefined && !token.includes("Error while executing")) {
      console.log("[login] token: ", token);
      setUsersLocalStorage({ "loginId": params.username, "password": params.password, "extension": params.extension, "clientCallbackFunction": callbacks.clientCallbackFunction.name });
      params.password = token;
      isSSOAgent = true;
      console.log("username: ", params.username);
      params.username = params.username.split("@")[0];
      console.log("username: ", params.username);
    }
    else if (token.error != undefined)
      apiErrors({ status: token.status }, token, callbacks.apiCallbackFunction);
    else
      apiErrors({ status: 417 }, token, callbacks.apiCallbackFunction);
  }
  catch (err) {
    console.error(err);
  }
}

function trimUsername(loginId) {
  var username = loginId;
  if (username.includes("@")) {
    username = username.split("@")[0];
  }
  return username;
}

async function login(parameters) {

  if (parameters.parameter.isSSOUser && config.isGadget == false) {
    var token = await getSSOToken(parameters, "login");
    processTokenLogin(token);
    parameters.parameter.password = token;
  }
  else if (parameters.parameter.isSSOUser && config.isGadget == true) { isSSOAgent = true; }
  if (config.finesseFlavor == "UCCE") {
    parameters.parameter.loginId = await getUserIdFinesseObject(parameters);
    console.log("userId: ", parameters.parameter.loginId);
  }
  else
    parameters.parameter.loginId = trimUsername(parameters.parameter.loginId);
  initialize(parameters);

  //error handling
  if (!params.username) {
    throwInvalidCredentialsError();
    return;
  }

  //if(xmmpConnectionStatus == jabberwerx.Client.status_connected && isSSOAgent){
  //console.log("Xmpp connection is connected");
  //return;
  //}

  if (window.jabberwerx) {
    console.log("username: ", params.username);
    jid = params.username + "@" + params.domain,
      _jwClient = new jabberwerx.Client("cisco");

    var boshUrl = getBoshUrl();
    console.log("Got boshUrl: " + boshUrl);
    jabberwerx._config.httpBindingURL = boshUrl;
    jabberwerx._config.httpBindingURL_secondary = config.subBoshUrl;
    jabberwerx._config.baseReconnectCountdown = 0;

    jwArgs =
    {
      httpBindingURL: boshUrl,
      serviceDiscoveryEnabled: true,
      baseReconnectCountdown: 0,
      errorCallback: onClientError,
      successCallback: function () {
        params.boshUrl = boshUrl;
        setLocalStorage(parameters);
        var xmpppEvent = getXMPPConnectedEvent();
        callbacks.eventCallbackFunction(xmpppEvent);

        if (isRefreshCase == false && failoverReconnect == false) {
          console.log("Will perform login as this is not refresh case");
          loginUser();
        }
        else {
          if (failoverReconnect == true)
            console.log("Will not login as failover case");
          else {
            console.log("Will not login as refresh case");
            isRefreshCase = false;
          }
          getState("login");
        }

        xmppClient = _jwClient;
      }
    };
    jabberwerx._config.unsecureAllowed = true;
    _jwClient.event("messageReceived").bindWhen("event[xmlns='http://jabber.org/protocol/pubsub#event'] items item notification", callbacks.eventCallbackFunction);
    _jwClient.event("clientStatusChanged").bind(function (evt) {
      console.log(evt.data.next);
      xmmpConnectionStatus = evt.data.next;
      if (evt.data.next == jabberwerx.Client.status_connected) {
        var xmpppEvent = getXMPPConnectedEvent();
        callbacks.eventCallbackFunction(xmpppEvent);
      }
      else if (evt.data.next == jabberwerx.Client.status_disconnected) {
        var strEvent = evt.data.error.innerHTML;
        var contains_error_unreachable = strEvent.includes("service-unavailable");
        if (contains_error_unreachable || strEvent.includes("remote-server-timeout")) {
          processServiceUnreachable();
          var xmpppEvent = getXMPPDisconnectedEvent();
          callbacks.eventCallbackFunction(xmpppEvent);
        }
        else {
          var xmpppEvent = getXMPPDisconnectedEvent();
          callbacks.eventCallbackFunction(xmpppEvent);
        }
      }
    });
    //console.log(jid);
    //console.log(parameters.parameter.password);
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

function getXMPPDisconnectedEvent() {
  var xmpppEvent =
  {
    "event": "xmppEvent",
    "response": {
      "loginId": params.username,
      "type": "xmppStatus",
      "description": "XMPP Status is Disconnected!",
    }
  }
  return xmpppEvent;
}

function processServiceUnreachable() {
  var errorType = "networkIssue"
  var errorString = "Service is Unreachable";
  console.log(errorString);
  failoverScenario();

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

function throwInvalidCredentialsError() {
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

function setLocalStorage(parameters) {
  try {
    var loginParameters =
    {
      "action": "login",
      "parameter":
      {
        "loginId": params.username,
        "password": parameters.parameter.password,
        "extension": params.extension,
        "isSSOUser": parameters.parameter.isSSOUser,
        "clientCallbackFunction": callbacks.clientCallbackFunction.name
      }
    }
    localStorage.setItem("loginParameters", JSON.stringify(loginParameters));
    localStorage.setItem("currentDomain", params.domain);
  }
  catch (err) {
    console.error(err);
  }
}

function getXMPPConnectedEvent() {
  var xmpppEvent =
  {
    "event": "xmppEvent",
    "response": {
      "loginId": params.username,
      "type": "xmppStatus",
      "description": "Connection Established, XMPP Status is Connected",
    }
  }
  return xmpppEvent;
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
  console.log("Event Received");
  console.log(event);
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

function getUserObject(userEvent) {
  var response;
  var teams = null;
  if (userEvent.teams)
    teams = userEvent.teams;
  var reasonCode = null;
  if (userEvent.reasonCode)
    reasonCode = userEvent.reasonCode;
  if (userEvent.loginId == params.username) {
    response = {
      loginId: userEvent.loginId,
      extension: userEvent.extension,
      firstName: userEvent.firstName,
      lastName: userEvent.lastName,
      fullName: userEvent.firstName + " " + userEvent.lastName,
      pendingState: userEvent.pendingState,
      reasonCode: reasonCode,
      roles: userEvent.roles,
      state: userEvent.state,
      stateChangeTime: userEvent.stateChangeTime,
      teamId: userEvent.teamId,
      teamName: userEvent.teamName,
      teams: teams,
      wrapUpOnIncoming: userEvent.settings.wrapUpOnIncoming,
    }
    return response;
  }
  response =
  {
    loginId: userEvent.loginId,
    extension: userEvent.extension,
    firstName: userEvent.firstName,
    lastName: userEvent.lastName,
    fullName: userEvent.firstName + " " + userEvent.lastName,
    pendingState: userEvent.pendingState,
    reasonCode: reasonCode,
    state: userEvent.state,
    stateChangeTime: userEvent.stateChangeTime,
  }
  return response;
}

function parseUserEvent(userEvent) {
  try {
    var response = getUserObject(userEvent);

    var responseObject =
    {
      "event": "agentState",
      response,
    }
    if (userEvent.state == "LOGOUT" && userEvent.loginId == params.username) {
      processLogout(userEvent.reasonCode, responseObject);
    }
    else {
      failoverReconnect = false;
      localStorage.setItem("logoutFlag", false);
    }

    prevAgentState = userEvent.state;

    return responseObject;
  }
  catch (err) {
    console.error(err);
  }
}

async function processLogout(reasonCode, responseObject) {
  try {
    var logoutStatus = localStorage.getItem("logoutFlag");
    if (logoutStatus && logoutStatus == "false")
      await unsubscribeToTeam();

    localStorage.setItem("logoutFlag", true);
    var prevFailoverStatus = failoverReconnect;
    var prevOutOfService = outOfService;
    failoverReconnect = false;
    outOfService == false;
    if (_jwClient && prevAgentState && prevAgentState != "LOGOUT") {
      isRefreshCase = false;
      //disconnectXmppConnection();
      if ((prevFailoverStatus == true || prevOutOfService == true) && (reasonCode == undefined || reasonCode == "undefined")) {
        responseObject.response.reasonCode = "failover";
        // Again reconnect To execute login api in this case.
        setTimeout(function () { handleReconnection(); }, 1000);
      }
    }
  }
  catch (err) {
    console.error(err);
  }
}

function disconnectXmppConnection() {
  if (_jwClient) {
    console.log("Going to disconnect connection");
    _jwClient.disconnect();
    _jwClient = null;
  }
}

function parseDialogEvent(dialogEvent) {
  if (dialogEvent.id) {
    var secondaryId = null;
    if (dialogEvent.secondaryId)
      secondaryId = dialogEvent.secondaryId;

    var wrapUpReason = null;
    if (dialogEvent.mediaProperties.wrapUpReason)
      wrapUpReason = dialogEvent.mediaProperties.wrapUpReason;

    var queueName = null;
    if (dialogEvent.mediaProperties.queueName)
      queueName = dialogEvent.mediaProperties.queueName;

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
      queueName: queueName,
      associatedDialogUri: getDigits(dialogEvent.associatedDialogUri),
      secondaryId: secondaryId,
      participants: dialogEvent.participants,
      callVariables: dialogEvent.mediaProperties.callvariables,
    }
    setCallObjectLocalStorage(dialog);

    if (dialog.callType == "NULL")
      dialog.callType = processFailoverCall(dialog);

    var responseObject = parseDialogEventType(dialog);
    return responseObject;
  }
  else
    return null;
}

function setCallObjectLocalStorage(dialog) {
  try {
    if (dialog.id && dialog.callType && dialog.callType != "NULL" && dialog.callType != "CONSULT" && dialog.state != "DROPPED")
      setMainCallObject(dialog);
    else if (dialog.id && dialog.callType && dialog.callType != "NULL" && dialog.callType == "CONSULT" && dialog.state != "DROPPED")
      setConsultCallObject(dialog);
  }
  catch (err) {
    console.error(err);
  }
}

function setMainCallObject(dialog) {
  var mainCallObj = { "id": dialog.id, "callType": dialog.callType };
  localStorage.setItem("mainCallObject", JSON.stringify(mainCallObj));
}

function setConsultCallObject(dialog) {
  var consultCallObj = { "id": dialog.id, "callType": dialog.callType };
  localStorage.setItem("consultCallObject", JSON.stringify(consultCallObj));
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
    case callTypes.outboundCampaignType:
      dialogEvent = processOutboundCampaignCall(dialog);
      break;
    case callTypes.outboundPreviewCampaignTypeCCX:
    case callTypes.outboundPreviewCampaignTypeCCE:
      dialogEvent = processOutboundPreviewCampaignCall(dialog);
      break;
    case callTypes.silentMonitorType:
      dialogEvent = processSilentMonitor(dialog);
      break;
    case callTypes.bargeInType:
      dialogEvent = processBargeIn(dialog);
      break;

  }
  dialogEvent.response.dialog.ani = getDigits(dialogEvent.response.dialog.ani);
  //delete dialogEvent.response.dialog.fromAddress;
  //delete dialogEvent.response.dialog.dialedNumber;
  //delete dialogEvent.response.dialog.dnis;
  return dialogEvent;
}

function processFailoverCall(dialog) {
  var callType = getCallTypeFromLocalStorage(dialog.id);
  if (callType)
    return callType;
  return null;
}

function getCallTypeFromLocalStorage(dialogId) {
  try {
    if (localStorage.getItem("mainCallObject")) {
      var mainCallObject = JSON.parse(localStorage.getItem("mainCallObject"));
      if (mainCallObject && mainCallObject.id == dialogId)
        return mainCallObject.callType;
    }

    if (localStorage.getItem("consultCallObject")) {
      var consultCallObject = JSON.parse(localStorage.getItem("consultCallObject"));
      if (consultCallObject && consultCallObject.id == dialogId)
        return consultCallObject.callType;
    }

    return null;
  }
  catch (err) {
    console.error(err);
  }
}

function processBargeIn(dialog) {
  dialog.ani = getCallVariableValue(dialog, config.callVariable);
  var response =
  {
    "event": "dialogState",
    "response":
    {
      "loginId": params.username,
      dialog,
    }
  }
  return response;
}

function processSilentMonitor(dialog) {
  dialog.ani = dialog.dialedNumber;

  var response =
  {
    "event": "dialogState",
    "response":
    {
      "loginId": params.username,
      dialog,
    }
  }
  return response;
}
function processOutboundPreviewCampaignCall(dialog) {
  dialog.ani = dialog.fromAddress;

  var response =
  {
    "event": "campaignCall",
    "response":
    {
      "loginId": params.username,
      dialog,
    }
  }
  return response;
}

function processOutboundCampaignCall(dialog) {
  dialog.ani = getCustomer(dialog.participants);
  // Handle UCCX 12.5 condition where dialing on customer there is no customer in particpant.
  if (!dialog.ani && finesseFlavor == "UCCX")
    dialog.ani = dialog.dialedNumber;

  var response =
  {
    "event": "campaignCall",
    "response":
    {
      "loginId": params.username,
      dialog,
    }
  }
  return response;
}

function processConferenceCall(dialog) {
  dialog.ani = getCallVariableValue(dialog, config.callVariable);
  var loggedParticipantState = getLoggedInParticipantState(dialog.participants);
  if (dialog.state == "ALERTING" && loggedParticipantState == "ALERTING") {
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
  var loggedParticipantState = getLoggedInParticipantState(dialog.participants);
  if (dialog.state == "ALERTING" && loggedParticipantState == "ALERTING") {
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
  var loggedParticipantState = getLoggedInParticipantState(dialog.participants);
  if (dialog.state == "ALERTING" && loggedParticipantState == "ALERTING") {
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
    var customerNumber = getCustomer(dialog.participants);
    if (!customerNumber) {
      customerNumber = getSecondPartner(dialog.participants);
    }
    return getCustomer(dialog.participants);
  }
  else {
    if (dialog.fromAddress != params.extension) {
      return dialog.fromAddress;
    }
    else {
      var customer = getCustomer(dialog.participants);
      if (!customer)
        customer = getSecondPartner(dialog.participants);
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

function getSecondPartner(participants) {
  var length;
  if (participants.Participant)
    length = participants.Participant.length;

  if (length) {
    for (var i = 0; i < length; i++) {
      if (participants.Participant[i].mediaAddress != params.extension) {
        return participants.Participant[i].mediaAddress;
      }
    }
  }
  return null;
}

function getLoggedInParticipantState(participants) {
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

  if (dialog.ani == null)
    dialog.ani = getSecondPartner(dialog.participants);

  var loggedParticipantState = getLoggedInParticipantState(dialog.participants);
  var eventType;
  if (dialog.state == "ALERTING" && loggedParticipantState == "ALERTING")
    eventType = "newInboundCall";
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
  var loggedParticipantState = getLoggedInParticipantState(dialog.participants);
  if (dialog.state == "ALERTING" && loggedParticipantState == "ALERTING") {
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

function parseSystemInfo(systemInfo) {
  console.log(systemInfo.status)
  if (systemInfo.status == "IN_SERVICE" && failoverReconnect == true) {
    //reconnect with alternate node
    console.log("In [parseSystemInfo], we are going to execute failover");
    outOfService = false;
    //failoverReconnect = false;
    //switchConnection();
    retryCount = 0;
    clearInterval(intervalID);
    intervalID = null;
    disconnectXmppConnection();
    setTimeout(function () { handleReconnection() }, 2000);


  }
  else if (systemInfo.status == "IN_SERVICE" && failoverReconnect == false) {
    //Current node responded before 3 times request exceeds.
    console.log("In [parseSystemInfo], not going to execute failover, only reconnect");
    clearInterval(intervalID);
    outOfService = false;
    intervalID = null;
    retryCount = 0;
    failoverReconnect = true;
    disconnectXmppConnection();
    setTimeout(function () { handleReconnection(); }, 2000);
  }
  else if (systemInfo.status == "OUT_OF_SERVICE") {
    outOfService = true;
    heartbeatReceived = false;
  }
  var responseObject =
  {
    "event": "systemInfo",
    "response":
    {
      "loginId": params.username,
      systemInfo
    }
  }
  return responseObject;
}

function onClientError(rsp) {
  var stringdoc = new XMLSerializer().serializeToString(rsp);
  var contains_error_authentication = stringdoc.includes("not-authorized");
  var contains_error_unreachable = stringdoc.includes("service-unavailable");
  var contains_error_internalServer = stringdoc.includes("<error><internal-server-error");
  var errorString, errorType;

  if (contains_error_authentication) {
    errorType = "subscriptionFailed";
    errorString = "Invalid credentials supplied for agent login";
  }
  else if (contains_error_unreachable || stringdoc.includes("remote-server-timeout")) {
    errorType = "networkIssue"
    errorString = "Service is Unreachable";
    console.log(errorString);
    //failoverScenario();
    if (intervalID == null)
      failoverScenario();
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
  if (contains_error_internalServer) {
    console.log("contains_error_internalServer");
    if (_jwClient) {
      _jwClient.disconnect();
      _jwClient = null;
      handleReconnection();
    }
  }
}
var intervalID = null;
function failoverScenario() {
  console.log("[failoverScenario], intervalID: " + intervalID);
  getSystemInfo(getDomain());
  intervalID = 1;
  //intervalID = setInterval(function() {getSystemInfo(getDomain())}, 500); //10500
  setTimeout(function () {
    if (heartbeatReceived == false) {
      retryCount = 0;
      clearInterval(intervalID);
      console.log(" [failoverScenario] Pinged server, no response. Will check alternate system");
      failoverReconnect = true;
      currentDomain = switchDomain();
      failoverScenario();
    }
    else {
      console.log("Heartbeat received, will end failover process");
      //reset heartbeat
      heartbeatReceived = false;
    }


    // Agar yahan tk aa jae tou aik flag set kr lo
    // Phr aik dafa check system info for alternate. Mil jae tou move kr jao (parse system info men).

    // Aur agar parse system info men in service mil jae tou yahan aany se pehly
    // tou wahan hi clear interval kr do
    // then yahan tak aogy hi ni, aur flags etc reset kar do.
  }, 5000) // 30000
}

/*function failoverScenario()
{
    var retryCount = 0;
    while (heartbeatReceived == false && retryCount < 3)
    {
        setTimeout(getSystemInfo(config.domain), 5000);
        retryCount++;
        if(retryCount == 3)
        {
            failoverReconnect = true;
            checkAndMoveOnOtherNode();
        }
    }
    //else
    {
        failoverReconnect = false;
        retryCount = 0;
    }
}


function handleFailoverConnection()
{
    var parameters ={
        "action"    : "login",
        "parameter" :
        {
            "loginId" : params.username,
            "password" : params.password,
            "extension" : params.extension,
            "clientCallbackFunction" : callbacks.clientCallbackFunction,
        }
    }
    executeCommands(parameters);
}*/

function handleReconnection() {
  try {
    if (params && callbacks) {
      console.log("Reconnecting from memory");
      var parameters = {
        "action": "login",
        "parameter":
        {
          "loginId": params.username,
          "password": params.password,
          "extension": params.extension,
          "clientCallbackFunction": callbacks.clientCallbackFunction,
        }
      }
      executeCommands(parameters);
    }
    else {
      console.log("Reconnecting from local storage");
      if (localStorage.getItem("loginParameters")) {
        var parameters = JSON.parse(localStorage.getItem("loginParameters"));
        loginRefreshCase(parameters);
      }
    }
  }
  catch (err) {
    console.error(err);
  }
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
    var jsonObj;
    if (!data.access_token) {
      var xmlObj = $.parseXML(data);
      jsonObj = xml2json(xmlObj);
    }
    else {
      jsonObj = data;
    }
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
  console.log("Got api response");
  console.log(response);
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
  else if (response.Team) {
    parsedResponse[0] = parseTeam(response.Team);
  }
  else if (response.SystemInfo) {
    parsedResponse[0] = parseSystemInfo(response.SystemInfo);
  }
  else if (response.Queues != null && response.Queues != undefined) {
    if (response.Queues != "")
      parsedResponse[0] = parseQueues(response.Queues.Queue);
    else
      parsedResponse[0] = parseQueues(response.Queues);
  }
  else if (response.PhoneBooks != null && response.PhoneBooks != undefined) {
    if (response.PhoneBooks != "")
      parsedResponse[0] = parsePhoneBooks(response.PhoneBooks.PhoneBook);
    else
      parsedResponse[0] = parsePhoneBooks(response.PhoneBooks);
  }
  else if (response.access_token) {
    console.log("Goint to parse tokens");
    parsedResponse[0] = parseSSOTokenResponse(response);
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

async function apiErrors(jqXHR, errorThrown, callback, requestParameters) {
  if (jqXHR.responseText) {
    var xmlError = $.parseXML(jqXHR.responseText);
    var jsonErrorObj = xml2json(xmlError);
  }

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

  if (errorThrown == "" && jsonErrorObj && jsonErrorObj.ApiErrors.ApiError.ErrorMessage)
    errorThrown = jsonErrorObj.ApiErrors.ApiError.ErrorMessage;
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

  if (isSSOAgent && (jqXHR.status == "generalError" || jqXHR.status == "unAuthorized")) {
    var parameters = getSSOParameters();
    if (parameters && config.isGadget == false) {
      var token = await getSSOToken(parameters, "token expired");
      updateTokenLoginParamaterLocalStorage(token);
      params.password = token;
      executeCommands(requestParameters);
    }
    else if (parameters && config.isGadget == true) {
      sendPostMessage(requestParameters);
    }
  }
  else {
    callback(responseObject);
  }
}

function updateTokenLoginParamaterLocalStorage(token) {
  try {
    var loginParameters = localStorage.getItem("loginParameters");
    if (loginParameters) {
      loginParameters = JSON.parse(loginParameters);
      loginParameters.parameter.password = token;
      localStorage.setItem("loginParameters", JSON.stringify(loginParameters));
    }
  }
  catch (err) {
    console.error(err);
  }
}

function getSSOParameters() {
  try {
    console.log("Going to get sso parameters")
    var users = JSON.parse(localStorage.getItem("ssoUser"));
    console.log(users);
    if (users && users.loginId) {
      var parameters =
      {
        "parameter":
        {
          "loginId": users.loginId,
          "password": users.password,
        }
      }
      return parameters;
    }
    return null;
  }
  catch (err) {
    console.error(err);
  }
}

function makeApiErrorsReadable(type, description) {
  switch (type) {
    case 400:
      return { "type": "badRequest", "description": "Bad request, some data is missing." }
    case 401:
    case 417:
      return { "type": "unAuthorized", "description": "Invalid credentials supplied for api." }
    case 405:
      return { "type": "methodNotAllowed", "description": "Dialog ID is missing, can not process the request." }
    case 404:
      return { "type": "notFound", "description": "The request data is not found." }
    case 416:
      return { "type": "badRequest", "description": "" };

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

function sendTeamErrorstoClient(errorType, errorDescription) {
  var errorEvent = {
    "event": "Error",
    "response": {
      "description": errorDescription,
      "loginId": params.username,
      "type": errorType,
    }
  }
  callbacks.clientCallbackFunction(errorEvent);
}

/*async function getSSOToken(parameters)
{
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestData = {
        "username": parameters.parameter.loginId,
        "password": parameters.parameter.password,
    };

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(requestData),
    };
    try {
        const response = await fetch("https://192.168.1.104:1123/getaccesstoken", requestOptions);

        if (!response.ok) {
            console.log(`Error! status: ${response.status}`);
        }
        console.log(response);
      } catch (err) {
        console.log(err);
      }
}*/

function setUsersLocalStorage(userObj) {
  try {
    console.log("userObj: ", userObj);
    console.log("Added user #" + userObj.loginId);
    localStorage.setItem("ssoUser", JSON.stringify(userObj));
  }
  catch (ex) {
    console.error(ex);
  }
}

async function getUserIdFinesseObject(parameters) {
  var username = parameters.parameter.loginId;
  if (username.includes("@"))
    parameters.parameter.loginId = username.split("@")[0];
  console.log("Going to get user. Parameters: ", parameters);
  initialize(parameters);
  var myHeaders = new Headers();
  myHeaders.append("Authorization", getAuthorizationHeaderValue());

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  var response = await fetch("https://" + params.domain + ":8445/finesse/api/User/" + parameters.parameter.loginId, requestOptions)
    .then(response => response.text())
    .then(result => {
      //console.log("[getUserIdFinesseObject]" , result);
      var xmlObj = $.parseXML(result);
      jsonObj = xml2json(xmlObj);
      console.log("[getUserIdFinesseObject] loginId: ", jsonObj.User.loginId);
      return jsonObj.User.loginId;
    })
    .catch(error => {
      console.log('error: ', error);
      return error;
    });
  return response;
}
async function getSSOToken(parameters, source) {
  //console.log("Going to get token. Parameters: ", parameters);
  if (parameters.parameter.extension)
    initialize(parameters);
  if (config.isGadget == false) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      "username": parameters.parameter.loginId,
      "password": parameters.parameter.password
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    var response =
      await fetch(config.ssoBackendUrl + "getaccesstoken", requestOptions)
        .then(response => response.text())
        .then(result => {
          //console.log("[getSSOToken]" , result);
          if (!result.includes("Error while executing")) {
            result = JSON.parse(result);
            console.log(result);
          }
          else
            console.log(result);
          //resolve(result) ;
          return result;
        })
        .catch(error => {
          console.log('error: ', error);
          //reject(error);
          return error;
        });
    if (response.access_token)
      return response.access_token;
    return response;
    /*if(response.access_token)
        callbacks.apiCallbackFunction(response);
    else
        apiErrors({status: 417}, response, callbacks.apiCallbackFunction);*/
  }
  else if (config.isGadget == true) {
    try {
      var token = JSON.parse(sessionStorage.getItem("ssoTokenObject"));
      token = token ? token.token : null;
      console.log(token);
      return token;
    }
    catch (ex) {
      console.error(ex);
    }
  }
}

window.addEventListener("message", (event) => {
  var token = event.data.token;
  var requestParameters = event.data.command;
  if (token) {
    updateTokenLoginParamaterLocalStorage(token);
    params.password = token;
    executeCommands(requestParameters);
  }
}, false);

function sendPostMessage(command) {

  let postObject = {
    type: "exchangeToken",
    command: command,
  }
  window.parent.postMessage(postObject, "*",);
}

function getUserPhoneBook(parameters) {
  $ = jQuery.noConflict();
  var weblink = "https://" + params.domain + ":8445/finesse/api/User/" + parameters.parameter.userId + "/PhoneBooks";

  $.ajax(
    {
      url: weblink,
      type: 'GET',
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
        request.setRequestHeader("Range", "objects=1-" + parameters.parameter.range);
      },
      crossDomain: true,
      success: function (result) {
        result = new XMLSerializer().serializeToString(result);
        callbacks.apiCallbackFunction(result);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
      }
    });
}

function getUserQueues(parameters) {
  $ = jQuery.noConflict();
  var weblink = "https://" + params.domain + ":8445/finesse/api/User/" + parameters.parameter.userId + "/Queues";

  $.ajax(
    {
      url: weblink,
      type: 'GET',
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
      },
      crossDomain: true,
      success: function (result) {
        result = new XMLSerializer().serializeToString(result);
        callbacks.apiCallbackFunction(result);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
      }
    });
}

function dropParticipant(parameters) {
  $ = jQuery.noConflict();
  var weblink = "https://" + params.domain + ":8445/finesse/api/Dialog/" + parameters.parameter.dialogId;

  $.ajax(
    {
      url: weblink,
      data: "<Dialog><requestedAction>PARTICIPANT_DROP</requestedAction><targetMediaAddress>" + parameters.parameter.participantToDrop + "</targetMediaAddress></Dialog>",
      type: 'PUT',
      dataType: "xml",
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
        request.setRequestHeader("Content-Type", "application/xml");
      },
      crossDomain: true,
      success: function (result) {
        return 202;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
      }
    });
}

function bargeIn(parameters) {
  $ = jQuery.noConflict();
  var weblink = "https://" + params.domain + ":8445/finesse/api/User/" + params.username + "/Dialogs";

  $.ajax(
    {
      url: weblink,
      data: "<Dialog><requestedAction>BARGE_CALL</requestedAction><fromAddress>" + params.extension + "</fromAddress><toAddress>" + parameters.parameter.toAddress + "</toAddress><associatedDialogUri>/finesse/api/Dialog/" + parameters.parameter.dialogId + "</associatedDialogUri></Dialog>",
      type: 'POST',
      dataType: "xml",
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
        request.setRequestHeader("Content-Type", "application/xml");
      },
      crossDomain: true,
      success: function (result) {
        return 202;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
      }
    });
}

function silentMonitor(parameters) {
  $ = jQuery.noConflict();
  var weblink = "https://" + params.domain + ":8445/finesse/api/User/" + params.username + "/Dialogs";

  $.ajax(
    {
      url: weblink,
      data: "<Dialog><requestedAction>SILENT_MONITOR</requestedAction><fromAddress>" + params.extension + "</fromAddress><toAddress>" + parameters.parameter.toAddress + "</toAddress></Dialog>",
      type: 'POST',
      dataType: "xml",
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
        request.setRequestHeader("Content-Type", "application/xml");
      },
      crossDomain: true,
      success: function (result) {
        return 202;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
      }
    });
}

function getTeamUsers(parameters) {
  $ = jQuery.noConflict();
  var weblink = "https://" + params.domain + ":8445/finesse/api/Team/" + parameters.parameter.teamId + "?includeLoggedOutAgents=" + parameters.parameter.logoutFlag;

  $.ajax(
    {
      url: weblink,
      type: 'GET',
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
      },
      crossDomain: true,
      success: function (result) {
        result = new XMLSerializer().serializeToString(result);
        callbacks.apiCallbackFunction(result);
        if (parameters.parameter.subscribeFlag == true) {
          params.teamId = parameters.parameter.teamId;
          subscribeToTeam();
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
      }
    });
}

function subscribeToTeam() {
  try {
    var teamId = localStorage.getItem("teamId");
    if (teamId && teamId != "null" && teamId == params.teamId) {
      sendTeamErrorstoClient("teamSubscription", "Subscribed to this team already");
      return;
    }
    else if (teamId && teamId != "null" && teamId != params.teamId) {
      unsubscribeToTeam();
      return;
    }

    var jid = params.username + "@" + params.domain;
    var builder = new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub}pubsub");
    builder.element("subscribe").attribute("node", "/finesse/api/Team/" + params.teamId + "/Users").
      attribute("jid", jid);

    xmppClient.sendIq("set", "pubsub." + params.domain, builder.data, teamCallbackNode, 5000);
  }
  catch (Exception) {
    sendTeamErrorstoClient("Exception", Exception);
  }
}

function unsubscribeToTeam() {
  try {
    var teamId = localStorage.getItem("teamId");
    if (teamId && teamId != "null" && teamId != null) {
      var jid = params.username + "@" + params.domain;
      console.log("Got id: " + teamId);
      console.log("Got jid: " + jid);

      var builder = new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub}pubsub");
      builder.element("unsubscribe").attribute("node", "/finesse/api/Team/" + teamId + "/Users").attribute("jid", jid);

      xmppClient.sendIq("set", "pubsub." + params.domain, builder.data, teamCallbackNode, 5000);
      localStorage.setItem("teamId", null);
      console.log("cleared teamId ");
    }

  }
  catch (Exception) {
    sendTeamErrorstoClient("Exception", Exception);
  }
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
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
        request.setRequestHeader("Content-Type", "application/xml");
      },
      crossDomain: true,
      success: function (result) {
        return 202;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
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
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
        request.setRequestHeader("Content-Type", "application/xml");
      },
      crossDomain: true,
      success: function (result) {
        return 202;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
      }
    });
}


function updateCallVariableData(parameters) {
  var callVariables = parseCallVariables(parameters.parameter.callVariables.callVariable);
  parameters.parameter.callVariables = callVariables;

  $ = jQuery.noConflict();
  var weblink = "https://" + params.domain + ":8445/finesse/api/Dialog/" + parameters.parameter.dialogId;
  var dataXml = "<Dialog><requestedAction>UPDATE_CALL_DATA</requestedAction><mediaProperties><callvariables>" + JSON.stringify(parameters.parameter.callVariables) + "</callvariables></mediaProperties></Dialog>";

  $.ajax(
    {
      url: weblink,
      data: dataXml,
      type: 'PUT',
      dataType: "xml",
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
        request.setRequestHeader("Content-Type", "application/xml");
      },
      crossDomain: true,
      success: function (result) {
        return 202;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
      }
    });
}

function updateWrapupData(parameters) {
  $ = jQuery.noConflict();
  var weblink = "https://" + params.domain + ":8445/finesse/api/Dialog/" + parameters.parameter.dialogId;
  var dataXml = "<Dialog><requestedAction>UPDATE_CALL_DATA</requestedAction><mediaProperties><wrapUpReason>" + parameters.parameter.wrapupReason + "</wrapUpReason></mediaProperties></Dialog>";

  $.ajax(
    {
      url: weblink,
      data: dataXml,
      type: 'PUT',
      dataType: "xml",
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
        request.setRequestHeader("Content-Type", "application/xml");
      },
      crossDomain: true,
      success: function (result) {
        return 202;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
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
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
      },

      crossDomain: true,

      success: function (result) {
        var stringdoc = new XMLSerializer().serializeToString(result);
        callbacks.apiCallbackFunction(stringdoc);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
      }
    });
}

/*async function makeNotReady(parameters)
{
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/xml");
    myHeaders.append("Authorization", getAuthorizationHeaderValue());


    var requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: getNotReadyApiXmlBody(parameters),
      crossDomain: true,
    };

    try{
        var response = await fetch(getStateChangeApiEndpoint(parameters), requestOptions)
        console.log(response);
        console.log(response.status);
    }
    catch(err){
        console.log(err);
    }
    /*.then(response => response.text())
    .then(result => {
        console.log(result);
        console.log(result.status);
    })
    .catch(error => {
        console.log('error: ', error);
        return error;
    });
    console.log(response);*/
//}

function getNotReadyApiXmlBody(parameters) {
  if ((parameters.parameter.reasonCode && !parameters.parameter.userId) || (parameters.parameter.reasonCode && parameters.parameter.userId == params.username))
    return "<User><state>NOT_READY</state> <reasonCodeId>" + parameters.parameter.reasonCode + "</reasonCodeId> </User>";
  else
    return "<User><state>NOT_READY</state></User>";
  /*else if(parameters.parameter.userId  && parameters.parameter.userId  != params.username)
      return "<User><state>NOT_READY</state> <reasonCodeId>" + config.supervisorInitiatedNotReadyReason + "</reasonCodeId> </User>";*/

}


function makeNotReady(parameters) {
  var weblink = getStateChangeApiEndpoint(parameters);
  var dataXml = getNotReadyApiXmlBody(parameters);

  $.ajax(
    {
      url: weblink,
      data: dataXml,
      type: 'PUT',
      dataType: "xml",
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
        request.setRequestHeader("Content-Type", "application/xml");
      },
      statusCode: {
        401: function (xhr) {
          console.log("Status code is 401");
          if (window.console) console.log(xhr.responseText);
        }
      },
      crossDomain: true,
      success: function (result) {
        console.log(result);
        return 202;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
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
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
        request.setRequestHeader("Content-Type", "application/xml");
      },
      crossDomain: true,

      success: function (result) {
        return 202;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
      }
    });
}

function getStateChangeApiEndpoint(parameters) {
  if (parameters.parameter && parameters.parameter.userId)
    return "https://" + params.domain + ":8445/finesse/api/User/" + parameters.parameter.userId;
  else
    return "https://" + params.domain + ":8445/finesse/api/User/" + params.username;
}
function makeReady(parameters) {
  $ = jQuery.noConflict();
  var weblink = getStateChangeApiEndpoint(parameters);

  $.ajax(
    {
      url: weblink,
      data: "<User><state>READY</state></User>",
      type: 'PUT',
      dataType: "xml",
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
        request.setRequestHeader("Content-Type", "application/xml");
      },
      crossDomain: true,

      success: function (result) {
        return 202;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
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
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
        request.setRequestHeader("Content-Type", "application/xml");
      },
      crossDomain: true,
      success: function (result) {
        return 202;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
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
    case "acceptCall":
      return "ACCEPT";
    case "rejectCall":
      return "REJECT";
    case "closeCall":
      return "CLOSE";
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
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
        request.setRequestHeader("Content-Type", "application/xml");
      },
      crossDomain: true,
      success: function (result) {
        return 202;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
      }
    });
}

function getAuthorizationHeaderValue() {
  if (isSSOAgent)
    return "Bearer " + params.password;
  else
    return "Basic " + params.encodedData;
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
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
        request.setRequestHeader("Content-Type", "application/xml");
      },
      crossDomain: true,
      success: function (result) {
        getState("login");
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
      }
    });
}

async function loginByJSONLY() {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", getAuthorizationHeaderValue());
  myHeaders.append("Content-Type", "application/xml");

  var raw = "<User><state>LOGIN</state><extension>42029</extension></User>";

  var requestOptions = {
    method: 'PUT',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };
  try {
    const response = await fetch("https://expert.ucce.ipcc:8445/finesse/api/User/vrs2", requestOptions);

    if (!response.ok) {
      console.log(`Error! status: ${response.status}`);
    }
    return response;
  } catch (err) {
    console.log(err);
  }
}

/*function getSystemInfo(domain)
{
    console.log("Going to get system info from api");
    $ = jQuery.noConflict();
    var weblink = "https://" + domain +":8445/finesse/api/SystemInfo";
    return new Promise((resolve, reject) =>
    {
        $.ajax(
        {
            url: weblink,
            type: 'GET',
            timeout: 0,
            crossDomain: true,

            success: function(result)
            {
                setTimeout(resolve(result), 1000);
                /*heartbeatReceived = true;
                console.log("[getSystemInfo] success");
                console.log(result);
                result = new XMLSerializer().serializeToString(result);
                callbacks.apiCallbackFunction(result)
                return 1;
            },

            error: function(error)
            {
                setTimeout(reject(error), 1000);
                /*heartbeatReceived = false;
                console.error("[getSystemInfo] error");
                console.log(errorThrown);
                apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
                return 0;
            }
        });
    })
}*/
var retryCount = 0;
var timeout;
function getSystemInfo(domain) {
  console.log("Going to get system info for " + domain + " from api");
  $ = jQuery.noConflict();
  var weblink = "https://" + domain + ":8445/finesse/api/SystemInfo";
  $.ajax(
    {
      url: weblink,
      type: 'GET',
      timeout: 0,
      crossDomain: true,

      success: function (result) {
        console.log(retryCount);
        retryCount++;
        heartbeatReceived = true;
        console.log("[getSystemInfo] success");
        //console.log(result);
        result = new XMLSerializer().serializeToString(result);
        callbacks.apiCallbackFunction(result)

        return 1;
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(retryCount);
        retryCount++;
        heartbeatReceived = false;
        console.error("[getSystemInfo] error");
        //console.log(errorThrown);
        //apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
        return 0;
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
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
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
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
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
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
      },
      success: function (result) {
        result = new XMLSerializer().serializeToString(result);
        callbacks.apiCallbackFunction(result);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
      }
    });
}

function getLogoutApiXmlBody(parameters) {
  if ((parameters.parameter.reasonCode && parameters.parameter.userId && parameters.parameter.userId == params.username) || (parameters.parameter.reasonCode && !parameters.parameter.userId))
    return "<User><state>LOGOUT</state> <reasonCodeId>" + parameters.parameter.reasonCode + "</reasonCodeId> </User>";
  else
    return "<User><state>LOGOUT</state></User>";
  /*else if(parameters.parameter.userId && parameters.parameter.userId != params.username)
      return "<User><state>LOGOUT</state> <reasonCodeId>" + config.supervisorInitiatedLogoutReason + "</reasonCodeId> </User>";*/

}

function logout(parameters) {
  var weblink = getStateChangeApiEndpoint(parameters);
  var dataXml = getLogoutApiXmlBody(parameters);

  $.ajax(
    {
      url: weblink,
      data: dataXml,
      type: 'PUT',
      dataType: "xml",
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
        request.setRequestHeader("Content-Type", "application/xml");
      },
      crossDomain: true,
      success: function (result) {
        return 202;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
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
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
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
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
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
        request.setRequestHeader("Authorization", getAuthorizationHeaderValue());
      },

      crossDomain: true,

      success: function (result) {
        var stringdoc = new XMLSerializer().serializeToString(result);
        callbacks.apiCallbackFunction(stringdoc);
      },

      error: function (jqXHR, textStatus, errorThrown) {
        apiErrors(jqXHR, errorThrown, callbacks.apiCallbackFunction, parameters);
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
  //var reasonsLength = reasons.length;

  if (src == "notReady")
    notReadyReasons = [];

  if (Array.isArray(reasons)) {
    while (i < reasons.length) {
      systemCode = reasons[i].systemCode;

      if (systemCode == "false") {
        category = reasons[i].category;
        label = reasons[i].label;
        code = getIdFromUri(reasons[i].uri);

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
      code = getIdFromUri(reasons.uri);

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

function getIdFromUri(uri) {
  var lastIndexofUriString = uri.lastIndexOf("/");
  return uri.substring(lastIndexofUriString + 1, uri.length);
}

function parseWrapUpReasonCodes(reasons) {
  var label;
  var uri;
  var code;
  var i = 0;
  var wrapupReasons = [];
  //var reasonsLength = reasons.length;

  if (Array.isArray(reasons)) {
    while (i < reasons.length) {
      label = reasons[i].label;
      code = getIdFromUri(reasons[i].uri);

      var reason = { 'label': label, 'code': code, 'forAll': reasons[i].forAll };
      wrapupReasons.push(reason);
      i++;
    }
  }
  else if (reasons) {
    label = reasons.label;
    code = getIdFromUri(reasons.uri);

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

function parseTeam(teamEvent) {
  var users = [];
  var i = 0;
  var teamUserLength;
  if (teamEvent.users != "" && teamEvent.users.User.length)
    teamUserLength = teamEvent.users.User.length;

  if (teamUserLength && teamUserLength > 1) {
    while (i < teamUserLength) {
      var reasonCode = null;
      if (teamEvent.users.User[i].reasonCode)
        reasonCode = teamEvent.users.User[i].reasonCode;
      var user =
      {
        "firstName": teamEvent.users.User[i].firstName,
        "lastName": teamEvent.users.User[i].lastName,
        "fullName": teamEvent.users.User[i].firstName + " " + teamEvent.users.User[i].lastName,
        "extension": teamEvent.users.User[i].extension,
        "loginId": teamEvent.users.User[i].loginId,
        "state": teamEvent.users.User[i].state,
        "reasonCode": reasonCode,
        "pendingState": teamEvent.users.User[i].pendingState,
        "stateChangeTime": teamEvent.users.User[i].stateChangeTime,
        "mediaType": teamEvent.users.User[i].mediaType,
      }
      users.push(user);
      i++;
    }
  }
  else if ((teamUserLength == 1 || teamUserLength == undefined) && teamEvent.users != "" && teamEvent.users.User.firstName) {
    var reasonCode = null;
    if (teamEvent.users.User.reasonCode)
      reasonCode = teamEvent.users.User.reasonCode;
    var user =
    {
      "firstName": teamEvent.users.User.firstName,
      "lastName": teamEvent.users.User.lastName,
      "fullName": teamEvent.users.User.firstName + " " + teamEvent.users.User.lastName,
      "extension": teamEvent.users.User.extension,
      "loginId": teamEvent.users.User.loginId,
      "state": teamEvent.users.User.state,
      "reasonCode": reasonCode,
      "pendingState": teamEvent.users.User.pendingState,
      "stateChangeTime": teamEvent.users.User.stateChangeTime,
      "mediaType": teamEvent.users.User.mediaType,
    }
    users.push(user);
  }
  var teamResponse =
  {
    "event": "teamUsersList",
    "response":
    {
      "loginId": params.username,
      "teamId": teamEvent.id,
      "teamName": teamEvent.name,
      "users": users,
    }
  }
  return teamResponse;
}
function parseQueues(queueEvent) {
  var queues = [];
  var i = 0;
  var queuesLength = queueEvent.length;

  if (queuesLength && queuesLength > 1) {
    while (i < queuesLength) {
      var id = queueEvent[i].uri;
      var lastIndex = id.lastIndexOf("/");
      id = id.substring(lastIndex + 1, id.length);
      var queue =
      {
        "name": queueEvent[i].name,
        "statistics": queueEvent[i].statistics,
        "id": id,
      }
      queues.push(queue);
      i++;
    }
  }
  else if ((queuesLength == 1 || queuesLength == undefined) && queueEvent.name) {
    var id = queueEvent.uri;
    var lastIndex = id.lastIndexOf("/");
    id = id.substring(lastIndex + 1, id.length);
    var queue =
    {
      "name": queueEvent.name,
      "statistics": queueEvent.statistics,
      "id": id,
    }
    queues.push(queue);
  }
  var queueResponse =
  {
    "event": "queueList",
    "response":
    {
      "loginId": params.username,
      "queues": queues,
    }
  }
  return queueResponse;
}

function parsePhoneBooks(phoneBookEvent) {
  var phoneBooks = [];
  var i = 0;
  var phoneBooksLength = phoneBookEvent.length;

  if (phoneBooksLength && phoneBooksLength > 1) {
    while (i < phoneBooksLength) {
      var id = phoneBookEvent[i].uri;
      var lastIndex = id.lastIndexOf("/");
      id = id.substring(lastIndex + 1, id.length);
      var contacts = [];
      if (phoneBookEvent[i].contacts != null && phoneBookEvent[i].contacts != undefined) {
        if (phoneBookEvent[i].contacts != "")
          contacts = parsePhoneBookContacts(phoneBookEvent[i].contacts.Contact);
        else
          contacts = parsePhoneBookContacts(phoneBookEvent[i].contacts);
      }
      var phoneBook =
      {
        "name": phoneBookEvent[i].name,
        "type": phoneBookEvent[i].type,
        "id": id,
        "contacts": contacts,
      }
      phoneBooks.push(phoneBook);
      i++;
    }
  }
  else if ((phoneBooksLength == 1 || phoneBooksLength == undefined) && phoneBookEvent.name) {
    var id = phoneBookEvent.uri;
    var lastIndex = id.lastIndexOf("/");
    id = id.substring(lastIndex + 1, id.length);
    var contacts = [];
    if (phoneBookEvent.contacts != null && phoneBookEvent.contacts != undefined) {
      if (phoneBookEvent.contacts != "")
        contacts = parsePhoneBookContacts(phoneBookEvent.contacts.Contact);
      else
        contacts = parsePhoneBookContacts(phoneBookEvent.contacts);
    }
    var phoneBook =
    {
      "name": phoneBookEvent.name,
      "type": phoneBookEvent.type,
      "id": id,
      "contacts": contacts,
    }
    phoneBooks.push(phoneBook);
  }
  var phoneBookResponse =
  {
    "event": "phoneBookList",
    "response":
    {
      "loginId": params.username,
      "phoneBooks": phoneBooks,
    }
  }
  return phoneBookResponse;
}

function parsePhoneBookContacts(contactEvent) {
  var contacts = [];
  var i = 0;
  var contactsLength = contactEvent.length;

  if (contactsLength && contactsLength > 1) {
    while (i < contactsLength) {
      var id = contactEvent[i].uri;
      var lastIndex = id.lastIndexOf("/");
      id = id.substring(lastIndex + 1, id.length);
      var contact =
      {
        "firstName": contactEvent[i].firstName,
        "lastName": contactEvent[i].lastName,
        "description": contactEvent[i].description,
        "phoneNumber": contactEvent[i].phoneNumber,
        "id": id,
      }
      contacts.push(contact);
      i++;
    }
  }
  else if ((contactsLength == 1 || contactsLength == undefined) && contactEvent.firstName) {
    var id = contactEvent.uri;
    var lastIndex = id.lastIndexOf("/");
    id = id.substring(lastIndex + 1, id.length);
    var contact =
    {
      "firstName": contactEvent.firstName,
      "lastName": contactEvent.lastName,
      "description": contactEvent.description,
      "phoneNumber": contactEvent.phoneNumber,
      "id": id,
    }
    contacts.push(contact);
  }
  return contacts;
}

function parseSSOTokenResponse(tokenEvent) {
  try {
    isSSOAgent = true;
    localStorage.setItem("isSSOUser", true);
    var response = {
      "event": "ssoToken",
      "response": {
        "loginId": params.username,
        "accessToken": tokenEvent.access_token,
      }
    }
    return response;
  }
  catch (err) {
    console.error(err);
  }
}
