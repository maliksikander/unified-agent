let entity = "";
let currentRecordId = "";
let UserName, userId;
let entities = config && config.entities ? config.entities.split(',') : undefined;
let clicktoDial = "";
let newURL = "";

var script = document.createElement("script")
script.type = "text/javascript";
//script.src = config.organizationDomain+"/scripts/openframe/latest/openFrameAPI.min.js";
(document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script);
script.onload = function () {
    // initCTI();

    //-------------------------------------------
    //openFrameAPI.init(config, initSuccess, initFailure);

    //var url ="'cti.do?sysparm_caller_phone="+number+"'";
    //console.log('myurl'+url);
    //var url ="'cti.do?sysparm_caller_phone="+number+"'";	
    //openFrameAPI.openCustomURL(url);
    //openFrameAPI.openCustomURL('cti.do?sysparm_caller_phone="'+42025+'"');



};

//fillMatchedRecords(recordsArray);
//fillMatchedRecords is function name
//let recordsArray = [];
//for (let i = 0; i < count; i++) {
//    recordsArray.push({ Id: res[i][Id], Name: res[i][Name] });
//}

//if (window.addEventListener) {

// window.addEventListener("message", function (e) {

// console.log('in the Application CTI'+JSON.stringify(e));
// });


//}
function timeformate(time) {
    // Input date string
    const inputDateString = time;

    // Create a Date object from the input string
    const dateObject = new Date(inputDateString);

    // Get the date components
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so we add 1 and pad with '0'
    const day = String(dateObject.getDate()).padStart(2, '0');

    // Get the time components
    const hours = String(dateObject.getUTCHours()).padStart(2, '0');
    const minutes = String(dateObject.getUTCMinutes()).padStart(2, '0');
    const seconds = String(dateObject.getUTCSeconds()).padStart(2, '0');

    // Format the result
    const formattedDateString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDateString;


}

if (window.addEventListener) {

    window.addEventListener("message", function (e) {
        try {
            var incomingData;
            console.log('in the Application CTI' + JSON.stringify(e));
            if(typeof e.data == "string")
             incomingData = JSON.parse(e.data);
             else
             incomingData= e.data;
            //new code jazeb
            if (incomingData.event == "newInboundCall") {
                console.log("ringing call event data ", incomingData);
                let message = {
                    phoneno: incomingData.response.dialog.ani,
                    myevent: "Ringing",
                }
                window.parent.postMessage(message, "*");
            }
            else if (incomingData.event == "dialogState") {
                console.log(" call end event data ", incomingData);
                var startTime = new Date(incomingData.response.dialog.participants[0].startTime);
                var stateChangeTime = new Date(incomingData.response.dialog.participants[0].stateChangeTime);
                var timeDifferenceMs = stateChangeTime - startTime;

                let message = {
                    sysparm_caller_id: incomingData.response.dialog.id,
                    sysparm_caller_phone: incomingData.response.dialog.ani,
                    //sysparm_caller_contactid: "contactid",
                    sysparm_caller_duration: timeDifferenceMs,
                    sysparm_caller_starttime: timeformate(incomingData.response.dialog.participants[0].startTime),
                    sysparm_caller_endtime: timeformate(incomingData.response.dialog.participants[0].stateChangeTime),
                    sysparm_caller_calltype: incomingData.response.dialog.callType,
                    sysparm_caller_desc: "Auto Activity",
                    myevent: "Endcall"
                }
                window.parent.postMessage(message, "*");
            }
            if (e.data.event = "Agent_Desk_Event") {
                this.localStorage.setItem("agentId", e.data.agentData.agentPresence.agent.id);
            }

            //

            if (e.data.type == "multimatch") {
                console.log("Multimatch");
                console.log(JSON.stringify(e.data));

                var myArray = e.data.sysID.split(",");
                var myArrayname = e.data.namelist.split(",");
                var count = myArray.length;
                let recArray = [];
                for (let i = 1; i < count; i++) {
                    recArray.push({ Id: myArray[i], Name: myArrayname[i] });
                }
                // this function is present inside user interface class
                fillMatchedRecords(recArray);

            }
            else if (e.data.phoneNumber != null && e.data.phoneNumber != "") {
                console.log("MakeCall");
                console.log(JSON.stringify(e.data));
                makeCallF(e.data.phoneNumber);


            }
        } catch (e) {
            console.log(e);
        }
    }, false);


}

