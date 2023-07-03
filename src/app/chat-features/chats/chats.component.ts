import { Component, OnInit } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material";
import { httpService } from "src/app/services/http.service";
import { sharedService } from "src/app/services/shared.service";
import { socketService } from "src/app/services/socket.service";

@Component({
  selector: "app-chats",
  templateUrl: "./chats.component.html",
  styleUrls: ["./chats.component.scss"]
})
export class ChatsComponent implements OnInit {
  // conversations = [];
  barExpand = false;
  slaTime: number = 30;
  timeLeft: number = 0;
  interval;
  slaTimeValue;
  slaCircleTime = 0;
  // labels :Array<any>=[];
  constructor(private _httpService: httpService, public _socketService: socketService, public _sharedService: sharedService) {}
  ngOnInit() {
    // this.loadLabels()
    this.startWrapUpTimer();
  }
  // loadLabels() {
  //   this._httpService.getLabels().subscribe((e) => {
  //     this.labels = e;
  //   });
  // }

  currentTabIndex;
  tabChanged(event: MatTabChangeEvent) {
    let index = event.index;
    this.currentTabIndex = index;
    this._sharedService.matCurrentTabIndex = index;
  }

  startWrapUpTimer() {
    this.slaCircleTime = this.slaTime*1000;
    console.log(this.slaCircleTime, 'this.slaCircleTimeup');

    this.timeLeft = this.slaTime;
    this.slaTimeValue = '#49BE00';
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;

        // if (this.timeLeft == this.slaTime / 2) {
        //   // this.slaTimeValue = 'green';
        //   console.log(this.timeLeft, 'this.slaTimeValue', this.slaTime, this.slaTimeValue);
        // }
        if (this.timeLeft == this.slaTime / 2) {
          // console.log(this.timeLeft, 'this.slaTimeValue', this.slaTime, this.slaTimeValue);
          this.slaTimeValue = '#FFAA00';
        }
        if (this.timeLeft == 0) {
          // console.log(this.timeLeft, 'this.slaTimeValue', this.slaTime, this.slaTimeValue)
          this.slaTimeValue = '#BE0000';
          this.slaTime = 0;
          this.slaCircleTime = 0;

        }

      }
    }, 1000);
  }
}
