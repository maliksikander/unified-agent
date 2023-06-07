import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { cacheService } from "src/app/services/cache.service";
import { finesseService } from "src/app/services/finesse.service";
import { SipService } from "src/app/services/sip.service";

@Component({
  selector: "app-call-controls",
  templateUrl: "./call-controls.component.html",
  styleUrls: ["./call-controls.component.scss"]
})
export class CallControlsComponent implements OnInit {
  // minutes: number;
  // seconds: number;
  // hours: number;
  timer = "00:00";
  fullView = false;
  customerNumber: any = this._sipService.customerNumber;
  // ciscoVoiceSession;
  cxVoiceSession;

  constructor(
    public _cacheService: cacheService,
    public dialogRef: MatDialogRef<CallControlsComponent>,
    private _sipService: SipService,
    public _finesseService: finesseService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // console.log("data==>",this.data)
  }

  ngOnInit() {
    // this._sipService.getTimer().subscribe((value) => {
    //   this.hours = Math.floor(value / 3600);
    //   this.minutes = Math.floor(value / 60);
    //   this.seconds = value % 60;
    // });

    this._sipService._isActiveSub.subscribe((val) => {
      if (val == false) this.cancel();
    });
    console.log("data1==>", this.data);
    if (this.data.conversation) this.getVoiceChannelSession();
  }

  cancel() {
    this.dialogRef.close();
  }

  endCallOnSip() {
    console.log("on End Call Request==>");
    this.stopTimer();
    this._sipService.endCallOnSip();
    this.dialogRef.close();
  }

  holdCallOnSip() {
    this._sipService.holdCallOnSip();
  }

  resumeCallOnSip() {
    this._sipService.resumeCallOnSip();
  }

  stopTimer(): void {
    this._sipService.stopTimer();
  }

  getVoiceChannelSession() {
    try {
      this.cxVoiceSession = this.data.conversation.activeChannelSessions.find((channelSession) => {
        if (channelSession.channel.channelType.name.toLowerCase() == "cx_voice") {
          return channelSession;
        }
      });
      if (this.cxVoiceSession) {
        let cacheId = `${this._cacheService.agent.id}:${this.cxVoiceSession.id}`;
        let cacheDialog: any = this._sipService.getDialogFromCache(cacheId);
        if (cacheDialog) {
          let currentParticipant = this._sipService.getCurrentParticipantFromDialog(cacheDialog.dialog);
          let startTime = new Date(currentParticipant.startTime);
          this._sipService.timeoutId = setInterval(() => {
            let currentTime = new Date();
            let timedurationinMS = currentTime.getTime() - startTime.getTime();
            this.msToHMS(timedurationinMS);
          }, 1000);
        } else {
          console.log("No Dialog Found==>");
        }
      } else {
        // if (this._finesseService.timeoutId) clearInterval(this._finesseService.timeoutId);
        if (this._sipService.timeoutId) clearInterval(this._sipService.timeoutId);
      }
    } catch (e) {
      console.error("[getVoiceChannelSession] Error :", e);
    }
  }

  msToHMS(ms) {
    try {
      // 1- Convert to seconds:
      let sec = ms / 1000;
      // 2- Extract hours:
      const hours = parseInt(JSON.stringify(sec / 3600)); // 3,600 seconds in 1 hour
      sec = sec % 3600; // seconds remaining after extracting hours
      // 3- Extract minutes:
      const min = parseInt(JSON.stringify(sec / 60)); // 60 seconds in 1 minute
      // 4- Keep only seconds not extracted to minutes:
      sec = Math.floor(sec % 60);

      if (hours > 0) {
        this.hourTimer(hours, min, sec);
      } else {
        if (min >= 10 && sec < 10) {
          this.timer = `${min}:0${sec}`;
        } else if (min < 10 && sec >= 10) {
          this.timer = `0${min}:${sec}`;
        } else if (min > 0 && min < 10 && sec < 10) {
          this.timer = `0${min}:0${sec}`;
        } else if (min == 0 && min < 10 && sec < 10) {
          this.timer = `0${min}:0${sec}`;
        } else {
          this.timer = `${min}:${sec}`;
        }
      }
    } catch (e) {
      console.error("[msToHMS] Error:", e);
    }
  }

  hourTimer(hour, min, sec) {
    try {
      if (hour > 0 && hour < 10) {
        if (min >= 10 && sec < 10) {
          this.timer = `0${hour}:${min}:0${sec}`;
        } else if (min < 10 && sec >= 10) {
          this.timer = `0${hour}0${min}:${sec}`;
        } else if (min > 0 && min < 10 && sec < 10) {
          this.timer = `0${hour}0${min}:0${sec}`;
        } else if (min == 0 && min < 10 && sec < 10) {
          this.timer = `0${hour}0${min}:0${sec}`;
        } else {
          this.timer = `${hour}:${min}:${sec}`;
        }
      } else {
        if (min >= 10 && sec < 10) {
          this.timer = `${hour}:${min}:0${sec}`;
        } else if (min < 10 && sec >= 10) {
          this.timer = `${hour}0${min}:${sec}`;
        } else if (min > 0 && min < 10 && sec < 10) {
          this.timer = `${hour}0${min}:0${sec}`;
        } else if (min == 0 && min < 10 && sec < 10) {
          this.timer = `${hour}0${min}:0${sec}`;
        } else {
          this.timer = `${hour}:${min}:${sec}`;
        }
      }
    } catch (e) {
      console.error("[hourTimer] Error :", e);
    }
  }
}