function loadCrmPopup(number, index, call) {
    if (call.callType == callTypes.silentMonitorType) {
        return;
    }
    let message = {
        phoneno: number,
        myevent: "Ringing",

    }
    window.parent.postMessage(message, "*");

    /*
                openFrameAPI.setSubtitle(number);
                 window.openFrameAPI.show();
        */
    //var url ="cti.do?sysparm_caller_name=&sysparm_caller_id=&sysparm_caller_phone="+number+"&sysparm_caller_contactid=&sysparm_caller_duration=&sysparm_caller_starttime=&sysparm_caller_endtime=&sysparm_caller_calltype=";
    //var url ="cti.do?sysparm_caller_phone="+number;
    //console.log('myurl'+url);

    //openFrameAPI.openCustomURL(url);
    //---------------------------------------------------------	
    /*
    var data = null;
    
    var xhr = new XMLHttpRequest();
    
    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        console.log(this.responseText);
        var	myArr = JSON.parse(this.responseText);
    	
        if(myArr.result.type=="multimatch"){
            var myArray = myArr.result.sysID.split(",");
            var myArrayname = myArr.result.namelist.split(",");
            var count =myArray.length;
            let recArray = [];
                                for (let i = 1; i < count; i++) {
                                    recArray.push({ Id: myArray[i], Name: myArrayname[i] });
                                }
                                // this function is present inside user interface class
                                fillMatchedRecords(recArray);
            //---------------------
            URL=myArr.result.url;
            var url1=URL+myArray[1];
            currentRecordId=myArray[1];
            openFrameAPI.openCustomURL(url1);
        }else if(myArr.result.type=="singlematch"){
        currentRecordId=myArr.result.sysID;
        openFrameAPI.openCustomURL(myArr.result.url);
        }else if(myArr.result.type=="nomatch"){
        currentRecordId="";
        openFrameAPI.openCustomURL(myArr.result.url);
        }
      }
    });
    //restAPI="ServicenowCRM/Scripted restfulAPI/"+paramter
     
    //var restAPI="https://dev90366.service-now.com/api/808807/get_customer_id/customerid/"+number;
     /////var restAPI="https://dev126490.service-now.com/api/843531/get_customer_id/customerid/"+number;
    //var restAPI="https://ven05491.service-now.com/api/expe4/get_customer_id/customerid/"+number;
    //var restAPI="https://ven05490.service-now.com/api/x_expe4_expertflow/get_customer/customerid/"+number;
    /////xhr.open("GET", restAPI);
    // xhr.setRequestHeader('Accept','application/json');
    // xhr.setRequestHeader('Content-Type','application/json');
    
    // //Eg. UserName="admin", Password="admin" for this code sample.
    // xhr.setRequestHeader('Authorization', 'Basic '+btoa('admin'+':'+'admin'));
    
    
    //if(clicktoDial!=true){xhr.send(data);}
    	
        */
    //---------------------------------------------------------			
    //

    /*	setTimeout(function() {	
        	
            console.log("kkk"+document.URL);
console.log("kkk1"+window.location.href);
var hashes = window.location.href.slice(window.location.href.indexOf('%3F') + 1).split('%26');
            console.log("url_string >>"+hashes);
            let url_string  = parseQueryString(window.location.search.substring(1));
            //var origin = new URL(url_string);
            console.log("url_string >>"+JSON.stringify(url_string));
            var searchcase = url_string['sysparm_matchcase'];
                 console.log("searchcase >>"+searchcase);
                 
                // var url_string1 = window.parent.location.href;
                // console.log("url_string1 >>"+url_string1);
                 //var url_string2 = window.parent.parent.location.href;
                 //var url_string = window.parent.location.href;
                 //console.log("url_string2 >>"+url_string2 +" "+url_string);
                 
                // var url = (window.location != window.parent.location) ? document.referrer : document.location.href;
                // var currentUrl = document.referrer;
                var currentUrl1 =this.parent.location.href


                 console.log("currentUrl >>"+currentUrl1 );
                 
                 
}, 30000);
*/
}//end crmpop up

