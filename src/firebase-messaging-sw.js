// if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {

// } else {
console.log("injecting firebase")
importScripts("https://www.gstatic.com/firebasejs/9.6.7/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.7/firebase-messaging-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.7/firebase-database-compat.js");


firebase.initializeApp({
    apiKey: "AIzaSyApodsyaDqBnsM19lJL4ZEYfORMAECtw7o",
    authDomain: "cordovaapp-a330b.firebaseapp.com",
    databaseURL: "https://cordovaapp-a330b-default-rtdb.firebaseio.com",
    projectId: "cordovaapp-a330b",
    storageBucket: "cordovaapp-a330b.appspot.com",
    messagingSenderId: "395337223344",
    appId: "1:395337223344:web:d1f840be8259f97ea73f75",
    measurementId: "G-KW34XWFBFJ"
});
const messaging = firebase.messaging();


// Since I can connect from multiple devices or browser tabs, we store each connection instance separately
// any time that connectionsRef's value is null (i.e. has no children) I am offline
// var myConnectionsRef = firebase.database().ref('users/joe/connections');

// // stores the timestamp of my last disconnect (the last time I was seen online)
// var lastOnlineRef = firebase.database().ref('users/joe/lastOnline');

// var connectedRef = firebase.database().ref('.info/connected');
// connectedRef.on('value', (snap) => {
//   if (snap.val() === true) {
//     // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
//     var con = myConnectionsRef.push();

//     // When I disconnect, remove this device
//     con.onDisconnect().remove();

//     // Add this device to my connections list
//     // this value could contain info about the device or a timestamp too
//     con.set(true);

//     // When I disconnect, update the last time I was seen online
//     lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
//   }
// }); 

// var database = firebase.database();
// var root = database.ref();

// var amOnline = new firebase('https://cordovaapp-a330b-default-rtdb.firebaseio.com/.info/connected');
// var userRef = new firebase('https://cordovaapp-a330b-default-rtdb.firebaseio.com/presence/' + userid);
// amOnline.on('value', function (snapshot) {
//     if (snapshot.val()) {
//         userRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
//         userRef.set(true);
//     } 
// });

// var connectedRef = firebase.database().ref(".info/connected");
// connectedRef.on("value", (snap) => {
//     if (snap.val() === true) {
//         console.log("connected");


//         fetch('https://622a709d14ccb950d21c7f70.mockapi.io/status', {
//             method: 'POST',
//             headers: {
//                 'Accept': 'application/json, text/plain, */*',
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify([{ 'status': 'connected' }])
//         });


//     } else {

//         fetch('https://622a709d14ccb950d21c7f70.mockapi.io/status', {
//             method: 'POST',
//             headers: {
//                 'Accept': 'application/json, text/plain, */*',
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify([{ 'status': 'not connected' }])
//         })
//         console.log("not connected");
//     }
// });

    // messaging.onBackgroundMessage((payload) => {
    //    // console.log('[firebase-messaging-sw.js] Received background message ', payload);
    //     // Customize notification here
    //     const notificationTitle = payload.data.title;
    //     const notificationOptions = {
    //         body: payload.data.body

    //     };

    //     self.registration.showNotification(notificationTitle,
    //         notificationOptions);
    // });
//}
