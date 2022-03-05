if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {

} else {
    console.log("injecting firebase")
    importScripts("https://www.gstatic.com/firebasejs/9.6.7/firebase-app-compat.js");
    importScripts("https://www.gstatic.com/firebasejs/9.6.7/firebase-messaging-compat.js");

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

    // messaging.onBackgroundMessage((payload) => {
    //     console.log('[firebase-messaging-sw.js] Received background message ', payload);
    //     // Customize notification here
    //     const notificationTitle = payload.notification.title;
    //     const notificationOptions = {
    //         body: payload.notification.body

    //     };

    //     self.registration.showNotification(notificationTitle,
    //         notificationOptions);
    // });
}