var openCRMRecrod = function (id) {
    currentRecordId = id;
    let message = {
        cid: id,
        myevent: "openrecord",

    }
    window.parent.postMessage(message, "*");
    //var url1=URL+id;
    //openFrameAPI.openCustomURL(url1);
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('%3F') + 1).split('%26');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('%3D');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}


function parseQueryString(query) {
    //var vars = query.split('&');
    var vars = query.split('%26')
    var queryString = {};
    for (var i = 0; i < vars.length; i++) {
        //var pair = vars[i].split('=');
        var pair = vars[i].split('%3D');
        var key = decodeURIComponent(pair[0]);
        var value = decodeURIComponent(pair[1]);
        if (typeof queryString[key] === 'undefined') {
            queryString[key] = decodeURIComponent(value);
        } else if (typeof queryString[key] === 'string') {
            var arr = [queryString[key], decodeURIComponent(value)];
            queryString[key] = arr;
        } else {
            queryString[key].push(decodeURIComponent(value));
        }
    }
    return queryString;
}
function consoleLog() {
    console.log(
        '@@@EF: ',
        JSON.stringify(arguments[0]) || '',
        JSON.stringify(arguments[1]) || '',
        JSON.stringify(arguments[2]) || '',
        JSON.stringify(arguments[3]) || ''
    );
}

//--------------------------------------
function handleCommunicationEvent(context) {
    console.log("Communication from Topframe", context);

    if (context.type === 'OUTGOING_CALL') {
        var contact = context.data.data.find(function (obj) {
            return obj.entity === 'customer_contact';
        });
        if (contact) {
            var match = contact.query.match(/sys_id=([0-9a-f]+)(?:&|$)/);
            if (match) {
                currentRecordId = match[1];
            }
        }

        window.openFrameAPI.show();
        consoleLog('Context: ', context);
        console.log("Click2Dial>>" + context.data.metaData.phoneNumber + '  currentRecordId>>>' + currentRecordId);

        var url = "customer_contact.do?sysparm_view=case&sys_id=" + currentRecordId;
        clicktoDial = true;
        openFrameAPI.openCustomURL(url);
        makeCallF(context.data.metaData.phoneNumber);

    }


}

function subtractSeconds(numOfSeconds, date = new Date()) {

    var date = new Date();
    var dateStr =
        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
        ("00" + date.getDate()).slice(-2) + "-" +
        date.getFullYear() + " " +
        ("00" + date.getHours()).slice(-2) + ":" +
        ("00" + date.getMinutes()).slice(-2) + ":" +
        ("00" + date.getSeconds()).slice(-2);

    var date1 = new Date(date.setSeconds(date.getSeconds() - numOfSeconds));

    var dateStr1 =
        ("00" + (date1.getMonth() + 1)).slice(-2) + "-" +
        ("00" + date1.getDate()).slice(-2) + "-" +
        date1.getFullYear() + " " +
        ("00" + date1.getHours()).slice(-2) + ":" +
        ("00" + date1.getMinutes()).slice(-2) + ":" +
        ("00" + date1.getSeconds()).slice(-2);


    return date + " " + date1 + " " + numOfSeconds;
}
function formatdate(d) {
    dformat = [(d.getMonth() + 1).padLeft(),
    d.getDate().padLeft(),
    d.getFullYear()].join('/') + ' ' +
        [d.getHours().padLeft(),
        d.getMinutes().padLeft(),
        d.getSeconds().padLeft()].join(':');

    return
}
//---------------------------------
function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

