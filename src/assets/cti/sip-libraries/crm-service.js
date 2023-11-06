

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

window.addEventListener("message", function(event) {
    // Check if the message is from the same origin (optional)
    
        // Handle the message her
        console.log("Received a message from the same app:", event.data);
    
});