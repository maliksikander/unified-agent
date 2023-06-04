import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import { SipService } from 'src/app/services/sip.service';

@Component({
  selector: 'app-call-controls',
  templateUrl: './call-controls.component.html',
  styleUrls: ['./call-controls.component.scss']
})
export class CallControlsComponent implements OnInit {

  minutes: number;
  seconds: number;
  fullView = false;
  customerNumber: String = '448844';
  constructor(public dialogRef: MatDialogRef<CallControlsComponent>,
    private _sipService: SipService) { }

  ngOnInit() {
    this._sipService.getTimer().subscribe(value => {
      this.minutes = Math.floor(value / 60);
      this.seconds = value % 60;
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  endCallOnSip(){
    console.log('on End Call Request==>');
    this.stopTimer();
    this._sipService.endCallOnSip();
    this.dialogRef.close();
  }


  holdCallOnSip(){
    this._sipService.holdCallOnSip();
  }

  resumeCallOnSip() {
    this._sipService.resumeCallOnSip();
  }

  stopTimer(): void {
    this._sipService.stopTimer();
  }
}