function formatDate(date) {
    return (
        [
            date.getFullYear(),
            padTo2Digits(date.getMonth() + 1),
            padTo2Digits(date.getDate()),
        ].join('-') +
        ' ' +
        [
            padTo2Digits(date.getHours()),
            padTo2Digits(date.getMinutes()),
            padTo2Digits(date.getSeconds()),
        ].join(':')
    );
}
//-----------------------------------------------------------------------------
function createActivity(callerNumber, duration, callType, description, call) {
    try {
        console.log("info", "[createActivity] started callType = " + call.response.dialog.callType + ", state = " + call.response.dialog.state)
        if (call.response.dialog.callType == "CONFERENCE" && call.response.dialog.state == "DROPPED" && call.response.dialog.participants.Participant.length !== undefined) { return; }
        if (call.response.dialog.callType == callTypes.silentMonitorType) { return; }

        console.log("info", "[createActivity] started callerNumber = " + callerNumber + ", duration = " + duration + ", callType = " + callType + ", comment = " + description);
        console.log(call);
        var convertedStartTime = new Date(getCallTime(call, "startTime"));
        convertedStartTime = formatDate(convertedStartTime);
        console.log("convertedStartTime: " + convertedStartTime);
        var convertedEndTime = new Date(getCallTime(call, "stateChange"));
        convertedEndTime = formatDate(convertedEndTime);
        console.log("convertedEndTime: " + convertedEndTime);

        /*	 var date = new Date();
    var dateStr =
      ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
      ("00" + date.getDate()).slice(-2) + "-" +
      date.getFullYear() + " " +
      ("00" + date.getHours()).slice(-2) + ":" +
      ("00" + date.getMinutes()).slice(-2) + ":" +
      ("00" + date.getSeconds()).slice(-2);
             
            var ss = subtractSeconds(duration);
            var currentTime = new Date();
            var diff = currentTime.getTime();// - stateDate.getTime();*/
        //description = description ;//+">> " +diff + ">>" + ss;
        console.log("info", "[createActivity] started callerNumber = " + callerNumber + ", duration = " + duration + ", callType = " + callType + ", comment = " + description);
        // console.log(call.response.dialog.id +" >>" +new Date(call.response.dialog.participants.Participant.startTime).toISOString().replace(/T/, ' ').replace(/\..+/, '')  + " >> " + new Date(call.response.dialog.participants.Participant.stateChangeTime).toISOString().replace(/T/, ' ').replace(/\..+/, '') ); 
        console.log(call);
        var callid = call.response.dialog.id;
        var phoneno = callerNumber;
        var contactid = currentRecordId;
        var duration = duration * 1000; //2.1*60*1000; //duration;
        //var starttime=new Date(call.response.dialog.participants.Participant.startTime).toISOString().replace(/T/, ' ').replace(/\..+/, '');
        //var endtime=new Date(call.response.dialog.participants.Participant.stateChangeTime).toISOString().replace(/T/, ' ').replace(/\..+/, '');
        var starttime = convertedStartTime;
        var endtime = convertedEndTime;
        var calltype = callType;
        let message = {
            sysparm_caller_id: callid,
            sysparm_caller_phone: callerNumber,
            sysparm_caller_contactid: contactid,
            sysparm_caller_duration: duration,
            sysparm_caller_starttime: starttime,
            sysparm_caller_endtime: endtime,
            sysparm_caller_calltype: calltype,
            sysparm_caller_desc: description,
            myevent: "Endcall"
        }
        window.parent.postMessage(message, "*");

        /*    var url ="cti.do?sysparm_caller_name=hello&sysparm_caller_id="+callid+"&sysparm_caller_phone="+callerNumber+"&sysparm_caller_contactid="+contactid+"&sysparm_caller_duration="+duration+"&sysparm_caller_starttime="+starttime+"&sysparm_caller_endtime="+endtime+"&sysparm_caller_calltype="+calltype+"&sysparm_caller_desc="+description;
            console.log('myurl'+url);
            openFrameAPI.setSubtitle(' ');
            currentRecordId="";
            clicktoDial=false;
            openFrameAPI.openCustomURL(url);
        */

        //if (currentRecordId == 0 || duration == 0)  return;
        //console.log("info", "[createActivity] started callerNumber = " + callerNumber + ", duration = " + duration + ", callType = " + callType + ", comment = " + description);
        // var isOutgoingCall = checkOutgoingCall(callType);

        // //
        // var phActivity = {};
        // //Setup basic details of the activity - subject, direction, duration
        // phActivity["subject"] = "Call Timing of User " + UserName;
        // phActivity["description"] = "description ";
        // phActivity["phonenumber"] = callerNumber;
        // phActivity["directioncode"] = isOutgoingCall;
        // //phActivity["scheduledstart"] = new Date();
        // phActivity["new_history"] = "new_history ";
        // phActivity["new_wrapup"] = "new_wrapup ";
        // phActivity["new_actualstartseconds"] = "new_actualstartseconds";
        // phActivity["new_actualendseconds"] = "new_actualendseconds";
        // phActivity["new_callduration"] = "new_callduration";
        // phActivity["new_callreference"] = "new_callreference ";
        // phActivity["new_wrapup"] = "new_wrapup ";
        // phActivity["new_callstatus"] = "new_callstatus";
        // phActivity["regardingobjectid_" + entity + "@odata.bind"] = "/" + entity + "s(" + currentRecordId + ")";
        // var us = {};

        // //If we have the CRM contact record, use it to setup the calling parties for this activity

        // us["partyid_systemuser@odata.bind"] = "/systemusers(" + userId + ")";
        // if(isOutgoingCall == true){
        // us["participationtypemask"] = (1);
        // }else{
        // us["participationtypemask"] = (2);	
        // }


        // var them = {};
        // them["partyid_" + entity + "@odata.bind"] = "/" + entity + "s(" + currentRecordId + ")";
        // if(isOutgoingCall == true){
        // them["participationtypemask"] = (2);
        // }else{
        // them["participationtypemask"] = (1);	
        // }


        // var parties = [];
        // parties[0] = us; parties[1] = them;
        // phActivity.phonecall_activity_parties = parties;

        // //	
        // var jsondata = JSON.stringify(phActivity);
        // // Creating new Account record
        // var entityLogicalName = "phonecall";

        // Microsoft.CIFramework.createRecord(entityLogicalName, jsondata).then(
        // function success(result) {
        // res = JSON.parse(result);
        // console.log("[createActivity] activity created successfully: " + res.id);
        // //perform operations on record creation
        // },
        // function (error) {
        // sendLog("error", "[createActivity] error occurred, error = " + error.message);
        // sendLog("error", "[createActivity] error occurred, stackTrace = " + error);
        // console.log(error);
        // //handle error conditions
        // }
        // );
    }
    catch (ex) {
        sendLog("error", "[createActivity] exception occurred, message = " + ex.message);
        sendLog("error", "[createActivity] exception occurred, stackTrace = " + ex);
        alert("Exception in activity creation " + ex.message);
        console.log("Exception in activity creation " + ex.message);
    }


}
















