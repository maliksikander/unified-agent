import {Component, OnInit, Inject, Input} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { cacheService } from "src/app/services/cache.service";
import { finesseService } from "src/app/services/finesse.service";
import { SipService } from "src/app/services/sip.service";
import {sharedService} from '../../services/shared.service';

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
    public _sipService: SipService,
    public _finesseService: finesseService,
    public _sharedService: sharedService,
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
    console.log('=================>>>>>>>>', this._sharedService.isCompactView);

    this._sipService._isActiveSub.subscribe((val) => {
      if (val == false) this.cancel();
    });
    if (this.data.conversation) this.getVoiceChannelSession();
  }

  cancel() {
    this.dialogRef.close();
  }

  endCallOnSip() {
    console.log("on End Call Request==>");
    // this.stopTimer();
    this._sipService.endCallOnSip();
    this.dialogRef.close();
  }

  holdCallOnSip() {
    this._sipService.holdCallOnSip();
  }

  resumeCallOnSip() {
    this._sipService.resumeCallOnSip();
  }

  muteUnmuteCall() {
    if (this._sipService.isMuted) {
      this._sipService.unmuteCallOnSip();
    } else {
      this._sipService.muteCallOnSip();
    }
  }

  // stopTimer(): void {
  //   this._sipService.stopTimer();
  // }

  getVoiceChannelSession() {
    try {
      this.cxVoiceSession = this.data.conversation.activeChannelSessions.find((channelSession) => {
        return channelSession.channel.channelType.name.toLowerCase() === "cx_voice";
      });
      if (this.cxVoiceSession) {
        const cacheId = `${this._cacheService.agent.id}:${this.cxVoiceSession.id}`;
        const cacheDialog: any = this._sipService.getDialogFromCache(cacheId);
        if (cacheDialog) {
          const currentParticipant = this._sipService.getCurrentParticipantFromDialog(cacheDialog.dialog);
          const startTime = new Date(currentParticipant.startTime);
          this._sipService.timeoutId = setInterval(() => {
            const currentTime = new Date();
            const timedurationinMS = currentTime.getTime() - startTime.getTime();
            this.msToHMS(timedurationinMS);
          }, 1000);
        } else {
          console.log("No Dialog Found==>");
        }
      } else {
        clearInterval(this._sipService.timeoutId);
      }
    } catch (e) {
      console.error("[getVoiceChannelSession] Error:", e);
    }
  }

  msToHMS(ms) {
    try {
      // Convert to seconds:
      let sec = Math.floor(ms / 1000);
      // Extract hours:
      const hours = Math.floor(sec / 3600); // 3,600 seconds in 1 hour
      sec %= 3600; // seconds remaining after extracting hours
      // Extract minutes:
      const min = Math.floor(sec / 60); // 60 seconds in 1 minute
      // Keep only seconds not extracted to minutes:
      sec %= 60;
      if (hours > 0) {
        this.timer = `${this.formatNumber(hours)}:${this.formatNumber(min)}:${this.formatNumber(sec)}`;
      } else {
        this.timer = `${this.formatNumber(min)}:${this.formatNumber(sec)}`;
      }
    } catch (e) {
      console.error("[msToHMS] Error:", e);
    }
  }

  formatNumber(num) {
    return num.toString().padStart(2, "0");
  }
}
