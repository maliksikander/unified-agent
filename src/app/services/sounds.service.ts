import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class soundService {
  beep = new Audio("assets/sounds/beep.mp3");
  ring = new Audio("assets/sounds/ring.mp3");

  playBeep() {
    try {
      this.beep.play();
    } catch (err) {
      console.error("error on play beep " + err);
    }
  }

  playRing() {
    try {
      this.ring.play();
    } catch (err) {
      console.error("error on play ring " + err);
    }
  }

  stopRing() {
    try {
      this.ring.pause();
    } catch (err) {
      console.error("error on pause ring " + err);
    }
  }

  openBrowserNotification(head, message) {
    if (!Notification) {
      console.log("Browser does not support notifications.");
    } else {
      // check if permission is already granted
      if (Notification.permission === "granted") {
        // show notification here
        var notify = new Notification(head, {
          icon: "",
          body: message
        });
      } else {
        // request permission from user
        Notification.requestPermission()
          .then(function (p) {
            if (p === "granted") {
              // show notification here
              var notify = new Notification(head, {
                icon: "",
                body: message
              });
            } else {
              console.log("User blocked notifications.");
            }
          })
          .catch(function (err) {
            console.error(err);
          });
      }
    }
  }
}