//-------------------------------------------------------------------------
function initSuccess(snConfig) {
    console.log("openframe configuration", snConfig);
    //register for communication event from TopFrame
    openFrameAPI.subscribe(openFrameAPI.EVENTS.COMMUNICATION_EVENT,
        handleCommunicationEvent);
}
function initFailure(error) {
    console.log("OpenFrame init failed..", error);
}






//------------------------------------------

// function loadCrmPopup(callData, entityIndex) {
// phone = callData;
// try {
// if (entityIndex >= entities.length) {
// var entityFormOptions = {};
// entityFormOptions["entityName"] = "contact";
// Microsoft.CIFramework.openForm(JSON.stringify(entityFormOptions)).then(
// function (success) {
// console.log(success);
// },
// function (error) {
// console.log(error);
// }
// );
// return;
// }
// entity = entities[entityIndex];
// getEntityResult(phone, entity).then(function (result) {
// console.log(result); // "Stuff worked!"
// }, function (err) {
// console.log(err); // Error: "It broke"
// // record not found in contacts
// // call account entity;
// entityIndex = entityIndex += 1;
// loadCrmPopup(callData, entityIndex);
// });
// } catch (error) {

// }
// }
// let getEntityResult = function (phone, entity) {
// try {
// return new Promise(function (resolve, reject) {
// try {
// var options = "";
// let Id = "", Name = "";
// sendLog("info", "[getEntityResult] searching record in " + entity + " entity, phone = " + phone);
// if (entity.toLowerCase() == 'account') {
// var options = "$select=AccountId,Name&$filter=Telephone1 eq '" + phone + "' or Fax eq '" + phone + "'";
// Id = "accountid";
// Name = "name";
// }
// else if (entity.toLowerCase() == 'contact' || entity.toLowerCase() == 'lead') {
// Name = "fullname";
// Id = entity.toLowerCase() + "id";
// var options = "$select=" + Id + ",fullName&$filter=Telephone1 eq '" + phone + "' or MobilePhone eq '" + phone + "'";
// }
// sendLog("info", "[getEntityResult] crm query select = " + options);
// //
// Microsoft.CIFramework.searchAndOpenRecords(entity, "?$select=" + Name + ",telephone1&$filter=telephone1 eq '" + `${phone}`+ "'", false).then(
// function success(result) {
// res = JSON.parse(result);
// count = Object.keys(res).length;
// // Print all the retrieved records on the console
// if (count == 0)
// reject(-1);
// else if (count == 1) {
// openCRMRecrod(res[0][Id]);
// }
// else if (count > 1) {
// let recArray = [];
// for (let i = 0; i < count; i++) {
// recArray.push({ Id: res[i][Id], Name: res[i][Name] });
// }
// // this function is present inside user interface class
// fillMatchedRecords(recArray);
// openCRMRecrod(recArray[0].Id);
// }
// resolve(count);
// //
// },
// function (error) {
// console.log(error.message);
// reject(error);
// }
// );
// }
// catch (e) {
// console.error("EF Connector [getContactEntityResult] Exception: " + e);
// reject(-1);
// }
// });
// } catch (error) {

