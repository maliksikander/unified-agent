import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {VgControlsModule} from 'videogular2/compiled/src/controls/controls';

@Component({
  selector: 'app-call-controls',
  templateUrl: './call-controls.component.html',
  styleUrls: ['./call-controls.component.scss']
})
export class CallControlsComponent implements OnInit {

  fullView = true;
  videoSrc = '';
  isVideoCam = true;
  isMute = false;
  isVideoCall = false;
  isAudioCall = true;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<CallControlsComponent>) { }

  ngOnInit() {
    console.log(this.data, 'data cont')

    this.videoSrc = this.data.source;
    this.isVideoCam = this.data.isVideoCam;
    this.isMute = this.data.isMute;
    this.isVideoCall = this.data.isVideoCall;
    this.isAudioCall = this.data.isAudioCall;
  }
  cancel() {
    this.dialogRef.close();
  }
}