// }
// }

// function accountsRetrieveComplete() {
// }
// var openCRMRecrod = function (id) {
// sendLog("info", "[openCRMRecrod] opening crm record entity = " + entity + " Id = " + id);
// currentRecordId = id;
// let entityFormOptions = {};
// entityFormOptions["entityName"] = entity;
// entityFormOptions["entityId"] = id;

// Microsoft.CIFramework.openForm(JSON.stringify(entityFormOptions)).then(
// function (success) {
// console.log(success);
// },
// function (error) {
// console.log(error);
// }
// );
// Microsoft.CIFramework.getEnvironment().then(function success(result) {
// var res = JSON.parse(result);
// //get Current Logged in Username and GUID
// UserName = res.username;
// userId = res.userId;
// userId = userId.replace(/[{}]/g, "");
// sendLog("info", "[openCRMRecrod] crm userId = " + userId);
// }, function (error) {
// console.log(error);
// });
// }
// function createActivity(callerNumber, duration, callType, description) {
// try {
// if (currentRecordId == 0 || duration == 0)
// return;
// sendLog("info", "[createActivity] started callerNumber = " + callerNumber + ", duration = " + duration + ", callType = " + callType + ", comment = " + description);
// var isOutgoingCall = checkOutgoingCall(callType);

// //
// var phActivity = {};
// //Setup basic details of the activity - subject, direction, duration
// phActivity["subject"] = "Call Timing of User " + UserName;
// phActivity["description"] = "description ";
// phActivity["phonenumber"] = callerNumber;
// phActivity["directioncode"] = isOutgoingCall;
// //phActivity["scheduledstart"] = new Date();
// phActivity["new_history"] = "new_history ";
// phActivity["new_wrapup"] = "new_wrapup ";
// phActivity["new_actualstartseconds"] = "new_actualstartseconds";
// phActivity["new_actualendseconds"] = "new_actualendseconds";
// phActivity["new_callduration"] = "new_callduration";
// phActivity["new_callreference"] = "new_callreference ";
// phActivity["new_wrapup"] = "new_wrapup ";
// phActivity["new_callstatus"] = "new_callstatus";
// phActivity["regardingobjectid_" + entity + "@odata.bind"] = "/" + entity + "s(" + currentRecordId + ")";
// var us = {};

// //If we have the CRM contact record, use it to setup the calling parties for this activity

// us["partyid_systemuser@odata.bind"] = "/systemusers(" + userId + ")";
// if(isOutgoingCall == true){
// us["participationtypemask"] = (1);
// }else{
// us["participationtypemask"] = (2);	
// }


// var them = {};
// them["partyid_" + entity + "@odata.bind"] = "/" + entity + "s(" + currentRecordId + ")";
// if(isOutgoingCall == true){
// them["participationtypemask"] = (2);
// }else{
// them["participationtypemask"] = (1);	
// }


// var parties = [];
// parties[0] = us; parties[1] = them;
// phActivity.phonecall_activity_parties = parties;

// //	
// var jsondata = JSON.stringify(phActivity);
// // Creating new Account record
// var entityLogicalName = "phonecall";

// Microsoft.CIFramework.createRecord(entityLogicalName, jsondata).then(
// function success(result) {
// res = JSON.parse(result);
// console.log("[createActivity] activity created successfully: " + res.id);
// //perform operations on record creation
// },
// function (error) {
// sendLog("error", "[createActivity] error occurred, error = " + error.message);
// sendLog("error", "[createActivity] error occurred, stackTrace = " + error);
// console.log(error);
// //handle error conditions
// }
// );
// }
// catch (ex) {
// sendLog("error", "[createActivity] exception occurred, message = " + ex.message);
// sendLog("error", "[createActivity] exception occurred, stackTrace = " + ex);
// // alert("Exception in activity creation " + ex.message);
// console.log("Exception in activity creation " + ex.message);
// }


// }

// function checkOutgoingCall(callType)
// {
// if(callType == callTypes.outboundType || callType == callTypes.outboundType2 || callType == callTypes.outboundCampaignType || callType == callTypes.outboundPreviewCampaignTypeCCE || callType == callTypes.outboundPreviewCampaignTypeCCX)
// {
// console.log("It is an outgoing call");
// return true;
// }
// console.log("This is an incoming call");
// return false;
// }

// function triggerAction(callerNumber, duration, callType, description) {
// try {
// if (entity.Id == 0)
// return;
// var userId = Xrm.Page.context.getUserId();
// var parameters = {
// Subject: "Auto Activity using Actions",
// PhoneNumber: callerNumber,
// Direction: callType === "OutboundCall",
// Time: Math.ceil(duration / 60),
// Description: description,
// From: { accountid: entity.Id },
// To: { systemuserid: userId },
// };
// // parameters.EntityName = "account";
// var req = new XMLHttpRequest();
// req.open("POST", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/new_CreateActivity", true);
// req.setRequestHeader("OData-MaxVersion", "4.0");
// req.setRequestHeader("OData-Version", "4.0");
// req.setRequestHeader("Accept", "application/json");
// req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
// req.onreadystatechange = function () {
// if (this.readyState === 4) {
// req.onreadystatechange = null;
// if (this.status === 200) {
// var results = JSON.parse(this.response);
// } else {
// Xrm.Utility.alertDialog(this.statusText);
// }
// }
// };
// req.send(JSON.stringify(parameters));
// } catch (error) {
// console.log("Error in triggerACtion: " + error.message);
// }

// }
// onCallAnswer = function (callData) {
// console.log("[onCallAnswer]", callData);
// sendLog("info", "[onCallAnswer] data = " + callData);
// }
// onClick2Call = function (phoneNumber) {
// sendLog("info", "[onClick2Call] data = " + phoneNumber);
// makeCallF(phoneNumber);
// }
// // XRM.page We can get the current page info using this liberary.

// function clickToActHandler(paramStr) {
// //return new Promise(function (resolve, reject) {
// try {

// let params = JSON.parse(paramStr);
// var phNo = params.value;   //Retrieve the phone number to dial from parameters passed by CIF
// if (phNo != null && phNo != "") {
// if (agent.state == agentState.READY || agent.calls.length > 0) {
// showErrorMessage("CF_INVALID_AGENT_WORKMODE", "Invalid State");
// msg = "EF Cti Connector: [windwo.addEventListener] cannot make call in READY state or during another call";
// sendLog("info", msg);
// return;
// }
// else {
// console.log("EF Cti Connector: [Microsoft.CIFramework.clickToActHandler] agent make call on " + phNo);
// onClick2Call(phNo);
// }
// }
// }
// catch (error) {
// console.log(error);
// }
// }
function initCTI() {
    //   Microsoft.CIFramework.setClickToAct(true);
    //   Microsoft.CIFramework.addHandler("onclicktoact", clickToActHandler);
}
function ReadyPostMessage() {
    var agentId = localStorage.getItem("agentId");
    var obj = {
        event: "Connector_Event",
        agentData: {
            agentId: agentId,
            action: "agentState",
            state: "READY"
        }
    }
    window.postMessage(obj, "*");
    console.log("postMessasge sent ",obj);
}
function NotReadyPostMessage() {
    var agentId = localStorage.getItem("agentId");
    var obj = {
        event: "Connector_Event", agentData: {
            agentId: agentId,
            action: "agentState",
            state: "NOT_READY"
        }
    }
    window.postMessage(obj, "*");
    console.log("postMessasge sent ",obj);
}
function LogoutPostMessage() {
    var agentId = localStorage.getItem("agentId");
    var obj = {
        event: "Connector_Event", agentData: {
            agentId: agentId,
            action: "agentState",
            state: "LOGOUT"
        }
    }
    window.postMessage(obj, "*");
    console.log("postMessasge sent ",obj);
}